package com.tricoin.core.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 3, max = 50) String username,
    @NotBlank @Size(min = 6) String password,
    @NotBlank @Email(message = "Geçerli bir e-posta adresi girin") @Size(max = 255) String email,
    @NotBlank @Pattern(regexp = "^\\+\\d{1,4}$", message = "Ülke kodu +XX formatında olmalı") String phoneCountryCode,
    @NotBlank @Pattern(regexp = "^\\d{6,15}$", message = "Telefon numarası sadece rakamlardan oluşmalı") String phoneNumber
) {}