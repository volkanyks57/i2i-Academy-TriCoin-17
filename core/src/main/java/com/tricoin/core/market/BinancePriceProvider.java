package com.tricoin.core.market;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class BinancePriceProvider implements PriceProvider {

    private static final String BINANCE_API = "https://api.binance.com/api/v3/ticker/24hr";
    
    // İşte listeni buradan istediğin gibi genişletebilirsin
    private static final List<String> SYMBOLS = List.of(
        "BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT",
        "DOTUSDT", "AVAXUSDT", "LINKUSDT", "UNIUSDT", "DOGEUSDT",
        "LTCUSDT", "BNBUSDT", "MATICUSDT", "XLMUSDT", "ATOMUSDT",
        "NEARUSDT", "FTMUSDT", "SANDUSDT", "MANAUSDT", "AXSUSDT"
    );

    private final RestTemplate restTemplate;

    @Override
    public Map<String, MarketTicker> fetchLatestPrices() {
        // Binance API'ye parametre olarak sembolleri tek seferde gönderiyoruz (Daha hızlıdır)
        String symbolsParam = "[\"" + String.join("\",\"", SYMBOLS) + "\"]";
        String url = BINANCE_API + "?symbols=" + symbolsParam;

        BinanceTickerResponse[] response = restTemplate.getForObject(url, BinanceTickerResponse[].class);

        if (response == null) {
            throw new RuntimeException("Binance returned null response");
        }

        Map<String, MarketTicker> prices = new HashMap<>();
        for (BinanceTickerResponse ticker : response) {
            String symbol = ticker.symbol().replace("USDT", "");
            BigDecimal price = new BigDecimal(ticker.lastPrice());
            BigDecimal change = new BigDecimal(ticker.priceChangePercent());
            
            prices.put(symbol, new MarketTicker(price, change));
        }

        log.info("Fetched {} prices from Binance", prices.size());
        return prices;
    }

    @Override
    public String getProviderName() {
        return "Binance";
    }

    private record BinanceTickerResponse(String symbol, String lastPrice, String priceChangePercent) {}
}