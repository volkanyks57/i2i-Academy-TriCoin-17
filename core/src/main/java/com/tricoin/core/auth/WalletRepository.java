package com.tricoin.core.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    // Every user has exactly one wallet, looked up by their user id.
    Optional<Wallet> findByUserId(Long userId);
}