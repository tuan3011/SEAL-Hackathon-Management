package com.example.swp.features.profile;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.profile.dto.request.UpdateProfileRequest;
import com.example.swp.features.profile.dto.response.ProfileResponse;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileResponse getMyProfile() {
        User currentUser = getCurrentUser();
        return mapToResponse(currentUser);
    }

    @Transactional
    public ProfileResponse updateMyProfile(UpdateProfileRequest request) {
        User currentUser = getCurrentUser();
        
        currentUser.setFullName(request.getFullName());
        currentUser.setPhone(request.getPhone());
        currentUser.setFptStudentId(request.getFptStudentId());
        currentUser.setSchoolName(request.getSchoolName());
        currentUser.setGithubUrl(request.getGithubUrl());
        currentUser.setBio(request.getBio());

        User updatedUser = userRepository.save(currentUser);
        return mapToResponse(updatedUser);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProfileResponse mapToResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .fptStudentId(user.getFptStudentId())
                .schoolName(user.getSchoolName())
                .githubUrl(user.getGithubUrl())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
