package com.example.swp.features.team;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.lang.NonNull;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByNameAndEventId(String name, Long eventId);
    
    @EntityGraph(attributePaths = {"teamMembers", "teamMembers.user"})
    List<Team> findByTrackId(Long trackId);
    
    @EntityGraph(attributePaths = {"teamMembers", "teamMembers.user"})
    List<Team> findByEventId(Long eventId);

    @EntityGraph(attributePaths = {"teamMembers", "teamMembers.user"})
    @NonNull Optional<Team> findById(@NonNull Long id);
}
