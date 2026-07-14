package com.tricoin.core.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Tracks active sessions in Redis, keyed by token.
 * Redis holds ONLY the token → username mapping — never passwords.
 * This lets us invalidate a session (e.g. logout) without waiting
 * for the JWT itself to expire.
 */
@Service
@RequiredArgsConstructor
public class SessionService {

    private static final String SESSION_KEY_PREFIX = "session:";
    private static final Duration SESSION_TTL = Duration.ofHours(1);

    private final RedisTemplate<String, String> redisTemplate;

    public void storeSession(String token, String username) {
        redisTemplate.opsForValue().set(SESSION_KEY_PREFIX + token, username, SESSION_TTL);
    }

    public boolean isSessionActive(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(SESSION_KEY_PREFIX + token));
    }

    public void invalidateSession(String token) {
        redisTemplate.delete(SESSION_KEY_PREFIX + token);
    }
}