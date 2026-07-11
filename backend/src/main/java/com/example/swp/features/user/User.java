package com.example.swp.features.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "fpt_student_id", unique = true)
    private String fptStudentId;
    private String schoolName;
    private String githubUrl;
    @Lob
    private String skills;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    @Lob
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "approved")
    @Builder.Default
    private Boolean approved = false;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean verified = false;

    private String otpCode;
    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    /** Marks accounts created temporarily by organizers for guest judges. */
    @Column(name = "is_temporary")
    @Builder.Default
    private Boolean temporary = false;
    
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public void setActive(boolean active) { this.approved = active; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public String getEmail() { return email; }
    public String getFptStudentId() { return fptStudentId; }
    public String getSchoolName() { return schoolName; }
    public Long getId() { return id; }
    public boolean isApproved() { return Boolean.TRUE.equals(approved); }
    public boolean isActive() { return Boolean.TRUE.equals(approved); }
    public boolean isVerified() { return Boolean.TRUE.equals(verified); }
    public String getOtpCode() { return otpCode; }
    public LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public void setOtpExpiry(LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public void setFptStudentId(String fptStudentId) { this.fptStudentId = fptStudentId; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
    public boolean isTemporary() { return Boolean.TRUE.equals(temporary); }
    public void setTemporary(boolean temporary) { this.temporary = temporary; }
    
    public boolean isProfileComplete() {
        return fptStudentId != null && !fptStudentId.trim().isEmpty()
                && fullName != null && !fullName.trim().isEmpty()
                && phone != null && !phone.trim().isEmpty()
                && schoolName != null && !schoolName.trim().isEmpty();
    }
}