package com.tricoin.core.alert;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class PriceAlertController {

    private final PriceAlertRepository repository;

    @PostMapping
    public PriceAlert createAlert(@RequestBody PriceAlert alert) {
        alert.setCreatedAt(LocalDateTime.now());
        alert.setIsTriggered(false);
        return repository.save(alert);
    }

    // PriceAlertController.java içine eklenecek
    @GetMapping("/triggered")
    public List<PriceAlert> getTriggeredAlerts() {
        // Şimdilik "test" kullanıcısının tetiklenmiş alarmlarını çekiyoruz
        return repository.findByUsernameAndIsTriggeredTrue("test");
    }

    @DeleteMapping("/{id}")
    public void dismissAlert(@PathVariable Long id) {
        // Kullanıcı bildirimi "Okudum" dediğinde alarmı veritabanından siliyoruz
        repository.deleteById(id);
    }
}
