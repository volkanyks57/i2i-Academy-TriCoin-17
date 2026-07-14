package com.tricoin.core.trading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CryptoHoldingRepository extends JpaRepository<CryptoHolding, Long> {
    Optional<CryptoHolding> findByUserIdAndSymbol(Long userId, String symbol);
    List<CryptoHolding> findByUserId(Long userId);
}