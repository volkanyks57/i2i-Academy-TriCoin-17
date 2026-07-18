package com.tricoin.core.trading;

import com.tricoin.core.auth.User;
import com.tricoin.core.auth.UserRepository;
import com.tricoin.core.auth.Wallet;
import com.tricoin.core.auth.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestAttribute;

import java.util.List;
import java.util.Map;

/**
 * Exposes the authenticated user's current USD balance and crypto holdings.
 * The trade modal needs this to decide whether to show Buy, Sell, or both.
 */
@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final CryptoHoldingRepository cryptoHoldingRepository;

    @GetMapping
    public ResponseEntity<?> getPortfolio(@RequestAttribute("username") String username) {
        try {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));

            Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Wallet not found"));

            List<CryptoHolding> holdings = cryptoHoldingRepository.findByUserId(user.getId());

            List<Map<String, Object>> holdingList = holdings.stream()
                .map(h -> Map.<String, Object>of(
                    "symbol", h.getSymbol(),
                    "amount", h.getAmount()
                ))
                .toList();

            return ResponseEntity.ok(Map.of(
                "balanceUsd", wallet.getBalanceUsd(),
                "holdings", holdingList
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "PORTFOLIO_NOT_FOUND", "message", e.getMessage()));
        }
    }
}