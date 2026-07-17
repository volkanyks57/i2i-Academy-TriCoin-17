package com.tricoin.core.ai.dto;

import java.util.List;

public record HealthScoreResponse(
    int score,
    String summary,
    List<String> strengths,
    List<String> risks
) {}