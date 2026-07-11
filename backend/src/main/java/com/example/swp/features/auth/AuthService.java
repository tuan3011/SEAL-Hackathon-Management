package com.example.swp.features.auth;

import com.example.swp.features.auth.dto.request.CreateGuestJudgeRequest;
import com.example.swp.features.auth.dto.request.LoginRequest;
import com.example.swp.features.auth.dto.request.RefreshTokenRequest;
import com.example.swp.features.auth.dto.request.RegisterRequest;
import com.example.swp.features.auth.dto.request.VerifyOtpRequest;
import com.example.swp.features.auth.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse refreshToken(RefreshTokenRequest request);
    void register(RegisterRequest request);
    void verifyOtp(VerifyOtpRequest request);
    /** Creates a temporary Guest Judge account directly (no OTP). Organizer-only. */
    void createGuestJudge(CreateGuestJudgeRequest request);
    void forgotPassword(com.example.swp.features.auth.dto.request.ForgotPasswordRequest request);
    void resetPassword(com.example.swp.features.auth.dto.request.ResetPasswordRequest request);
}