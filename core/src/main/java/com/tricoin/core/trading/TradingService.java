package com.tricoin.core.trading;

import com.tricoin.core.auth.User;
import com.tricoin.core.auth.UserRepository;
import com.tricoin.core.auth.Wallet;
import com.tricoin.core.auth.WalletRepository;
import com.tricoin.core.trading.dto.TradeRequest;
import com.tricoin.core.trading.dto.TradeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Handles buy and sell trading operations.
 * All operations are ACID-compliant via @Transactional — balance updates,
 * holding updates, and transaction logs either all succeed or all roll back.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {

    private static final String PRICE_KEY_PREFIX = "price:";

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final CryptoHoldingRepository cryptoHoldingRepository;
    private final TransactionRepository transactionRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Transactional
    public TradeResponse executeTrade(String username, TradeRequest request) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        String symbol = request.symbol().toUpperCase();
        BigDecimal amount = request.amount();
        String side = request.side().toUpperCase();

        BigDecimal currentPrice = fetchCurrentPrice(symbol);
        BigDecimal totalValue = amount.multiply(currentPrice).setScale(2, RoundingMode.HALF_UP);

        Wallet wallet = walletRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalStateException("Wallet not found"));

        if ("BUY".equals(side)) {
            executeBuy(user.getId(), symbol, amount, totalValue, wallet);
        } else if ("SELL".equals(side)) {
            executeSell(user.getId(), symbol, amount, totalValue, wallet);
        } else {
            throw new IllegalArgumentException("Invalid side: " + side);
        }

        Transaction transaction = Transaction.builder()
            .userId(user.getId())
            .symbol(symbol)
            .side(side)
            .amount(amount)
            .pricePerUnit(currentPrice)
            .totalValue(totalValue)
            .build();
        transaction = transactionRepository.save(transaction);

        log.info("User {} executed {} {} {} at {}", username, side, amount, symbol, currentPrice);

        return new TradeResponse(
            transaction.getId(),
            symbol,
            side,
            amount,
            currentPrice,
            totalValue,
            wallet.getBalanceUsd(),
            transaction.getCreatedAt()
        );
    }

    private void executeBuy(Long userId, String symbol, BigDecimal amount,
                            BigDecimal totalValue, Wallet wallet) {
        if (wallet.getBalanceUsd().compareTo(totalValue) < 0) {
            throw new IllegalStateException("Insufficient funds to complete this trade");
        }

        wallet.setBalanceUsd(wallet.getBalanceUsd().subtract(totalValue));
        walletRepository.save(wallet);

        CryptoHolding holding = cryptoHoldingRepository.findByUserIdAndSymbol(userId, symbol)
            .orElse(CryptoHolding.builder()
                .userId(userId)
                .symbol(symbol)
                .amount(BigDecimal.ZERO)
                .build());

        holding.setAmount(holding.getAmount().add(amount));
        cryptoHoldingRepository.save(holding);
    }

    private void executeSell(Long userId, String symbol, BigDecimal amount,
                             BigDecimal totalValue, Wallet wallet) {
        CryptoHolding holding = cryptoHoldingRepository.findByUserIdAndSymbol(userId, symbol)
            .orElseThrow(() -> new IllegalStateException(
                "You do not hold any " + symbol));

        if (holding.getAmount().compareTo(amount) < 0) {
            throw new IllegalStateException(
                "Insufficient " + symbol + " balance to complete this trade");
        }

        holding.setAmount(holding.getAmount().subtract(amount));
        cryptoHoldingRepository.save(holding);

        wallet.setBalanceUsd(wallet.getBalanceUsd().add(totalValue));
        walletRepository.save(wallet);
    }

    private BigDecimal fetchCurrentPrice(String symbol) {
        String value = redisTemplate.opsForValue().get(PRICE_KEY_PREFIX + symbol);
        if (value == null) {
            throw new IllegalStateException("Price not available for " + symbol);
        }
        return new BigDecimal(value);
    }

    public List<Transaction> getUserTransactions(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}