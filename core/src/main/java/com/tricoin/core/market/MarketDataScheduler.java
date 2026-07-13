package com.tricoin.core.market;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataScheduler {

    private static final String PRICE_KEY_PREFIX = "price:";

    private final PriceProviderRouter priceProviderRouter;
    private final RedisTemplate<String, String> redisTemplate;
    private final PriceSnapshotRepository priceSnapshotRepository;

    @Scheduled(fixedRate = 15000)
    public void updatePrices() {
        try {
            Map<String, BigDecimal> latestPrices = priceProviderRouter.fetchLatestPrices();
            LocalDateTime now = LocalDateTime.now();

            for (Map.Entry<String, BigDecimal> entry : latestPrices.entrySet()) {
                String symbol = entry.getKey();
                BigDecimal price = entry.getValue();

                redisTemplate.opsForValue().set(PRICE_KEY_PREFIX + symbol, price.toPlainString());

                PriceSnapshot snapshot = PriceSnapshot.builder()
                    .symbol(symbol)
                    .price(price)
                    .snapshotAt(now)
                    .build();
                priceSnapshotRepository.save(snapshot);
            }

            log.info("Updated {} prices in Redis and DB", latestPrices.size());
        } catch (Exception e) {
            log.error("Failed to update prices: {}", e.getMessage(), e);
        }
    }
}