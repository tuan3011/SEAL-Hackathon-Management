package com.example.swp.features.hackathon_event.dto.response;

import com.example.swp.features.hackathon_event.HackathonStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HackathonEventResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;
    private Integer minTeamSize;
    private Integer maxTeamSize;
    private String rules;
    private String imageUrl;
    private Long organizerId;
    private String organizerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Danh sách trạng thái hợp lệ tiếp theo.
     * Frontend có thể dùng để render dropdown chỉ hiện các status được phép.
     */
    private Set<HackathonStatus> allowedStatusTransitions;
}
