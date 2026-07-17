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

private static final List<String> SYMBOLS = List.of(
    "BTC", "ETH", "SOL", "XRP", "ADA",
    "DOT", "AVAX", "LINK", "UNI", "DOGE",
    "LTC", "BNB", "MATIC", "XLM", "ATOM",
    "NEAR", "FTM", "SAND", "MANA", "AXS"
);

private static final Map<String, BigDecimal> BASE_PRICES = Map.ofEntries(
    Map.entry("BTC", new BigDecimal("67000")),
    Map.entry("ETH", new BigDecimal("3400")),
    Map.entry("SOL", new BigDecimal("150")),
    Map.entry("XRP", new BigDecimal("0.60")),
    Map.entry("ADA", new BigDecimal("0.45")),
    Map.entry("DOT", new BigDecimal("7.00")),
    Map.entry("AVAX", new BigDecimal("35.00")),
    Map.entry("LINK", new BigDecimal("14.00")),
    Map.entry("UNI", new BigDecimal("10.00")),
    Map.entry("DOGE", new BigDecimal("0.15")),
    Map.entry("LTC", new BigDecimal("85.00")),
    Map.entry("BNB", new BigDecimal("580.00")),
    Map.entry("MATIC", new BigDecimal("0.70")),
    Map.entry("XLM", new BigDecimal("0.12")),
    Map.entry("ATOM", new BigDecimal("8.00")),
    Map.entry("NEAR", new BigDecimal("5.50")),
    Map.entry("FTM", new BigDecimal("0.75")),
    Map.entry("SAND", new BigDecimal("0.40")),
    Map.entry("MANA", new BigDecimal("0.35")),
    Map.entry("AXS", new BigDecimal("6.50"))
);

    // 1. Değişiklik: Map artık sadece fiyat değil, MarketTicker (fiyat + değişim) tutuyor
    private final Map<String, MarketTicker> currentPrices = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public TickerEngine() {
        // 2. Değişiklik: Başlangıç fiyatlarını MarketTicker objesine dönüştürüyoruz (ilk değişim %0)
        BASE_PRICES.forEach((symbol, price) ->
            currentPrices.put(symbol, new MarketTicker(price, BigDecimal.ZERO))
        );
    }

    @Override
    public Map<String, MarketTicker> fetchLatestPrices() {
        Map<String, MarketTicker> updated = new HashMap<>();
        for (String symbol : SYMBOLS) {
            MarketTicker current = currentPrices.get(symbol);
            MarketTicker next = simulateNextTicker(current);
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

    // 3. Değişiklik: Sadece fiyatı değil, 24 saatlik değişimi de simüle edip MarketTicker dönüyoruz
    private MarketTicker simulateNextTicker(MarketTicker current) {
        BigDecimal currentPrice = current.price();
        
        // Fiyat için -%1 ile +%1 arası dalgalanma simülasyonu
        double priceVolatility = (random.nextDouble() - 0.5) * 0.02;
        BigDecimal priceChange = currentPrice.multiply(BigDecimal.valueOf(priceVolatility));
        BigDecimal nextPrice = currentPrice.add(priceChange).setScale(2, RoundingMode.HALF_UP);

        // Ekranda yeşil/kırmızı görünmesi için -%5 ile +%5 arası rastgele 24s değişim yüzdesi simülasyonu
        double change24hRandom = (random.nextDouble() - 0.5) * 10;
        BigDecimal nextChange24h = BigDecimal.valueOf(change24hRandom).setScale(2, RoundingMode.HALF_UP);

        return new MarketTicker(nextPrice, nextChange24h);
    }
}