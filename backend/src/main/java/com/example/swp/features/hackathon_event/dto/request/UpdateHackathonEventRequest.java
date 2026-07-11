package com.example.swp.features.hackathon_event.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO cho update hackathon event.
 * Tất cả fields đều optional — chỉ update field nào được gửi lên (non-null).
 */
@Data
public class UpdateHackathonEventRequest {

    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;

    @Min(value = 1, message = "Minimum team size must be at least 1")
    private Integer minTeamSize;

    @Min(value = 1, message = "Maximum team size must be at least 1")
    private Integer maxTeamSize;

    private String rules;
    private String imageUrl;
    private Long organizerId;
}
