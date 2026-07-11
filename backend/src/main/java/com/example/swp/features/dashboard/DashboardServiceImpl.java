package com.example.swp.features.dashboard;

import com.example.swp.features.dashboard.dto.DashboardStatsResponse;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;

import com.example.swp.features.mentorship_request.MentorshipRequestRepository;
import com.example.swp.features.mentorship_request.MentorshipRequestStatus;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.score.ScoreRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DashboardServiceImpl implements DashboardService {

    private final TeamRepository teamRepository;
    private final SubmissionRepository submissionRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final ScoreRepository scoreRepository;

    @Override
    public DashboardStatsResponse getDashboardStats(Long hackathonEventId) {
        long activeTeams = teamRepository.findByEventId(hackathonEventId).size();
        long submissionsReceived = submissionRepository.findByEventId(hackathonEventId).size();
        
        long pendingReviews = mentorshipRequestRepository.findByStatus(MentorshipRequestStatus.OPEN).stream()
                .filter(mr -> mr.getTeam() != null && mr.getTeam().getEvent() != null && mr.getTeam().getEvent().getId().equals(hackathonEventId))
                .count();
        
        long daysRemaining = 0;
        
        HackathonEvent event = hackathonEventRepository.findById(hackathonEventId).orElse(null);
        if (event != null && event.getEndTime() != null && event.getEndTime().isAfter(LocalDateTime.now())) {
            daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), event.getEndTime());
        }

        List<Submission> submissions = submissionRepository.findByEventId(hackathonEventId);
        List<Long> submissionIds = submissions.stream().map(Submission::getId).collect(Collectors.toList());
        List<com.example.swp.features.score.Score> scores = List.of();
        if (!submissionIds.isEmpty()) {
            scores = scoreRepository.findBySubmissionIdIn(submissionIds).stream()
                    .filter(com.example.swp.features.score.Score::isFinalized)
                    .collect(Collectors.toList());
        }

        java.util.Map<com.example.swp.features.criterion.Criterion, List<com.example.swp.features.score.Score>> scoresByCriterion = scores.stream()
                .collect(Collectors.groupingBy(com.example.swp.features.score.Score::getCriterion));

        List<DashboardStatsResponse.CriterionVarianceDto> criterionVariances = new java.util.ArrayList<>();
        
        for (java.util.Map.Entry<com.example.swp.features.criterion.Criterion, List<com.example.swp.features.score.Score>> entry : scoresByCriterion.entrySet()) {
            com.example.swp.features.criterion.Criterion criterion = entry.getKey();
            List<com.example.swp.features.score.Score> critScores = entry.getValue();
            
            java.util.Map<Long, List<com.example.swp.features.score.Score>> scoresBySub = critScores.stream()
                    .collect(Collectors.groupingBy(s -> s.getSubmission().getId()));
            
            double totalVariance = 0;
            int validSubmissions = 0;
            
            for (List<com.example.swp.features.score.Score> subScores : scoresBySub.values()) {
                if (subScores.size() > 1) {
                    double mean = subScores.stream().mapToDouble(com.example.swp.features.score.Score::getScoreValue).average().orElse(0.0);
                    double variance = subScores.stream().mapToDouble(s -> Math.pow(s.getScoreValue() - mean, 2)).sum() / subScores.size();
                    totalVariance += variance;
                    validSubmissions++;
                }
            }
            
            double avgVariance = validSubmissions > 0 ? totalVariance / validSubmissions : 0.0;
            
            criterionVariances.add(DashboardStatsResponse.CriterionVarianceDto.builder()
                    .criterionId(criterion.getId())
                    .criterionName(criterion.getName())
                    .variance(Math.round(avgVariance * 100.0) / 100.0)
                    .build());
        }

        return DashboardStatsResponse.builder()
                .activeTeams(activeTeams)
                .submissionsReceived(submissionsReceived)
                .pendingReviews(pendingReviews)
                .daysRemaining(daysRemaining)
                .criterionVariances(criterionVariances)
                .build();
    }
}
