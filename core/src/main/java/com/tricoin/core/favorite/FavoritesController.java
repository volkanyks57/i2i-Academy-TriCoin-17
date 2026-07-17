package com.tricoin.core.favorite;

import com.tricoin.core.auth.User;
import com.tricoin.core.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoritesController {

    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;

    @GetMapping
    public ResponseEntity<?> list(@RequestAttribute("username") String username) {
        try {
            User user = resolveUser(username);
            List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            List<String> symbols = favorites.stream().map(Favorite::getSymbol).toList();
            return ResponseEntity.ok(Map.of("favorites", symbols));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "USER_NOT_FOUND", "message", e.getMessage()));
        }
    }

    @PostMapping("/{symbol}")
    public ResponseEntity<?> add(
        @RequestAttribute("username") String username,
        @PathVariable String symbol
    ) {
        try {
            User user = resolveUser(username);
            String normalized = symbol.toUpperCase();

            if (favoriteRepository.findByUserIdAndSymbol(user.getId(), normalized).isPresent()) {
                return ResponseEntity.ok(Map.of("status", "already_favorited"));
            }

            Favorite favorite = Favorite.builder()
                .userId(user.getId())
                .symbol(normalized)
                .build();
            favoriteRepository.save(favorite);
            return ResponseEntity.ok(Map.of("status", "added", "symbol", normalized));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "USER_NOT_FOUND", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{symbol}")
    @Transactional
    public ResponseEntity<?> remove(
        @RequestAttribute("username") String username,
        @PathVariable String symbol
    ) {
        try {
            User user = resolveUser(username);
            favoriteRepository.deleteByUserIdAndSymbol(user.getId(), symbol.toUpperCase());
            return ResponseEntity.ok(Map.of("status", "removed", "symbol", symbol.toUpperCase()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "USER_NOT_FOUND", "message", e.getMessage()));
        }
    }

    private User resolveUser(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}