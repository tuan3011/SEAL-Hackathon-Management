package com.example.swp.features.track;

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
@Table(name = "track")
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hackathon_event_id")
    private HackathonEvent hackathonEvent;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public HackathonEvent getHackathonEvent() { return hackathonEvent; }

    public static TrackBuilder builder() { return new TrackBuilder(); }
    public static class TrackBuilder {
        private Long id;
        private String name;
        private String description;
        private HackathonEvent hackathonEvent;

        public TrackBuilder id(Long id) { this.id = id; return this; }
        public TrackBuilder name(String name) { this.name = name; return this; }
        public TrackBuilder description(String description) { this.description = description; return this; }
        public TrackBuilder hackathonEvent(HackathonEvent hackathonEvent) { this.hackathonEvent = hackathonEvent; return this; }

        public Track build() {
            Track t = new Track();
            t.id = this.id; t.name = this.name;
            t.description = this.description; t.hackathonEvent = this.hackathonEvent;
            return t;
        }
    }
}
