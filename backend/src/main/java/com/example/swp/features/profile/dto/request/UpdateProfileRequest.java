package com.example.swp.features.profile.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String fptStudentId;
    private String schoolName;
    private String githubUrl;
    private String bio;

    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getFptStudentId() { return fptStudentId; }
    public String getSchoolName() { return schoolName; }
    public String getGithubUrl() { return githubUrl; }
    public String getBio() { return bio; }
}
