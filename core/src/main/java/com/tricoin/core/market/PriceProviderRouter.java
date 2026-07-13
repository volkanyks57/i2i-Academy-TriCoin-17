package com.tricoin.core.market;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
@Slf4j
public class PriceProviderRouter {

    private final BinancePriceProvider primaryProvider;
    private final TickerEngine fallbackProvider;

    public PriceProviderRouter(BinancePriceProvider primaryProvider, TickerEngine fallbackProvider) {
        this.primaryProvider = primaryProvider;
        this.fallbackProvider = fallbackProvider;
    }

    public Map<String, BigDecimal> fetchLatestPrices() {
        try {
            Map<String, BigDecimal> prices = primaryProvider.fetchLatestPrices();
            log.info("Prices fetched from {}", primaryProvider.getProviderName());
            return prices;
        } catch (Exception e) {
            log.warn("{} failed ({}), falling back to {}",
                primaryProvider.getProviderName(),
                e.getMessage(),
                fallbackProvider.getProviderName());
            return fallbackProvider.fetchLatestPrices();
        }
    }
}