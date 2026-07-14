package com.tricoin.core.trading;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Immutable record of a completed buy or sell order.
 * Once written, transactions are never modified — they serve as the audit log.
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 10)
    private String symbol;

    @Column(nullable = false, length = 4)
    private String side; // BUY or SELL

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal amount;

    @Column(name = "price_per_unit", nullable = false, precision = 18, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(name = "total_value", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}