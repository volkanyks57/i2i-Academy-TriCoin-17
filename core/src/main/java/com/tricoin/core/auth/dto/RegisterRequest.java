package com.tricoin.core.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 3, max = 50) String username,
    @NotBlank @Email String email,
    @NotBlank @Pattern(regexp = "^\\+\\d{1,3}\\d{7,14}$", message = "Geçerli bir telefon numarası girin") String phoneNumber,
    @NotBlank @Size(min = 6) String password
) {}