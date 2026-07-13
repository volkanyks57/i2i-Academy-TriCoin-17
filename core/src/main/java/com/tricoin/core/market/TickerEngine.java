package com.tricoin.core.market;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class TickerEngine implements PriceProvider {

    private static final List<String> SYMBOLS = List.of("BTC", "ETH", "SOL", "XRP", "ADA");

    private static final Map<String, BigDecimal> BASE_PRICES = Map.of(
        "BTC", new BigDecimal("67000"),
        "ETH", new BigDecimal("3400"),
        "SOL", new BigDecimal("150"),
        "XRP", new BigDecimal("0.60"),
        "ADA", new BigDecimal("0.45")
    );

    private final Map<String, BigDecimal> currentPrices = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public TickerEngine() {
        currentPrices.putAll(BASE_PRICES);
    }

    @Override
    public Map<String, BigDecimal> fetchLatestPrices() {
        Map<String, BigDecimal> updated = new HashMap<>();
        for (String symbol : SYMBOLS) {
            BigDecimal current = currentPrices.get(symbol);
            BigDecimal next = simulateNextPrice(current);
            currentPrices.put(symbol, next);
            updated.put(symbol, next);
        }
        log.debug("Generated {} simulated prices", updated.size());
        return updated;
    }

    @Override
    public String getProviderName() {
        return "TickerEngine (fallback)";
    }

    private BigDecimal simulateNextPrice(BigDecimal current) {
        double changePercent = (random.nextDouble() - 0.5) * 0.02;
        BigDecimal change = current.multiply(BigDecimal.valueOf(changePercent));
        return current.add(change).setScale(2, RoundingMode.HALF_UP);
    }
}