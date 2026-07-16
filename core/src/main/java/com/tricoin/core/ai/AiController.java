package com.tricoin.core.ai;

import com.tricoin.core.ai.dto.AiQueryRequest;
import com.tricoin.core.ai.dto.AiQueryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiInsightsService aiInsightsService;

    @PostMapping("/query")
    public ResponseEntity<?> query(
        @RequestAttribute("username") String username,
        @Valid @RequestBody AiQueryRequest request
    ) {
        try {
            String response = aiInsightsService.answer(username, request.message());
            return ResponseEntity.ok(new AiQueryResponse(response));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                    "error", "LLM_UNAVAILABLE",
                    "message", e.getMessage()
                ));
        }
    }
}