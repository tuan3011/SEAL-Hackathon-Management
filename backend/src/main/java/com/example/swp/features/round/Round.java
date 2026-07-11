package com.example.swp.features.round;

import com.example.swp.features.hackathon_event.HackathonEvent;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "round")
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hackathon_event_id")
    private HackathonEvent hackathonEvent;

    @Column(name = "advancement_slots")
    private Integer advancementSlots;

    @Column(name = "submission_deadline")
    private LocalDateTime submissionDeadline;

    @Column(name = "round_order", nullable = false)
    @Builder.Default
    private Integer roundOrder = 1;

    @Column(name = "grading_end_time")
    private LocalDateTime gradingEndTime;

    @Column(name = "grading_ended", nullable = false)
    @Builder.Default
    private Boolean gradingEnded = false;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public HackathonEvent getHackathonEvent() { return hackathonEvent; }
    public Integer getAdvancementSlots() { return advancementSlots; }
    public LocalDateTime getSubmissionDeadline() { return submissionDeadline; }
    public Integer getRoundOrder() { return roundOrder; }
    public LocalDateTime getGradingEndTime() { return gradingEndTime; }
    public Boolean getGradingEnded() { return gradingEnded; }
    public void setGradingEndTime(LocalDateTime gradingEndTime) { this.gradingEndTime = gradingEndTime; }
    public void setGradingEnded(Boolean gradingEnded) { this.gradingEnded = gradingEnded; }

    public static RoundBuilder builder() { return new RoundBuilder(); }
    public static class RoundBuilder {
        private Long id;
        private String name;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private HackathonEvent hackathonEvent;
        private Integer advancementSlots;
        private LocalDateTime submissionDeadline;
        private Integer roundOrder;
        private LocalDateTime gradingEndTime;
        private Boolean gradingEnded;

        public RoundBuilder id(Long id) { this.id = id; return this; }
        public RoundBuilder name(String name) { this.name = name; return this; }
        public RoundBuilder description(String description) { this.description = description; return this; }
        public RoundBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public RoundBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public RoundBuilder hackathonEvent(HackathonEvent hackathonEvent) { this.hackathonEvent = hackathonEvent; return this; }
        public RoundBuilder advancementSlots(Integer advancementSlots) { this.advancementSlots = advancementSlots; return this; }
        public RoundBuilder submissionDeadline(LocalDateTime submissionDeadline) { this.submissionDeadline = submissionDeadline; return this; }
        public RoundBuilder roundOrder(Integer roundOrder) { this.roundOrder = roundOrder; return this; }
        public RoundBuilder gradingEndTime(LocalDateTime gradingEndTime) { this.gradingEndTime = gradingEndTime; return this; }
        public RoundBuilder gradingEnded(Boolean gradingEnded) { this.gradingEnded = gradingEnded; return this; }
        public Round build() {
            Round r = new Round();
            r.id = this.id; r.name = this.name; r.description = this.description;
            r.startTime = this.startTime; r.endTime = this.endTime; r.hackathonEvent = this.hackathonEvent;
            r.advancementSlots = this.advancementSlots; r.submissionDeadline = this.submissionDeadline;
            r.roundOrder = this.roundOrder != null ? this.roundOrder : 1;
            r.gradingEndTime = this.gradingEndTime;
            r.gradingEnded = this.gradingEnded != null ? this.gradingEnded : false;
            return r;
        }
    }
}
