package com.tricoin.core.market;

import java.util.Map;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PriceProviderRouter {

    private final BinancePriceProvider primaryProvider;
    private final TickerEngine fallbackProvider;

    public PriceProviderRouter(BinancePriceProvider primaryProvider, TickerEngine fallbackProvider) {
        this.primaryProvider = primaryProvider;
        this.fallbackProvider = fallbackProvider;
    }

    public Map<String, MarketTicker> fetchLatestPrices() {
        try {
            // Burası artık BinancePriceProvider'da güncellediğin listedeki tüm coinleri çekecek!
            Map<String, MarketTicker> prices = primaryProvider.fetchLatestPrices();
            log.info("Prices fetched from {}. Total coins: {}", primaryProvider.getProviderName(), prices.size());
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