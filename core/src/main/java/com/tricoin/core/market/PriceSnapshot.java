package com.tricoin.core.market;

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
@Table(name = "price_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String symbol;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    // Yeni Eklenen Sütun
    @Column(name = "change_24h", precision = 10, scale = 2)
    private BigDecimal change24h;

    @Column(name = "snapshot_at", nullable = false)
    private LocalDateTime snapshotAt;
}