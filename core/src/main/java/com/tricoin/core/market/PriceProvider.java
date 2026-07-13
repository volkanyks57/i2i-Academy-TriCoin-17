package com.tricoin.core.market;

import java.math.BigDecimal;
import java.util.Map;

public interface PriceProvider {
    Map<String, BigDecimal> fetchLatestPrices();
    String getProviderName();
}