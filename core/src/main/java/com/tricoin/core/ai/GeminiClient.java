package com.tricoin.core.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Thin HTTP client for Google Gemini's REST API.
 * Uses Java's built-in HttpClient (JDK 11+) which handles modern TLS
 * requirements more reliably than the legacy HttpURLConnection stack.
 */
@Component
@Slf4j
public class GeminiClient {

    private static final String API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiClient(
        @Value("${gemini.api-key}") String apiKey,
        @Value("${gemini.model}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .version(HttpClient.Version.HTTP_2)
            .build();
    }

    public String generate(String prompt) {
        String url = API_BASE + "/" + model + ":generateContent?key=" + apiKey;

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
                ))
            ));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini returned {}: {}", response.statusCode(), response.body());
                throw new IllegalStateException("Gemini API Error (" + response.statusCode() + "): " + response.body());
            }

            return extractText(response.body());
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("Gemini API Error")) {
                throw new IllegalStateException(e.getMessage(), e);
            }
            throw new IllegalStateException("AI service temporarily unavailable: " + e.getMessage(), e);
        }
    }

    private String extractText(String jsonBody) throws Exception {
        JsonNode root = objectMapper.readTree(jsonBody);
        JsonNode textNode = root.path("candidates").path(0)
            .path("content").path("parts").path(0).path("text");

        if (textNode.isMissingNode()) {
            throw new IllegalStateException("Gemini response missing expected fields");
        }

        return textNode.asText();
    }
}