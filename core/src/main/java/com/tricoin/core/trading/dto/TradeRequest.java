package com.tricoin.core.trading.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record TradeRequest(
    @NotBlank String symbol,
    @NotBlank @Pattern(regexp = "BUY|SELL", message = "Side must be BUY or SELL") String side,
    @NotNull @DecimalMin(value = "0.00000001", message = "Amount must be positive") BigDecimal amount
) {}