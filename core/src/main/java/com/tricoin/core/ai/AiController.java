package com.tricoin.core.ai;

import com.tricoin.core.ai.dto.AiQueryRequest;
import com.tricoin.core.ai.dto.AiQueryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * AI insights endpoint. Requires a valid JWT — the LLM answers are always
 * scoped to the authenticated user's own portfolio and transaction history.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiInsightsService aiInsightsService;

    @PostMapping("/query")
    public ResponseEntity<?> query(
        @AuthenticationPrincipal String username,
        @Valid @RequestBody AiQueryRequest request
    ) {
        try {
            String response = aiInsightsService.answer(username, request.message());
            return ResponseEntity.ok(new AiQueryResponse(response));
        } catch (IllegalStateException e) {
            // LLM unreachable, rate-limited, or user context missing —
            // return a clean structured error rather than a 500.
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                    "error", "LLM_UNAVAILABLE",
                    "message", e.getMessage()
                ));
        }
    }
}