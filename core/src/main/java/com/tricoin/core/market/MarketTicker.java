package com.tricoin.core.market;

import java.math.BigDecimal;

public record MarketTicker(
    BigDecimal price,
    BigDecimal change24h
) {}