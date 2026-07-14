package com.tricoin.core.trading;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * User's holding of a specific crypto asset.
 * One row per (user, symbol) — updated in-place on each buy/sell.
 */
@Entity
@Table(name = "crypto_holdings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "symbol"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoHolding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 10)
    private String symbol;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal amount;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}