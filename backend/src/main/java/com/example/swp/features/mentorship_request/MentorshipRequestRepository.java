package com.example.swp.features.mentorship_request;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.lang.NonNull;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {
    @EntityGraph(attributePaths = {"team", "mentor"})
    List<MentorshipRequest> findByTeamId(Long teamId);

    @EntityGraph(attributePaths = {"team", "mentor"})
    List<MentorshipRequest> findByMentorId(Long mentorId);

    @EntityGraph(attributePaths = {"team", "mentor"})
    List<MentorshipRequest> findByStatus(MentorshipRequestStatus status);

    @EntityGraph(attributePaths = {"team", "mentor"})
    @NonNull Optional<MentorshipRequest> findById(@NonNull Long id);
}
