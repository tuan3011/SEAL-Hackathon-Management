package com.example.swp.features.score;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    @EntityGraph(attributePaths = {"judge", "submission", "criterion"})
    List<Score> findBySubmissionId(Long submissionId);
    
    @EntityGraph(attributePaths = {"judge", "submission", "criterion"})
    List<Score> findBySubmissionIdIn(List<Long> submissionIds);

    @EntityGraph(attributePaths = {"judge", "submission", "criterion"})
    List<Score> findByJudgeId(Long judgeId);
    
    @EntityGraph(attributePaths = {"judge", "submission", "criterion"})
    List<Score> findBySubmissionIdAndJudgeId(Long submissionId, Long judgeId);
    
    @EntityGraph(attributePaths = {"judge", "submission", "criterion"})
    Optional<Score> findBySubmissionIdAndJudgeIdAndCriterionId(Long submissionId, Long judgeId, Long criterionId);

    boolean existsByCriterionId(Long criterionId);

    @Modifying
    @Query("UPDATE Score s SET s.isFinalized = true WHERE s.submission.id IN (SELECT sub.id FROM Submission sub WHERE sub.round.id = :roundId)")
    void finalizeScoresByRound(Long roundId);

    @Query("SELECT s FROM Score s JOIN FETCH s.judge JOIN FETCH s.submission sub JOIN FETCH s.criterion WHERE sub.round.id = :roundId AND s.judge.id = :judgeId")
    List<Score> findByRoundIdAndJudgeId(Long roundId, Long judgeId);
}
