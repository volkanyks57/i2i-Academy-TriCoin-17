// 3. PriceAlertScheduler.java (Zamanlayıcı Servis)
package com.tricoin.core.alert;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tricoin.core.market.PriceSnapshot;
import com.tricoin.core.market.PriceSnapshotRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceAlertScheduler {

    private final PriceAlertRepository priceAlertRepository;
    private final PriceSnapshotRepository priceSnapshotRepository;

    @Scheduled(fixedRate = 10000)
    public void checkAlerts() {
        List<PriceAlert> activeAlerts = priceAlertRepository.findByIsTriggeredFalse();

        for (PriceAlert alert : activeAlerts) {
            List<PriceSnapshot> history = priceSnapshotRepository.findHistory(alert.getSymbol(), LocalDateTime.now().minusHours(1));
            if (history.isEmpty()) continue;

            BigDecimal currentPrice = history.get(history.size() - 1).getPrice();
            boolean conditionMet = ("ABOVE".equals(alert.getAlertDirection()) && currentPrice.compareTo(alert.getTargetPrice()) >= 0) ||
                                   ("BELOW".equals(alert.getAlertDirection()) && currentPrice.compareTo(alert.getTargetPrice()) <= 0);

            if (conditionMet) {
                alert.setIsTriggered(true);
                priceAlertRepository.save(alert);
                log.info("ALARM TETİKLENDİ: {} kullanıcısının {} alarmı. Güncel Fiyat: {}", alert.getUsername(), alert.getSymbol(), currentPrice);
            }
        }
    }
}