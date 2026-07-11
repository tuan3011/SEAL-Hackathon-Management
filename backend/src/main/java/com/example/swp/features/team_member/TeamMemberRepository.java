package com.example.swp.features.team_member;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    @EntityGraph(attributePaths = {"user", "team"})
    List<TeamMember> findByTeamId(Long teamId);
    
    @EntityGraph(attributePaths = {"user", "team", "team.event"})
    List<TeamMember> findByUserId(Long userId);
    
    @EntityGraph(attributePaths = {"user", "team"})
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);
    
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
    boolean existsByTeamIdAndUserIdAndIsLeaderTrue(Long teamId, Long userId);
    long countByTeamId(Long teamId);
}