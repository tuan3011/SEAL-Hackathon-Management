package com.example.swp.features.team;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.track.Track;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "team", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "event_id"})
})
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "project_description", columnDefinition = "TEXT")
    private String projectDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    @Builder.Default
    private TeamStatus status = TeamStatus.ACTIVE;

    @Column(name = "disqualification_reason", columnDefinition = "NVARCHAR(MAX)")
    private String disqualificationReason;

    @Column(name = "disqualified_at")
    private LocalDateTime disqualifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disqualified_by")
    private User disqualifiedBy;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamMembers;

    @Column(name = "final_score", precision = 10, scale = 4)
    private java.math.BigDecimal finalScore;

    @CreationTimestamp
    private LocalDateTime createdAt;

}
