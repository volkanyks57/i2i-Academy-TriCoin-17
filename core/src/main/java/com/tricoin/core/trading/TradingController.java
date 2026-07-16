package com.tricoin.core.trading;

import com.tricoin.core.trading.dto.TradeQuoteResponse;
import com.tricoin.core.trading.dto.TradeRequest;
import com.tricoin.core.trading.dto.TradeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
public class TradingController {

    private final TradingService tradingService;

    @GetMapping("/quote/{symbol}")
    public ResponseEntity<?> quote(
        @RequestAttribute("username") String username,
        @PathVariable String symbol
    ) {
        try {
            TradeQuoteResponse quote = tradingService.getQuote(username, symbol);
            return ResponseEntity.ok(quote);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "QUOTE_FAILED", "message", e.getMessage()));
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<?> execute(
        @RequestAttribute("username") String username,
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
    public ResponseEntity<?> history(@RequestAttribute("username") String username) {
        List<Transaction> transactions = tradingService.getUserTransactions(username);
        return ResponseEntity.ok(Map.of("transactions", transactions));
    }
}