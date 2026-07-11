package com.example.swp.features.user;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.user.dto.UserResponse;
import com.example.swp.features.user.dto.request.CreateUserRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<UserResponse>> approveUser(@PathVariable Long id) {
        UserResponse response = userService.approveUser(id);
        return ResponseEntity.ok(ApiResponse.success(response, "User approved successfully."));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated successfully."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return new ResponseEntity<>(ApiResponse.success(response, "User created successfully."), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(Pageable pageable) {
        Page<UserResponse> responses = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPendingUsers(Pageable pageable) {
        Page<UserResponse> responses = userService.getPendingUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
    
    @GetMapping("/role/{role}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@PathVariable Role role) {
        List<UserResponse> responses = userService.getUsersByRole(role);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
