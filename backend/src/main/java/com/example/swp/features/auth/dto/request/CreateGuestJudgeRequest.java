package com.example.swp.features.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for organizer to create a temporary Guest Judge account.
 * Guest judges skip OTP flow and are auto-approved.
 */
@Data
public class CreateGuestJudgeRequest {

    @NotBlank(message = "Username cannot be empty")
    private String username;

    @NotBlank(message = "Password cannot be empty")
    private String password;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Must be a valid email address")
    private String email;

    private String fullName;

    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
}
