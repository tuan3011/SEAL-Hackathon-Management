package com.example.swp.features.user.dto;

import com.example.swp.features.user.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String fptStudentId;
    private String schoolName;
    private boolean approved;
    private boolean isActive;

}


