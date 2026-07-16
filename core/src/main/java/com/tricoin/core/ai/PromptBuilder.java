package com.tricoin.core.ai;

import com.tricoin.core.auth.User;
import com.tricoin.core.auth.Wallet;
import com.tricoin.core.trading.CryptoHolding;
import com.tricoin.core.trading.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

/**
 * Assembles a structured, context-rich prompt for Gemini.
 * The LLM answers strictly about the user's account, holdings, transaction
 * history, and current market prices — everything relevant is inlined into
 * the prompt so the model doesn't have to guess or hallucinate.
 */
@Component
@RequiredArgsConstructor
public class PromptBuilder {

    private static final String PRICE_KEY_PREFIX = "price:";
    private static final DateTimeFormatter DATE_FORMAT =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final RedisTemplate<String, String> redisTemplate;

    public String build(
        User user,
        Wallet wallet,
        List<CryptoHolding> holdings,
        List<Transaction> recentTransactions,
        String userQuestion
    ) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are TriCoin's AI assistant. You help the user understand ")
              .append("their crypto portfolio, recent transactions, and current market trends. ")
              .append("Answer ONLY based on the data provided below. ")
              .append("If the question is unrelated to the account, holdings, transactions, ")
              .append("or crypto prices, politely refuse. ")
              .append("Respond in clean Markdown, concise and friendly.\n\n");

        prompt.append("=== USER ACCOUNT ===\n");
        prompt.append("Username: ").append(user.getUsername()).append("\n");
        prompt.append("USD Balance: $").append(wallet.getBalanceUsd()).append("\n\n");

        prompt.append("=== CRYPTO HOLDINGS ===\n");
        if (holdings.isEmpty()) {
            prompt.append("No crypto holdings yet.\n\n");
        } else {
            for (CryptoHolding holding : holdings) {
                BigDecimal currentPrice = fetchCurrentPrice(holding.getSymbol());
                prompt.append("- ")
                      .append(holding.getSymbol()).append(": ")
                      .append(holding.getAmount()).append(" units");
                if (currentPrice != null) {
                    BigDecimal currentValue = holding.getAmount().multiply(currentPrice);
                    prompt.append(" (current value: $")
                          .append(currentValue.setScale(2, java.math.RoundingMode.HALF_UP))
                          .append(", price: $").append(currentPrice).append(")");
                }
                prompt.append("\n");
            }
            prompt.append("\n");
        }

        prompt.append("=== RECENT TRANSACTIONS (last ").append(recentTransactions.size()).append(") ===\n");
        if (recentTransactions.isEmpty()) {
            prompt.append("No transactions yet.\n\n");
        } else {
            for (Transaction tx : recentTransactions) {
                prompt.append("- ")
                      .append(tx.getCreatedAt().format(DATE_FORMAT)).append(" | ")
                      .append(tx.getSide()).append(" ")
                      .append(tx.getAmount()).append(" ")
                      .append(tx.getSymbol()).append(" @ $")
                      .append(tx.getPricePerUnit()).append(" = $")
                      .append(tx.getTotalValue()).append("\n");
            }
            prompt.append("\n");
        }

        prompt.append("=== CURRENT MARKET PRICES ===\n");
        appendMarketPrices(prompt);
        prompt.append("\n");

        prompt.append("=== USER QUESTION ===\n");
        prompt.append(userQuestion).append("\n");

        return prompt.toString();
    }

    // GÜNCELLENDİ: Gelen "Fiyat:Yüzde" metnini ikiye bölüp sadece fiyatı alan kısım
    private BigDecimal fetchCurrentPrice(String symbol) {
        String value = redisTemplate.opsForValue().get(PRICE_KEY_PREFIX + symbol);
        if (value == null) {
            return null;
        }

        try {
            // Eğer metnin içinde ':' varsa, böl ve sadece ilk kısmı (fiyatı) al
            if (value.contains(":")) {
                String[] parts = value.split(":");
                return new BigDecimal(parts[0]);
            }
            
            // Eğer ':' yoksa, normal düz sayı olma ihtimaline karşı doğrudan çevir:
            return new BigDecimal(value);

        } catch (NumberFormatException e) {
            System.err.println("Geçersiz fiyat formatı yakalandı ve atlandı: " + value);
            return BigDecimal.ZERO;
        }
    }

    // GÜNCELLENDİ: Gemini'ye temiz fiyatları gönderen kısım
    private void appendMarketPrices(StringBuilder prompt) {
        Set<String> keys = redisTemplate.keys(PRICE_KEY_PREFIX + "*");
        if (keys == null || keys.isEmpty()) {
            prompt.append("Market data unavailable.\n");
            return;
        }
        for (String key : keys) {
            String symbol = key.substring(PRICE_KEY_PREFIX.length());
            BigDecimal cleanPrice = fetchCurrentPrice(symbol);
            if (cleanPrice != null && cleanPrice.compareTo(BigDecimal.ZERO) > 0) {
                prompt.append("- ").append(symbol).append(": $").append(cleanPrice).append("\n");
            }
        }
    }
}