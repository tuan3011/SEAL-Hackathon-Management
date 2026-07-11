package com.example.swp.features.audit_log;

import com.example.swp.features.audit_log.dto.request.CreateAuditLogRequest;
import com.example.swp.features.audit_log.dto.response.AuditLogResponse;

import java.util.List;

public interface AuditLogService {
    AuditLogResponse createAuditLog(CreateAuditLogRequest request);
    List<AuditLogResponse> getAllAuditLogs();
    List<AuditLogResponse> getAuditLogsByUser(Long userId);
    org.springframework.data.domain.Page<AuditLogResponse> getAuditLogsByEvent(Long eventId, org.springframework.data.domain.Pageable pageable);
    void logAction(String action, String entityType, Long entityId, String oldValue, String newValue, Long eventId);
    org.springframework.web.servlet.mvc.method.annotation.SseEmitter subscribeToEventLogs(Long eventId);
    
    default void logAction(String action, String entityType, Long entityId, String oldValue, String newValue) {
        logAction(action, entityType, entityId, oldValue, newValue, null);
    }
}
