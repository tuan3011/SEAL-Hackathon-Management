package com.example.swp.features.round;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRoundAdvancementRepository extends JpaRepository<TeamRoundAdvancement, Long> {
    boolean existsByFromRoundId(Long fromRoundId);
    List<TeamRoundAdvancement> findByToRoundId(Long toRoundId);
    boolean existsByTeamIdAndToRoundId(Long teamId, Long toRoundId);
}
