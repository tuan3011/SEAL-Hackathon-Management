package com.example.swp.features.audit_log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AuditLog> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT al FROM AuditLog al WHERE " +
            "al.eventId = :eventId OR " +
            "(al.entityType = 'HACKATHON_EVENT' AND al.entityId = :eventId) OR " +
            "(al.entityType = 'ROUND' AND al.entityId IN (SELECT r.id FROM Round r WHERE r.hackathonEvent.id = :eventId)) OR " +
            "(al.entityType = 'TRACK' AND al.entityId IN (SELECT t.id FROM Track t WHERE t.hackathonEvent.id = :eventId)) OR " +
            "(al.entityType = 'CRITERION' AND al.entityId IN (SELECT c.id FROM Criterion c WHERE c.hackathonEvent.id = :eventId)) OR " +
            "(al.entityType = 'PRIZE' AND al.entityId IN (SELECT p.id FROM Prize p WHERE p.hackathonEvent.id = :eventId)) OR " +
            "(al.entityType = 'JUDGE_ASSIGNMENT' AND al.entityId IN (SELECT ja.id FROM JudgeAssignment ja WHERE ja.round.hackathonEvent.id = :eventId)) " +
            "ORDER BY al.createdAt DESC")
    org.springframework.data.domain.Page<AuditLog> findByEventIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("eventId") Long eventId, org.springframework.data.domain.Pageable pageable);
}
