package com.example.swp.features.ranking;

import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.score.Score;
import com.example.swp.features.score.ScoreRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.criterion.Criterion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class RankingService {

    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;

    public List<TeamRankingResponse> getRankingForRound(Long roundId) {
        List<Submission> submissions = submissionRepository.findByRoundId(roundId).stream()
                .filter(sub -> sub.getTeam().getStatus() != com.example.swp.features.team.TeamStatus.DISQUALIFIED)
                .collect(Collectors.toList());
                
        if (submissions.isEmpty()) {
            return List.of();
        }

        List<Long> submissionIds = submissions.stream().map(Submission::getId).collect(Collectors.toList());

        List<Score> scoresForRound = scoreRepository.findBySubmissionIdIn(submissionIds).stream()
                .filter(Score::isFinalized)
                .collect(Collectors.toList());

        Map<Submission, List<Score>> scoresBySubmission = scoresForRound.stream()
                .collect(Collectors.groupingBy(Score::getSubmission));

        List<TeamRankingResponse> rankings = scoresBySubmission.entrySet().stream()
                .map(entry -> {
                    Submission submission = entry.getKey();
                    List<Score> submissionScores = entry.getValue();
                    BigDecimal finalScore = calculateFinalScore(submissionScores);

                    // Tính điểm trung bình cho từng tiêu chí
                    Map<Criterion, Double> avgScores = submissionScores.stream()
                            .collect(Collectors.groupingBy(
                                    Score::getCriterion,
                                    Collectors.averagingDouble(Score::getScoreValue)
                            ));

                    List<TeamRankingResponse.CriterionScoreDto> breakdown = avgScores.entrySet().stream()
                            .map(e -> TeamRankingResponse.CriterionScoreDto.builder()
                                    .criterionId(e.getKey().getId())
                                    .criterionName(e.getKey().getName())
                                    .averageScore(BigDecimal.valueOf(e.getValue()).setScale(2, RoundingMode.HALF_UP).doubleValue())
                                    .weight(e.getKey().getWeight())
                                    .build())
                            .collect(Collectors.toList());

                    com.example.swp.features.track.Track track = submission.getTeam().getTrack();

                    return TeamRankingResponse.builder()
                            .teamId(submission.getTeam().getId())
                            .teamName(submission.getTeam().getName())
                            .projectName(submission.getTeam().getProjectName())
                            .finalScore(finalScore)
                            .trackId(track != null ? track.getId() : null)
                            .trackName(track != null ? track.getName() : null)
                            .criterionBreakdown(breakdown)
                            .submittedAt(submission.getSubmittedAt())
                            .build();
                })
                .collect(Collectors.toList());

        // Group by trackId and assign ranks per track
        Map<Long, List<TeamRankingResponse>> groupedByTrack = rankings.stream()
                .collect(Collectors.groupingBy(r -> r.getTrackId() != null ? r.getTrackId() : -1L));

        List<TeamRankingResponse> finalRankings = new java.util.ArrayList<>();
        
        for (List<TeamRankingResponse> trackRankings : groupedByTrack.values()) {
            trackRankings.sort((r1, r2) -> {
                int scoreComp = r2.getFinalScore().compareTo(r1.getFinalScore());
                if (scoreComp != 0) {
                    return scoreComp;
                }

                // Tie-breaker 1: Compare average score of criteria, from highest weight to lowest
                List<TeamRankingResponse.CriterionScoreDto> b1 = r1.getCriterionBreakdown();
                List<TeamRankingResponse.CriterionScoreDto> b2 = r2.getCriterionBreakdown();
                if (b1 != null && b2 != null) {
                    List<TeamRankingResponse.CriterionScoreDto> s1 = b1.stream()
                            .sorted(Comparator.comparingInt(TeamRankingResponse.CriterionScoreDto::getWeight).reversed())
                            .collect(Collectors.toList());
                    List<TeamRankingResponse.CriterionScoreDto> s2 = b2.stream()
                            .sorted(Comparator.comparingInt(TeamRankingResponse.CriterionScoreDto::getWeight).reversed())
                            .collect(Collectors.toList());
                    int size = Math.min(s1.size(), s2.size());
                    for (int i = 0; i < size; i++) {
                        double avg1 = s1.get(i).getAverageScore();
                        double avg2 = s2.get(i).getAverageScore();
                        if (Double.compare(avg2, avg1) != 0) {
                            return Double.compare(avg2, avg1);
                        }
                    }
                }

                // Tie-breaker 2: Compare submission time (earlier is better)
                if (r1.getSubmittedAt() != null && r2.getSubmittedAt() != null) {
                    return r1.getSubmittedAt().compareTo(r2.getSubmittedAt());
                }
                return r1.getTeamId().compareTo(r2.getTeamId());
            });
            for (int i = 0; i < trackRankings.size(); i++) {
                trackRankings.get(i).setRank(i + 1);
            }
            finalRankings.addAll(trackRankings);
        }

        // Sort the final list by trackId then rank for clean output
        finalRankings.sort(Comparator.comparing((TeamRankingResponse r) -> r.getTrackId() != null ? r.getTrackId() : -1L)
                .thenComparing(TeamRankingResponse::getRank));

        return finalRankings;
    }

    public BigDecimal calculateFinalScore(List<Score> scores) {
        if (scores.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Group scores by judge
        Map<Long, List<Score>> scoresByJudge = scores.stream()
                .collect(Collectors.groupingBy(score -> score.getJudge().getId()));

        BigDecimal totalScoreFromAllJudges = BigDecimal.ZERO;
        for (List<Score> judgeScores : scoresByJudge.values()) {
            BigDecimal judgeTotalWeightedScore = BigDecimal.ZERO;
            BigDecimal totalWeight = BigDecimal.ZERO;

            for (Score score : judgeScores) {
                BigDecimal scoreValue = BigDecimal.valueOf(score.getScoreValue());
                BigDecimal weight = BigDecimal.valueOf(score.getCriterion().getWeight());
                judgeTotalWeightedScore = judgeTotalWeightedScore.add(scoreValue.multiply(weight));
                totalWeight = totalWeight.add(weight);
            }

            if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
                totalScoreFromAllJudges = totalScoreFromAllJudges.add(judgeTotalWeightedScore.divide(totalWeight, 4, RoundingMode.HALF_UP));
            }
        }

        return totalScoreFromAllJudges.divide(BigDecimal.valueOf(scoresByJudge.size()), 2, RoundingMode.HALF_UP);
    }
}
