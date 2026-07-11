package com.example.swp.features.mentorship_request.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectMentorshipRequest {
    @NotBlank(message = "Reason is required")
    private String reason;
}
