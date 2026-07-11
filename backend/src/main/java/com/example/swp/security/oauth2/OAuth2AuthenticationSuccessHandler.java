package com.example.swp.security.oauth2;

import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.auth.RefreshToken;
import com.example.swp.features.auth.RefreshTokenService;
import com.example.swp.security.jwt.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatar = oAuth2User.getAttribute("picture");

        if (email == null) {
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Registering new user via Google OAuth2: {}", email);
            User newUser = new User();
            
            // Generate a safe username
            String username = email.split("@")[0];
            if (userRepository.existsByUsername(username)) {
                username = username + new SecureRandom().nextInt(1000);
            }
            
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setFullName(name);
            newUser.setAvatarUrl(avatar);
            newUser.setRole(Role.PARTICIPANT);
            newUser.setApproved(false);
            newUser.setVerified(true);
            
            // Set a random impossible password for OAuth users
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            newUser.setPassword(encoder.encode(UUID.randomUUID().toString()));
            
            return userRepository.save(newUser);
        });

        // Ensure user is active and approved before generating tokens
        if (!user.isApproved() || !user.isActive()) {
            response.sendRedirect(redirectUri + "?error=Account_is_locked_or_pending_approval");
            return;
        }

        String accessToken = tokenProvider.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        String targetUrl = redirectUri + "?accessToken=" + accessToken + "&refreshToken=" + refreshToken.getToken();
        log.info("OAuth2 login successful for email: {}, redirecting to frontend...", email);
        
        response.sendRedirect(targetUrl);
    }
}
