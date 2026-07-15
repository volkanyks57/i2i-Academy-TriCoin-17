package com.tricoin.core.market;

import java.util.Map;

public interface PriceProvider {
    Map<String, MarketTicker> fetchLatestPrices();
    String getProviderName();
}