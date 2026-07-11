package com.example.swp.features.support_ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplyTicketRequest {
    @NotBlank(message = "Reply message cannot be empty")
    private String replyMessage;
}
