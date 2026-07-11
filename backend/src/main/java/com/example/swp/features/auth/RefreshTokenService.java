package com.example.swp.features.auth;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.jwt-refresh-token-expiration-ms}")
    private Long refreshTokenDurationMs;

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        // Delete existing refresh tokens for this user
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush(); // Force delete to happen before insert

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusNanos(refreshTokenDurationMs * 1_000_000))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new IllegalStateException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }
}
