package com.tricoin.core.trading.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeResponse(
    Long transactionId,
    String symbol,
    String side,
    BigDecimal amount,
    BigDecimal pricePerUnit,
    BigDecimal totalValue,
    BigDecimal newBalanceUsd,
    LocalDateTime createdAt
) {}