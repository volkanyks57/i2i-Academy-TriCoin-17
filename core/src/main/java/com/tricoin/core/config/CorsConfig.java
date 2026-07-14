package com.tricoin.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Tüm API uç noktalarına izin ver
                .allowedOrigins("http://localhost:5173") // Sadece React (Vite) ön yüzümüzün adresine izin ver
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // İzin verilen HTTP metodları
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}