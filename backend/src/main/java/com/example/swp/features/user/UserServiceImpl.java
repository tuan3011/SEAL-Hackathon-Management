package com.example.swp.features.user;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.user.dto.UserResponse;
import com.example.swp.features.user.dto.request.CreateUserRequest;
import com.example.swp.util.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final com.example.swp.features.team_member.TeamMemberRepository teamMemberRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public UserResponse approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.isApproved()) {
            return mapToResponse(user);
        }

        auditLogService.logAction(
                "APPROVE_USER",
                "User",
                userId,
                "approved: false",
                "approved: true");

        user.setApproved(true);
        User updatedUser = userRepository.save(user);

        CompletableFuture.runAsync(() -> {
            try {
                String emailBody = "Hello " + updatedUser.getUsername() + ",\n\n" +
                        "Your account has been approved by the admin. You can now log in to the Hackathon Event platform.\n\n"
                        +
                        "Best regards,\nHackathon Event Notification Team";
                emailService.sendSimpleMessage(updatedUser.getEmail(), "Account Approved", emailBody);
            } catch (Exception e) {
                log.error("Failed to send approval email to {}: {}", updatedUser.getEmail(), e.getMessage());
            }
        });
        return mapToResponse(updatedUser);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findByApprovedTrue(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<UserResponse> getPendingUsers(Pageable pageable) {
        return userRepository.findByApprovedFalse(pageable).map(this::mapToResponse);
    }

    @Override
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalStateException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Error: Email is already in use!");
        }

        if (request.getFptStudentId() != null && !request.getFptStudentId().trim().isEmpty()) {
            if (userRepository.existsByFptStudentId(request.getFptStudentId())) {
                throw new com.example.swp.exception.BadRequestException("This student ID is already registered.");
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFptStudentId(request.getFptStudentId());
        user.setSchoolName(request.getSchoolName());
        user.setApproved(true);
        user.setVerified(true);

        User savedUser = userRepository.save(user);

        auditLogService.logAction("CREATE_USER", "User", savedUser.getId(), null,
                "User created: " + savedUser.getUsername());

        return mapToResponse(savedUser);
    }

    @Override
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        auditLogService.logAction(
                "DEACTIVATE_USER",
                "User",
                userId,
                "isActive: true",
                "isActive: false");

        user.setActive(false);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .fptStudentId(user.getFptStudentId())
                .schoolName(user.getSchoolName())
                .approved(user.isApproved())
                .isActive(user.isActive())
                .build();
    }

    private User getCurrentUser() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    @Override
    public UserResponse getMyProfile() {
        return mapToResponse(getCurrentUser());
    }

    @Override
    @Transactional
    public UserResponse updateProfile(com.example.swp.features.user.dto.request.UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());
        if (request.getBio() != null)
            user.setBio(request.getBio());
        boolean inFinalizedTeam = teamMemberRepository.findByUserId(user.getId()).stream()
                .anyMatch(tm -> tm.getTeam().getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED);

        if (request.getFptStudentId() != null) {
            if (inFinalizedTeam && !request.getFptStudentId().equals(user.getFptStudentId())) {
                throw new com.example.swp.exception.BadRequestException(
                        "Identity fields cannot be changed after your team registration is finalized.");
            }
            if (!request.getFptStudentId().trim().isEmpty()
                    && userRepository.existsByFptStudentIdAndIdNot(request.getFptStudentId(), user.getId())) {
                throw new com.example.swp.exception.BadRequestException("This student ID is already registered.");
            }
            user.setFptStudentId(request.getFptStudentId());
        }
        if (request.getSchoolName() != null) {
            if (inFinalizedTeam && !request.getSchoolName().equals(user.getSchoolName())) {
                throw new com.example.swp.exception.BadRequestException(
                        "Identity fields cannot be changed after your team registration is finalized.");
            }
            user.setSchoolName(request.getSchoolName());
        }
        if (request.getGithubUrl() != null)
            user.setGithubUrl(request.getGithubUrl());

        User updatedUser = userRepository.save(user);
        auditLogService.logAction("UPDATE_PROFILE", "USER", user.getId(), null, user.getUsername());
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(com.example.swp.features.user.dto.request.ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new com.example.swp.exception.BadRequestException("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logAction("CHANGE_PASSWORD", "USER", user.getId(), null, user.getUsername());
    }
}
