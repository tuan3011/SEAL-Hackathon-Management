package com.example.swp.features.hackathon_event;

import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.round.Round;
import com.example.swp.features.track.Track;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "hackathon_event")
public class HackathonEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    @Builder.Default
    private HackathonStatus status = HackathonStatus.DRAFT;

    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Builder.Default
    private Integer maxTeamSize = 5;

    @Builder.Default
    private Integer minTeamSize = 2;

    @Lob
    private String rules;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @OneToMany(mappedBy = "hackathonEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Round> rounds;

    @OneToMany(mappedBy = "hackathonEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Track> tracks;

    @OneToMany(mappedBy = "hackathonEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Criterion> criteria;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder.Default
    private boolean isDeleted = false;
}
