package com.example.swp.features.criterion;

import com.example.swp.features.hackathon_event.HackathonEvent;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "criterion")
public class Criterion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_score", nullable = false)
    private int maxScore;

    @Column(name = "weight", nullable = false)
    @Builder.Default
    private int weight = 1;

    // If null, it's a default/template criterion.
    // If set, it's a custom criterion for a specific event.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hackathon_event_id")
    private HackathonEvent hackathonEvent;
    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }
    public Long getId() { return id; }
    public int getMaxScore() { return maxScore; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public HackathonEvent getHackathonEvent() { return hackathonEvent; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }

    public static CriterionBuilder builder() { return new CriterionBuilder(); }
    public static class CriterionBuilder {
        private Long id;
        private String name;
        private String description;
        private int maxScore;
        private int weight;
        private HackathonEvent hackathonEvent;

        public CriterionBuilder id(Long id) { this.id = id; return this; }
        public CriterionBuilder name(String name) { this.name = name; return this; }
        public CriterionBuilder description(String description) { this.description = description; return this; }
        public CriterionBuilder maxScore(int maxScore) { this.maxScore = maxScore; return this; }
        public CriterionBuilder weight(int weight) { this.weight = weight; return this; }
        public CriterionBuilder hackathonEvent(HackathonEvent hackathonEvent) { this.hackathonEvent = hackathonEvent; return this; }
        public Criterion build() {
            Criterion c = new Criterion();
            c.id = this.id; c.name = this.name; c.description = this.description;
            c.maxScore = this.maxScore; c.weight = this.weight; c.hackathonEvent = this.hackathonEvent;
            return c;
        }
    }
}