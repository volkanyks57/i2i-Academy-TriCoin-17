package com.tricoin.core.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Used during login to look up credentials by username.
    Optional<User> findByUsername(String username);

    // Used during registration to reject duplicate usernames early.
    boolean existsByUsername(String username);
}