package com.example.swp.features.team.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TeamInvitationResponse {
    private Long id;
    private Long teamId;
    private String teamName;
    private String inviterName;
    private String inviteeEmail;
    private String status;
    private LocalDateTime createdAt;
}

