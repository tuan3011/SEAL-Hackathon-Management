package com.example.swp.features.audit_log;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.dto.request.CreateAuditLogRequest;
import com.example.swp.features.audit_log.dto.response.AuditLogResponse;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final com.example.swp.features.hackathon_event.HackathonEventRepository hackathonEventRepository;

    @Override
    public AuditLogResponse createAuditLog(CreateAuditLogRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(request.getAction())
                .details(request.getDetails())
                .build();
        
        AuditLog savedLog = auditLogRepository.save(auditLog);
        return mapToResponse(savedLog);
    }

    @Override
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLogResponse> getAuditLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public org.springframework.data.domain.Page<AuditLogResponse> getAuditLogsByEvent(Long eventId, org.springframework.data.domain.Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        com.example.swp.features.hackathon_event.HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        if (currentUser.getRole() != com.example.swp.features.user.Role.ADMIN) {
            if (event.getOrganizer() == null || !event.getOrganizer().getId().equals(currentUser.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to view the audit logs for this event.");
            }
        }

        return auditLogRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable)
                .map(this::mapToResponse);
    }
    
    @Override
    public void logAction(String action, String entityType, Long entityId, String oldValue, String newValue, Long eventId) {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null) ? auth.getName() : "SYSTEM";
        User currentUser = userRepository.findByUsername(username).orElse(null); // Can be null for system actions

        String details = String.format("Entity: %s, ID: %d", entityType, entityId);
        if (oldValue != null) details += ", Old: " + oldValue;
        if (newValue != null) details += ", New: " + newValue;

        AuditLog auditLog = AuditLog.builder()
                .user(currentUser)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .details(details)
                .eventId(eventId)
                .build();
        AuditLog savedLog = auditLogRepository.save(auditLog);

        // Notify active SSE subscribers
        if (eventId != null) {
            java.util.List<org.springframework.web.servlet.mvc.method.annotation.SseEmitter> eventEmitters = emitters.get(eventId);
            if (eventEmitters != null) {
                AuditLogResponse response = mapToResponse(savedLog);
                java.util.List<org.springframework.web.servlet.mvc.method.annotation.SseEmitter> deadEmitters = new java.util.ArrayList<>();
                for (org.springframework.web.servlet.mvc.method.annotation.SseEmitter e : eventEmitters) {
                    try {
                        e.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                                .name("LOG_ADDED")
                                .data(response));
                    } catch (Exception ex) {
                        deadEmitters.add(e);
                    }
                }
                eventEmitters.removeAll(deadEmitters);
            }
        }
    }

    private final java.util.Map<Long, java.util.List<org.springframework.web.servlet.mvc.method.annotation.SseEmitter>> emitters = new java.util.concurrent.ConcurrentHashMap<>();

    @Override
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter subscribeToEventLogs(Long eventId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        com.example.swp.features.hackathon_event.HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        if (currentUser.getRole() != com.example.swp.features.user.Role.ADMIN) {
            if (event.getOrganizer() == null || !event.getOrganizer().getId().equals(currentUser.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to view the audit logs for this event.");
            }
        }

        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(30 * 60 * 1000L); // 30 minutes
        emitters.computeIfAbsent(eventId, k -> new java.util.concurrent.CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(eventId, emitter));
        emitter.onTimeout(() -> removeEmitter(eventId, emitter));
        emitter.onError((ex) -> removeEmitter(eventId, emitter));

        try {
            emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                    .name("INIT")
                    .data("Connected to Real-time Activity Feed for Event " + eventId));
        } catch (Exception e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    private void removeEmitter(Long eventId, org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter) {
        java.util.List<org.springframework.web.servlet.mvc.method.annotation.SseEmitter> eventEmitters = emitters.get(eventId);
        if (eventEmitters != null) {
            eventEmitters.remove(emitter);
            if (eventEmitters.isEmpty()) {
                emitters.remove(eventId);
            }
        }
    }

    private AuditLogResponse mapToResponse(AuditLog auditLog) {
        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .userId(auditLog.getUser() != null ? auditLog.getUser().getId() : null)
                .username(auditLog.getUser() != null ? auditLog.getUser().getUsername() : "SYSTEM")
                .action(auditLog.getAction())
                .details(auditLog.getDetails())
                .createdAt(auditLog.getCreatedAt())
                .oldValue(auditLog.getOldValue())
                .newValue(auditLog.getNewValue())
                .build();
    }
}
