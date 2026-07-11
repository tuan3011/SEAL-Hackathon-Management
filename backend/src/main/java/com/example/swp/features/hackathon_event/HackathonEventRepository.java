package com.example.swp.features.hackathon_event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.lang.NonNull;

@Repository
public interface HackathonEventRepository extends JpaRepository<HackathonEvent, Long> {
    @Override
    @EntityGraph(attributePaths = {"organizer"})
    @NonNull Page<HackathonEvent> findAll(@NonNull Pageable pageable);

    @EntityGraph(attributePaths = {"organizer"})
    Optional<HackathonEvent> findBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"organizer"})
    Page<HackathonEvent> findByIsDeletedFalse(Pageable pageable);
    
    @EntityGraph(attributePaths = {"organizer"})
    Page<HackathonEvent> findByIsDeletedFalseAndStatus(HackathonStatus status, Pageable pageable);
    
    @EntityGraph(attributePaths = {"organizer"})
    Page<HackathonEvent> findByIsDeletedFalseAndStatusIn(List<HackathonStatus> statuses, Pageable pageable);
    
    @EntityGraph(attributePaths = {"organizer"})
    List<HackathonEvent> findByOrganizerIdAndIsDeletedFalseOrderByCreatedAtDesc(Long organizerId);
    
    @Override
    @EntityGraph(attributePaths = {"organizer"})
    @NonNull Optional<HackathonEvent> findById(@NonNull Long id);

    boolean existsByStatusInAndIsDeletedFalseAndIdNot(List<HackathonStatus> statuses, Long id);
}
