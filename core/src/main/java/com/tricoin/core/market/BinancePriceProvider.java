package com.tricoin.core.market;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class BinancePriceProvider implements PriceProvider {

    private static final String BINANCE_API = "https://api.binance.com/api/v3/ticker/price";
    private static final List<String> SYMBOLS = List.of("BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT");

    private final RestTemplate restTemplate;

    @Override
    public Map<String, BigDecimal> fetchLatestPrices() {
        String symbolsParam = "[\"" + String.join("\",\"", SYMBOLS) + "\"]";
        String url = BINANCE_API + "?symbols=" + symbolsParam;

        BinanceTickerResponse[] response = restTemplate.getForObject(url, BinanceTickerResponse[].class);

        if (response == null) {
            throw new RuntimeException("Binance returned null response");
        }

        Map<String, BigDecimal> prices = new HashMap<>();
        for (BinanceTickerResponse ticker : response) {
            String symbol = ticker.symbol().replace("USDT", "");
            prices.put(symbol, new BigDecimal(ticker.price()));
        }

        log.debug("Fetched {} prices from Binance", prices.size());
        return prices;
    }

    @Override
    public String getProviderName() {
        return "Binance";
    }

    private record BinanceTickerResponse(String symbol, String price) {}
}