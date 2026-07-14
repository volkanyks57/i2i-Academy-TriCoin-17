package com.tricoin.core.trading;

import com.tricoin.core.trading.dto.TradeRequest;
import com.tricoin.core.trading.dto.TradeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Trading endpoints. All routes here require a valid JWT — the
 * JwtAuthenticationFilter puts the username into the SecurityContext,
 * and @AuthenticationPrincipal pulls it out cleanly.
 */
@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
public class TradingController {

    private final TradingService tradingService;

    @PostMapping("/execute")
    public ResponseEntity<?> execute(
        @AuthenticationPrincipal String username,
        @Valid @RequestBody TradeRequest request
    ) {
        try {
            TradeResponse response = tradingService.executeTrade(username, request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "TRADE_FAILED", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "INVALID_REQUEST", "message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(@AuthenticationPrincipal String username) {
        // The service will resolve the user; the controller just needs
        // to translate the username into the caller's transaction list.
        List<Transaction> transactions = tradingService.getUserTransactions(username);
        return ResponseEntity.ok(Map.of("transactions", transactions));
    }
}