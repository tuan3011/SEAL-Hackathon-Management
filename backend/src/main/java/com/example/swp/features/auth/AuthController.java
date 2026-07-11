package com.example.swp.features.auth;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.auth.dto.request.CreateGuestJudgeRequest;
import com.example.swp.features.auth.dto.request.LoginRequest;
import com.example.swp.features.auth.dto.request.RefreshTokenRequest;
import com.example.swp.features.auth.dto.request.RegisterRequest;
import com.example.swp.features.auth.dto.request.VerifyOtpRequest;
import com.example.swp.features.auth.dto.response.LoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return new ResponseEntity<>(ApiResponse.success(null, "Registration successful. Please check your email for OTP."), HttpStatus.CREATED);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(null, "OTP verified successfully."));
    }

    /**
     * Organizer creates a temporary Guest Judge account.
     * Guest judge credentials are emailed to the provided address.
     */
    @PostMapping("/create-guest-judge")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> createGuestJudge(@Valid @RequestBody CreateGuestJudgeRequest request) {
        authService.createGuestJudge(request);
        return new ResponseEntity<>(ApiResponse.success(null, "Guest judge account created. Credentials sent via email."), HttpStatus.CREATED);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody com.example.swp.features.auth.dto.request.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "If the email is registered, a reset link will be sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody com.example.swp.features.auth.dto.request.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password has been reset successfully."));
    }
}