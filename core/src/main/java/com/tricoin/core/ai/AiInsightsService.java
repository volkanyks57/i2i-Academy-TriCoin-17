package com.tricoin.core.ai;

import com.tricoin.core.auth.User;
import com.tricoin.core.auth.UserRepository;
import com.tricoin.core.auth.Wallet;
import com.tricoin.core.auth.WalletRepository;
import com.tricoin.core.trading.CryptoHolding;
import com.tricoin.core.trading.CryptoHoldingRepository;
import com.tricoin.core.trading.Transaction;
import com.tricoin.core.trading.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.tricoin.core.ai.dto.HealthScoreResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;

import java.util.List;

/**
 * Orchestrates AI insight queries end-to-end:
 * pulls the user's context from Postgres + Redis, hands it to PromptBuilder,
 * and forwards the resulting prompt to Gemini via GeminiClient.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiInsightsService {

    private static final int RECENT_TX_LIMIT = 10;

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final CryptoHoldingRepository cryptoHoldingRepository;
    private final TransactionRepository transactionRepository;
    private final PromptBuilder promptBuilder;
    private final GeminiClient geminiClient;

    public String answer(String username, String userQuestion) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalStateException("Wallet not found"));

        List<CryptoHolding> holdings = cryptoHoldingRepository.findByUserId(user.getId());

        // Cap the transaction context — sending the full history to the LLM
        // is wasteful (tokens) and rarely relevant beyond the recent activity.
        List<Transaction> allTransactions =
            transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Transaction> recentTransactions = allTransactions.size() > RECENT_TX_LIMIT
            ? allTransactions.subList(0, RECENT_TX_LIMIT)
            : allTransactions;

        String prompt = promptBuilder.build(user, wallet, holdings, recentTransactions, userQuestion);

        log.info("Sending AI query for user {} ({} chars)", username, prompt.length());
        return geminiClient.generate(prompt);
    }
    public HealthScoreResponse getHealthScore(String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalStateException("User not found"));

    Wallet wallet = walletRepository.findByUserId(user.getId())
        .orElseThrow(() -> new IllegalStateException("Wallet not found"));

    List<CryptoHolding> holdings = cryptoHoldingRepository.findByUserId(user.getId());

    List<Transaction> allTransactions =
        transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    List<Transaction> recentTransactions = allTransactions.size() > RECENT_TX_LIMIT
        ? allTransactions.subList(0, RECENT_TX_LIMIT)
        : allTransactions;

    String question = "Portföyümün sağlık skorunu değerlendir.";
    String basePrompt = promptBuilder.build(user, wallet, holdings, recentTransactions, question);

    String scorePrompt = basePrompt + "\n\n"
        + "ÖZEL TALİMAT: Yukarıdaki veriye dayanarak portföyün genel sağlığını değerlendir "
        + "(çeşitlendirme, risk yoğunlaşması, USD/kripto dengesi, son performans). "
        + "SADECE aşağıdaki JSON formatında, başka HİÇBİR METİN eklemeden cevap ver "
        + "(açıklama, markdown kod bloğu, yorum satırı YOK — sadece ham JSON):\n"
        + "{\"score\": <0-100 arası tam sayı>, "
        + "\"summary\": \"<tek cümlelik özet, Türkçe>\", "
        + "\"strengths\": [\"<güçlü yön 1>\", \"<güçlü yön 2>\"], "
        + "\"risks\": [\"<risk 1>\", \"<risk 2>\"]}";

    log.info("Requesting health score for user {}", username);
    String rawResponse = geminiClient.generate(scorePrompt);

    return parseHealthScore(rawResponse);
}

private HealthScoreResponse parseHealthScore(String rawResponse) {
    try {
        // Gemini bazen JSON'ı ```json ... ``` içine sarabiliyor, temizleyelim.
        String cleaned = rawResponse
            .replaceAll("(?s)```json", "")
            .replaceAll("(?s)```", "")
            .trim();

        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(cleaned, HealthScoreResponse.class);
    } catch (Exception e) {
        log.error("Health score JSON parse failed: {}", e.getMessage());
        return new HealthScoreResponse(
            50,
            "Portföy analizi şu an oluşturulamadı.",
            Collections.emptyList(),
            Collections.emptyList()
        );
    }
}
}