package com.example.swp.features.judge_assignment.dto.response;

import com.example.swp.features.judge_assignment.JudgeAssignmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeAssignmentResponse {
    private Long id;
    private Long judgeId;
    private String judgeName;
    private Long roundId;
    private String roundName;
    private Long trackId;
    private String trackName;
    private JudgeAssignmentStatus status;
    private LocalDateTime assignedAt;

    public static JudgeAssignmentResponseBuilder builder() { return new JudgeAssignmentResponseBuilder(); }
    public static class JudgeAssignmentResponseBuilder {
        private Long id;
        private Long judgeId;
        private String judgeName;
        private Long roundId;
        private String roundName;
        private Long trackId;
        private String trackName;
        private JudgeAssignmentStatus status;
        private LocalDateTime assignedAt;

        public JudgeAssignmentResponseBuilder id(Long id) { this.id = id; return this; }
        public JudgeAssignmentResponseBuilder judgeId(Long judgeId) { this.judgeId = judgeId; return this; }
        public JudgeAssignmentResponseBuilder judgeName(String judgeName) { this.judgeName = judgeName; return this; }
        public JudgeAssignmentResponseBuilder roundId(Long roundId) { this.roundId = roundId; return this; }
        public JudgeAssignmentResponseBuilder roundName(String roundName) { this.roundName = roundName; return this; }
        public JudgeAssignmentResponseBuilder trackId(Long trackId) { this.trackId = trackId; return this; }
        public JudgeAssignmentResponseBuilder trackName(String trackName) { this.trackName = trackName; return this; }
        public JudgeAssignmentResponseBuilder status(JudgeAssignmentStatus status) { this.status = status; return this; }
        public JudgeAssignmentResponseBuilder assignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; return this; }

        public JudgeAssignmentResponse build() {
            JudgeAssignmentResponse j = new JudgeAssignmentResponse();
            j.id = this.id; j.judgeId = this.judgeId; j.judgeName = this.judgeName;
            j.roundId = this.roundId; j.roundName = this.roundName;
            j.trackId = this.trackId; j.trackName = this.trackName;
            j.status = this.status; j.assignedAt = this.assignedAt;
            return j;
        }
    }
}

