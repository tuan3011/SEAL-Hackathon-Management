package com.example.swp.features.submission;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.lang.NonNull;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    @EntityGraph(attributePaths = {"team", "round", "team.event"})
    List<Submission> findByTeamId(Long teamId);
    
    @EntityGraph(attributePaths = {"team", "round", "team.event"})
    List<Submission> findByRoundId(Long roundId);
    
    @EntityGraph(attributePaths = {"team", "round", "team.event"})
    Optional<Submission> findByTeamIdAndRoundId(Long teamId, Long roundId);

    @EntityGraph(attributePaths = {"team", "round", "team.event"})
    @Query("SELECT s FROM Submission s WHERE s.round.hackathonEvent.id = :eventId")
    List<Submission> findByEventId(Long eventId);

    @EntityGraph(attributePaths = {"team", "round", "team.event"})
    @NonNull Optional<Submission> findById(@NonNull Long id);
}
