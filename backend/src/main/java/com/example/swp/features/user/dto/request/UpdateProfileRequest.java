package com.example.swp.features.user.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String bio;
    private String fptStudentId;
    private String schoolName;
    private String githubUrl;
    
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getBio() { return bio; }
    public String getFptStudentId() { return fptStudentId; }
    public String getSchoolName() { return schoolName; }
    public String getGithubUrl() { return githubUrl; }
}
