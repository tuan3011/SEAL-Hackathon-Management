package com.example.swp.features.support_ticket.dto;

import com.example.swp.features.support_ticket.TicketStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SupportTicketResponse {
    private Long id;
    private String fullName;
    private String email;
    private String message;
    private TicketStatus status;
    private LocalDateTime createdAt;
}
