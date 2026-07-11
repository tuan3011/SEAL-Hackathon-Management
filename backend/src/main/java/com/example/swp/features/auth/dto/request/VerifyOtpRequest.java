package com.example.swp.features.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String otp;

    public String getEmail() { return email; }
    public String getOtp() { return otp; }
}