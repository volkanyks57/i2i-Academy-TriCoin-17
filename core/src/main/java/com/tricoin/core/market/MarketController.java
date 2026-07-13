package com.tricoin.core.market;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private static final String PRICE_KEY_PREFIX = "price:";

    private final RedisTemplate<String, String> redisTemplate;
    private final PriceSnapshotRepository priceSnapshotRepository;

    @GetMapping("/prices")
    public Map<String, Object> getPrices() {
        Set<String> keys = redisTemplate.keys(PRICE_KEY_PREFIX + "*");
        List<Map<String, Object>> prices = new ArrayList<>();

        if (keys != null) {
            for (String key : keys) {
                String value = redisTemplate.opsForValue().get(key);
                if (value != null) {
                    String symbol = key.substring(PRICE_KEY_PREFIX.length());
                    prices.add(Map.of(
                        "symbol", symbol,
                        "price", new BigDecimal(value)
                    ));
                }
            }
        }

        return Map.of("prices", prices);
    }

    @GetMapping("/history/{symbol}")
    public Map<String, Object> getPriceHistory(
        @PathVariable String symbol,
        @RequestParam(defaultValue = "24") int hours
    ) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<PriceSnapshot> history = priceSnapshotRepository.findHistory(symbol.toUpperCase(), since);

        List<Map<String, Object>> points = new ArrayList<>();
        for (PriceSnapshot snapshot : history) {
            points.add(Map.of(
                "price", snapshot.getPrice(),
                "timestamp", snapshot.getSnapshotAt().toString()
            ));
        }

        return Map.of(
            "symbol", symbol.toUpperCase(),
            "hours", hours,
            "points", points
        );
    }
}