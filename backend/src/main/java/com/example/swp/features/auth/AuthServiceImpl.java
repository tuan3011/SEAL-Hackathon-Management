package com.example.swp.features.auth;

import com.example.swp.exception.BadRequestException;
import com.example.swp.features.auth.dto.request.CreateGuestJudgeRequest;
import com.example.swp.features.auth.dto.request.LoginRequest;
import com.example.swp.features.auth.dto.request.RefreshTokenRequest;
import com.example.swp.features.auth.dto.request.RegisterRequest;
import com.example.swp.features.auth.dto.request.VerifyOtpRequest;
import com.example.swp.features.auth.dto.response.LoginResponse;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.security.jwt.JwtTokenProvider;
import com.example.swp.util.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AuthenticationManager authenticationManager;  
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final RefreshTokenService refreshTokenService;

    @Override
    public LoginResponse login(LoginRequest request) {
        // Pre-check: give specific error messages instead of generic "Bad credentials"
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found with username: " + request.getUsername()));

        log.info("Login attempt for user: {}, verified={}, approved={}", 
                user.getUsername(), user.isVerified(), user.isApproved());

        if (!user.isVerified()) {
            throw new BadRequestException("Account email has not been verified. Please verify your OTP first.");
        }

        if (!user.isApproved()) {
            throw new BadRequestException("Account has not been approved by admin yet.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.info("User logged in successfully: {}", user.getUsername());

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        RefreshToken refreshTokenEntity = refreshTokenService.createRefreshToken(user.getId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenEntity.getToken())
                .build();
    }

    @Override
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtTokenProvider.generateAccessToken(user);
                    return LoginResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(request.getRefreshToken())
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        // Determine school type and validate student ID
        boolean isFpt = request.getSchoolName() == null || request.getSchoolName().trim().isEmpty();

        if (isFpt) {
            // FPT student: fptStudentId is required and must be unique
            if (request.getFptStudentId() == null || request.getFptStudentId().trim().isEmpty()) {
                throw new BadRequestException("FPT Student ID is required for FPT students.");
            }
            if (userRepository.existsByFptStudentId(request.getFptStudentId())) {
                throw new BadRequestException("This FPT Student ID is already registered.");
            }
        } else {
            // External student: both studentId and schoolName are required
            if (request.getFptStudentId() == null || request.getFptStudentId().trim().isEmpty()) {
                throw new BadRequestException("Student ID is required for external students.");
            }
            if (userRepository.existsByFptStudentIdAndSchoolName(request.getFptStudentId(), request.getSchoolName().trim())) {
                throw new BadRequestException("This Student ID is already registered at " + request.getSchoolName().trim() + ".");
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFptStudentId(request.getFptStudentId());
        user.setSchoolName(isFpt ? "FPT University" : request.getSchoolName().trim());
        user.setRole(Role.PARTICIPANT);
        user.setApproved(false);
        user.setVerified(false); // Require OTP verification

        String otpCode = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        try {
            userRepository.save(user);
            log.info("New user registered successfully: {}", user.getUsername());
            
            String emailBody = "Hello " + user.getUsername() + ",\n\n" +
                               "Thank you for registering. Your 6-digit OTP for account verification is: " + otpCode + "\n" +
                               "It will expire in 5 minutes.\n\n" +
                               "Best regards,\nHackathon Event Notification Team";
            emailService.sendSimpleMessage(user.getEmail(), "Account Verification OTP", emailBody);
            
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.error("Database constraint violation during registration: {}", ex.getMessage());
            throw new BadRequestException("Username or Email is already registered");
        }
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + request.getEmail()));

        if (user.isVerified()) {
            throw new BadRequestException("User is already verified.");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP.");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired.");
        }

        user.setVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    /**
     * Creates a temporary Guest Judge account on behalf of an Organizer.
     * WHY: Guest judges are external (non-FPT) evaluators who do not go through
     * the normal OTP registration flow. Organizer creates them directly.
     *
     * Security:
     * - Guest judges get role GUEST_JUDGE (cannot mentor, cannot manage events)
     * - Account is marked is_temporary=true for easy cleanup post-event
     * - Auto-approved and auto-verified to bypass normal gating
     * - Password is provided by the organizer in the request
     */
    @Override
    @Transactional
    public void createGuestJudge(CreateGuestJudgeRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User guestJudge = new User();
        guestJudge.setUsername(request.getUsername());
        guestJudge.setEmail(request.getEmail());
        guestJudge.setFullName(request.getFullName());
        guestJudge.setPassword(passwordEncoder.encode(request.getPassword()));
        guestJudge.setRole(Role.GUEST_JUDGE);
        guestJudge.setApproved(true);      // auto-approved – no admin review needed
        guestJudge.setVerified(true);      // skip OTP – organizer vouches for them
        guestJudge.setTemporary(true);     // flag for post-event cleanup

        userRepository.save(guestJudge);
        log.info("Guest judge account created: username={}", guestJudge.getUsername());

        auditLogService.logAction(
            "CREATE_GUEST_JUDGE",
            "USER",
            guestJudge.getId(),
            null,
            request.getUsername()
        );
    }

    @Override
    @Transactional
    public void forgotPassword(com.example.swp.features.auth.dto.request.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found with this email"));

        String otpCode = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        String emailBody = "Hello,\n\nYour 6-digit OTP for password reset is: " + otpCode + "\nIt will expire in 5 minutes.\n\nBest regards,\nHackathon Event Notification Team";
        emailService.sendSimpleMessage(user.getEmail(), "Password Reset OTP", emailBody);
        
        auditLogService.logAction("FORGOT_PASSWORD_REQUESTED", "USER", user.getId(), null, user.getUsername());
    }

    @Override
    @Transactional
    public void resetPassword(com.example.swp.features.auth.dto.request.ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found with this email"));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtpCode())) {
            throw new BadRequestException("Invalid OTP.");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        auditLogService.logAction("PASSWORD_RESET_SUCCESS", "USER", user.getId(), null, user.getUsername());
    }
}
