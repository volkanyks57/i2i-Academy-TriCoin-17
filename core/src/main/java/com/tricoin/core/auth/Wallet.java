package com.tricoin.core.auth;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Holds a user's USD balance.
 * This is the single source of truth for funds — never cached in Redis.
 */
@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One wallet per user (enforced by a unique constraint on the DB side).
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "balance_usd", nullable = false, precision = 18, scale = 2)
    private BigDecimal balanceUsd;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}