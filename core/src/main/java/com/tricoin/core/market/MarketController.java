package com.tricoin.core.market;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

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

                    // GÜVENLİK ÖNLEMİ: Eğer veri ":" içermiyorsa hata vermesin, sadece fiyatı alsın
                    String[] parts = value.split(":");
                    BigDecimal price;
                    BigDecimal change24h = BigDecimal.ZERO; // Varsayılan değer

                    try {
                        price = new BigDecimal(parts[0]);
                        if (parts.length > 1) {
                            change24h = new BigDecimal(parts[1]);
                        }
                    } catch (Exception e) {
                        // Eğer veri bozuksa veya format hatalıysa, bu coin'i geç
                        continue;
                    }

                    prices.add(Map.of(
                            "symbol", symbol,
                            "price", price,
                            "change24h", change24h
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
