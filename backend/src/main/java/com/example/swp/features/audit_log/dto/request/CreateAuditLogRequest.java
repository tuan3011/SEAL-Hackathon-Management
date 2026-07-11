package com.example.swp.features.audit_log.dto.request;

import lombok.Data;

@Data
public class CreateAuditLogRequest {
    private Long userId; // The user who performed the action
    private String action;
    private String details;

}
