package com.example.swp.features.round;

import com.example.swp.features.team.Team;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "team_round_advancement", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"team_id", "from_round_id", "to_round_id"})
})
public class TeamRoundAdvancement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_round_id", nullable = false)
    private Round fromRound;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_round_id", nullable = false)
    private Round toRound;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advanced_by", nullable = false)
    private User advancedBy;

    @CreationTimestamp
    @Column(name = "advanced_at", updatable = false)
    private LocalDateTime advancedAt;
}
