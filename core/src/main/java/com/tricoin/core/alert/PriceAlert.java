// 1. PriceAlert.java (Entity)
package com.tricoin.core.alert;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "price_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, length = 10)
    private String symbol;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal targetPrice;

    @Column(nullable = false)
    private String alertDirection;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isTriggered = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}