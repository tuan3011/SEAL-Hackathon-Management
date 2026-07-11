package com.example.swp.features.user.dto.request;

import com.example.swp.features.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    @NotNull
    private Role role;
    private String fptStudentId;
    private String schoolName;
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public Role getRole() { return role; }
    public String getFptStudentId() { return fptStudentId; }
    public String getSchoolName() { return schoolName; }
}
