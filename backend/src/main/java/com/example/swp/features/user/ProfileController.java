package com.example.swp.features.user;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.user.dto.UserResponse;
import com.example.swp.features.user.dto.request.ChangePasswordRequest;
import com.example.swp.features.user.dto.request.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController("userProfileController")
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile() {
        UserResponse response = userService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully."));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully."));
    }
    
    @PutMapping("/avatar")
    public ResponseEntity<ApiResponse<Void>> updateAvatar(@RequestParam("file") MultipartFile file) {
        // Implement FileStorageService logic here if needed
        // String avatarUrl = fileStorageService.storeFile(file);
        // userService.updateAvatar(avatarUrl);
        return ResponseEntity.ok(ApiResponse.success(null, "Avatar updated successfully (Placeholder)."));
    }
}
