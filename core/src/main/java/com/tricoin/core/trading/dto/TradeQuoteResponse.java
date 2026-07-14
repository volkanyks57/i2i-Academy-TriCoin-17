package com.tricoin.core.trading.dto;

import java.math.BigDecimal;

/**
 * Returned when a user requests a price quote before trading.
 * The price is locked in Redis for validForSeconds — the client
 * should show this exact price in the buy/sell modal and warn the
 * user once it's close to expiring.
 */
public record TradeQuoteResponse(
    String symbol,
    BigDecimal price,
    int validForSeconds
) {}