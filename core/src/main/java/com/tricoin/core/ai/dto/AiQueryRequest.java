package com.tricoin.core.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiQueryRequest(
    @NotBlank
    @Size(max = 1000, message = "Question must be at most 1000 characters")
    String message
) {}