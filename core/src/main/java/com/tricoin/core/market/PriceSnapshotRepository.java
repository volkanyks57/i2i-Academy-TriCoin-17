package com.tricoin.core.market;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PriceSnapshotRepository extends JpaRepository<PriceSnapshot, Long> {

    @Query("SELECT p FROM PriceSnapshot p WHERE p.symbol = :symbol AND p.snapshotAt >= :since ORDER BY p.snapshotAt ASC")
    List<PriceSnapshot> findHistory(@Param("symbol") String symbol, @Param("since") LocalDateTime since);
}