package com.example.swp.features.export;

import com.example.swp.common.CsvExportUtils;
import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.ranking.RankingService;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.round.Round;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.score.Score;
import com.example.swp.features.score.ScoreRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ExportService {

    private final RankingService rankingService;
    private final RoundRepository roundRepository;
    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;
    private final com.example.swp.features.team.TeamRepository teamRepository;
    private final com.example.swp.features.user.UserRepository userRepository;
    private final AuditLogService auditLogService;

    public byte[] exportRankingCsv(Long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round not found"));

        List<TeamRankingResponse> rankings = rankingService.getRankingForRound(roundId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            out.write(CsvExportUtils.UTF8_BOM);

            String header = "Rank,Team ID,Team Name,Project Name,Final Score\n";
            out.write(header.getBytes(StandardCharsets.UTF_8));

            for (TeamRankingResponse r : rankings) {
                String line = String.format("%d,%s,%s,%s,%s\n",
                        r.getRank(),
                        r.getTeamId(),
                        CsvExportUtils.escapeCsvField(r.getTeamName()),
                        CsvExportUtils.escapeCsvField(r.getProjectName()),
                        r.getFinalScore() != null ? r.getFinalScore().toString() : "0.00"
                );
                out.write(line.getBytes(StandardCharsets.UTF_8));
            }

            auditLogService.logAction("EXPORT_CSV", "ROUND", roundId, "0", "Exported ranking CSV for round " + round.getName());
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }

    public byte[] exportAnonymizedScoringCsv(Long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round not found"));

        List<Submission> submissions = submissionRepository.findByRoundId(roundId);
        List<Long> submissionIds = submissions.stream().map(Submission::getId).collect(Collectors.toList());
        List<Score> scores = submissionIds.isEmpty() ? List.of() : scoreRepository.findBySubmissionIdIn(submissionIds);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            out.write(CsvExportUtils.UTF8_BOM);

            String header = "Submission ID,Team ID,Anonymous Judge ID,Criterion Name,Weight,Score Value,Is Finalized\n";
            out.write(header.getBytes(StandardCharsets.UTF_8));

            for (Score s : scores) {
                String line = String.format("%d,%d,JUDGE_%d,%s,%s,%s,%b\n",
                        s.getSubmission().getId(),
                        s.getSubmission().getTeam().getId(),
                        s.getJudge().getId(), // Anonymized to just ID
                        CsvExportUtils.escapeCsvField(s.getCriterion().getName()),
                        s.getCriterion().getWeight(),
                        s.getScoreValue(),
                        s.isFinalized()
                );
                out.write(line.getBytes(StandardCharsets.UTF_8));
            }

            auditLogService.logAction("EXPORT_CSV", "ROUND", roundId, "0", "Exported anonymized scoring CSV for round " + round.getName());
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }

    public byte[] exportTeamsCsv() {
        List<com.example.swp.features.team.Team> teams = teamRepository.findAll();
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            out.write(CsvExportUtils.UTF8_BOM);

            String header = "Team ID,Team Name,Project Name,Track Name,Status,Final Score\n";
            out.write(header.getBytes(StandardCharsets.UTF_8));

            for (com.example.swp.features.team.Team t : teams) {
                List<Submission> submissions = submissionRepository.findByTeamId(t.getId());
                List<Long> subIds = submissions.stream().map(Submission::getId).collect(Collectors.toList());
                List<Score> scores = subIds.isEmpty() ? List.of() : scoreRepository.findBySubmissionIdIn(subIds);
                java.math.BigDecimal finalScore = rankingService.calculateFinalScore(scores);

                String line = String.format("%d,%s,%s,%s,%s,%s\n",
                        t.getId(),
                        CsvExportUtils.escapeCsvField(t.getName()),
                        CsvExportUtils.escapeCsvField(t.getProjectName()),
                        CsvExportUtils.escapeCsvField(t.getTrack() != null ? t.getTrack().getName() : "None"),
                        t.getStatus(),
                        finalScore.toString()
                );
                out.write(line.getBytes(StandardCharsets.UTF_8));
            }

            auditLogService.logAction("EXPORT_CSV", "TEAM", null, "0", "Exported all teams CSV");
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }

    public byte[] exportParticipantsCsv() {
        List<com.example.swp.features.user.User> users = userRepository.findByRole(com.example.swp.features.user.Role.PARTICIPANT);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            out.write(CsvExportUtils.UTF8_BOM);

            String header = "User ID,Username,Email,Full Name,FPT Student ID,School Name\n";
            out.write(header.getBytes(StandardCharsets.UTF_8));

            for (com.example.swp.features.user.User u : users) {
                String line = String.format("%d,%s,%s,%s,%s,%s\n",
                        u.getId(),
                        CsvExportUtils.escapeCsvField(u.getUsername()),
                        CsvExportUtils.escapeCsvField(u.getEmail()),
                        CsvExportUtils.escapeCsvField(u.getFullName()),
                        CsvExportUtils.escapeCsvField(u.getFptStudentId()),
                        CsvExportUtils.escapeCsvField(u.getSchoolName())
                );
                out.write(line.getBytes(StandardCharsets.UTF_8));
            }

            auditLogService.logAction("EXPORT_CSV", "USER", null, "0", "Exported all participants CSV");
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }
}
