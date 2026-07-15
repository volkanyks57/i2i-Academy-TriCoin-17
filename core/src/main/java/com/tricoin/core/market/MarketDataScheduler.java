package com.tricoin.core.market;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataScheduler {

    private static final String PRICE_KEY_PREFIX = "price:";

    private final PriceProviderRouter priceProviderRouter;
    private final RedisTemplate<String, String> redisTemplate;
    private final PriceSnapshotRepository priceSnapshotRepository;

    // MarketDataScheduler.java (İyileştirilmiş hali)
    @Scheduled(fixedRate = 15000)
    public void updatePrices() {
        try {
            Map<String, MarketTicker> latestPrices = priceProviderRouter.fetchLatestPrices();
            if (latestPrices == null || latestPrices.isEmpty()) {
                log.warn("Price provider returned empty data!");
                return;
            }

            LocalDateTime now = LocalDateTime.now();

            for (Map.Entry<String, MarketTicker> entry : latestPrices.entrySet()) {
                String symbol = entry.getKey();
                MarketTicker ticker = entry.getValue();

                // Redis'e yaz
                String redisValue = ticker.price().toPlainString() + ":" + ticker.change24h().toPlainString();
                redisTemplate.opsForValue().set(PRICE_KEY_PREFIX + symbol, redisValue);

                // Veritabanına yaz
                PriceSnapshot snapshot = PriceSnapshot.builder()
                        .symbol(symbol)
                        .price(ticker.price())
                        .change24h(ticker.change24h())
                        .snapshotAt(now)
                        .build();
                priceSnapshotRepository.save(snapshot);
            }

            log.info("Market update successful: {} coins updated.", latestPrices.size());
        } catch (Exception e) {
            log.error("Critical error in MarketDataScheduler: {}", e.getMessage());
        }
    }
}
