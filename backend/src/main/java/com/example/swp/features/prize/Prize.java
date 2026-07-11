package com.example.swp.features.prize;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.team.Team;
import com.example.swp.features.track.Track;
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
@Table(name = "prize")
public class Prize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    // The event this prize belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hackathon_event_id", nullable = false)
    private HackathonEvent hackathonEvent;

    // Optional: for track-specific prizes (e.g., "Winner of AI Track")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    // Optional: The team that won this prize. Can be assigned later.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winning_team_id")
    private Team winningTeam;

    @Column(name = "[rank]")
    private Integer rank;

    @Column(name = "cash", precision = 12, scale = 2)
    private java.math.BigDecimal cash;

    @Column(name = "has_cup")
    private Boolean hasCup;

    @Column(name = "has_certificate")
    private Boolean hasCertificate;

    @Column(name = "cup")
    private String cup;

    @Column(name = "certificate")
    private String certificate;

    @Column(name = "currency", nullable = false)
    private String currency;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public HackathonEvent getHackathonEvent() { return hackathonEvent; }
    public Track getTrack() { return track; }
    public Team getWinningTeam() { return winningTeam; }
    public void setWinningTeam(Team winningTeam) { this.winningTeam = winningTeam; }
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
    public java.math.BigDecimal getCash() { return cash; }
    public void setCash(java.math.BigDecimal cash) { this.cash = cash; }
    public Boolean getHasCup() { return hasCup; }
    public void setHasCup(Boolean hasCup) { this.hasCup = hasCup; }
    public Boolean getHasCertificate() { return hasCertificate; }
    public void setHasCertificate(Boolean hasCertificate) { this.hasCertificate = hasCertificate; }
    public String getCup() { return cup; }
    public void setCup(String cup) { this.cup = cup; }
    public String getCertificate() { return certificate; }
    public void setCertificate(String certificate) { this.certificate = certificate; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public static PrizeBuilder builder() { return new PrizeBuilder(); }
    public static class PrizeBuilder {
        private Long id;
        private String name;
        private String description;
        private HackathonEvent hackathonEvent;
        private Track track;
        private Team winningTeam;
        private Integer rank;
        private java.math.BigDecimal cash;
        private Boolean hasCup;
        private Boolean hasCertificate;
        private String cup;
        private String certificate;
        private String currency;

        public PrizeBuilder id(Long id) { this.id = id; return this; }
        public PrizeBuilder name(String name) { this.name = name; return this; }
        public PrizeBuilder description(String description) { this.description = description; return this; }
        public PrizeBuilder hackathonEvent(HackathonEvent hackathonEvent) { this.hackathonEvent = hackathonEvent; return this; }
        public PrizeBuilder track(Track track) { this.track = track; return this; }
        public PrizeBuilder winningTeam(Team winningTeam) { this.winningTeam = winningTeam; return this; }
        public PrizeBuilder rank(Integer rank) { this.rank = rank; return this; }
        public PrizeBuilder cash(java.math.BigDecimal cash) { this.cash = cash; return this; }
        public PrizeBuilder hasCup(Boolean hasCup) { this.hasCup = hasCup; return this; }
        public PrizeBuilder hasCertificate(Boolean hasCertificate) { this.hasCertificate = hasCertificate; return this; }
        public PrizeBuilder cup(String cup) { this.cup = cup; return this; }
        public PrizeBuilder certificate(String certificate) { this.certificate = certificate; return this; }
        public PrizeBuilder currency(String currency) { this.currency = currency; return this; }

        public Prize build() {
            Prize p = new Prize();
            p.id = this.id; p.name = this.name; p.description = this.description;
            p.hackathonEvent = this.hackathonEvent; p.track = this.track;
            p.winningTeam = this.winningTeam; p.rank = this.rank;
            p.cash = this.cash; p.hasCup = this.hasCup; p.hasCertificate = this.hasCertificate;
            p.cup = this.cup; p.certificate = this.certificate;
            p.currency = this.currency != null ? this.currency : "VND";
            return p;
        }
    }
}