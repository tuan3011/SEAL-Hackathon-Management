package com.example.swp.features.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank(message = "Refresh token cannot be empty")
    private String refreshToken;

    public String getRefreshToken() { return refreshToken; }
}
