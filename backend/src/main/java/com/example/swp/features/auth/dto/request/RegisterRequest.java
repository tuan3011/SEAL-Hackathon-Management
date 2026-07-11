package com.example.swp.features.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @jakarta.validation.constraints.Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String fptStudentId;

    private String schoolName;
    
    @NotBlank
    private String username;

    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFptStudentId() { return fptStudentId; }
    public String getSchoolName() { return schoolName; }
}