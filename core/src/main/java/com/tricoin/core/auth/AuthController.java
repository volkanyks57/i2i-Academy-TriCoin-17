package com.tricoin.core.auth;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tricoin.core.auth.dto.AuthResponse;
import com.tricoin.core.auth.dto.LoginRequest;
import com.tricoin.core.auth.dto.RegisterRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


/**
 * Handles user registration and login.
 * Passwords are hashed with bcrypt before touching PostgreSQL — never
 * stored or logged in plain text. Redis holds only the resulting session
 * token, never credentials.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // Random starting balance range, per the assignment requirement
    // that every new user gets an automatically assigned balance.
    private static final BigDecimal MIN_STARTING_BALANCE = new BigDecimal("1000");
    private static final BigDecimal MAX_STARTING_BALANCE = new BigDecimal("10000");

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SessionService sessionService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Username already taken");
        }

        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Bu e-posta adresi zaten kullanılıyor");
        }

        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Bu telefon numarası zaten kullanılıyor");
        }

        User user = User.builder()
            .username(request.username())
            .email(request.email())
            .phoneNumber(request.phoneNumber())
            .passwordHash(passwordEncoder.encode(request.password()))
            .build();
        user = userRepository.save(user);

        

        Wallet wallet = Wallet.builder()
            .userId(user.getId())
            .balanceUsd(randomStartingBalance())
            .updatedAt(LocalDateTime.now())
            .build();
        walletRepository.save(wallet);

       

        return ResponseEntity.status(HttpStatus.CREATED)
            .body("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            // Same error for "no such user" and "wrong password" —
            // don't leak which one it was.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid username or password");
        }

        String token = jwtService.generateToken(user.getUsername());
        sessionService.storeSession(token, user.getUsername());

        return ResponseEntity.ok(new AuthResponse(token, user.getUsername()));
    }

    private BigDecimal randomStartingBalance() {
        SecureRandom random = new SecureRandom();
        double range = MAX_STARTING_BALANCE.subtract(MIN_STARTING_BALANCE).doubleValue();
        double randomAmount = MIN_STARTING_BALANCE.doubleValue() + (random.nextDouble() * range);
        return BigDecimal.valueOf(randomAmount).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}