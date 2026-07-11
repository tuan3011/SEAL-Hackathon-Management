package com.example.swp.features.judge_assignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, Long> {
    List<JudgeAssignment> findByJudgeId(Long judgeId);
    List<JudgeAssignment> findByRoundId(Long roundId);
    List<JudgeAssignment> findByJudgeIdAndRoundId(Long judgeId, Long roundId);
    boolean existsByJudgeIdAndRoundIdAndTrackId(Long judgeId, Long roundId, Long trackId);
    boolean existsByJudgeIdAndRoundIdAndTrackIdIsNull(Long judgeId, Long roundId);
    List<JudgeAssignment> findByRoundHackathonEventId(Long hackathonEventId);
}