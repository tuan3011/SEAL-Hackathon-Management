package com.example.swp.features.profile;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.profile.dto.request.UpdateProfileRequest;
import com.example.swp.features.profile.dto.response.ProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController("featuresProfileController")
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getMyProfile() {
        ProfileResponse response = profileService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        ProfileResponse response = profileService.updateMyProfile(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully."));
    }
}