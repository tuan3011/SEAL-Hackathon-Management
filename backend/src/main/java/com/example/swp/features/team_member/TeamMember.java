package com.example.swp.features.team_member;

import com.example.swp.features.team.Team;
import com.example.swp.features.user.User;
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
@Table(name = "team_member")
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "is_leader")
    private boolean isLeader;

    public Team getTeam() { return team; }
    public User getUser() { return user; }
    public boolean isLeader() { return isLeader; }
    public Long getId() { return id; }
    
    public static TeamMemberBuilder builder() { return new TeamMemberBuilder(); }
    public static class TeamMemberBuilder {
        private Long id;
        private Team team;
        private User user;
        private boolean isLeader;

        public TeamMemberBuilder id(Long id) { this.id = id; return this; }
        public TeamMemberBuilder team(Team team) { this.team = team; return this; }
        public TeamMemberBuilder user(User user) { this.user = user; return this; }
        public TeamMemberBuilder isLeader(boolean isLeader) { this.isLeader = isLeader; return this; }
        public TeamMember build() {
            TeamMember tm = new TeamMember();
            tm.id = this.id; tm.team = this.team; tm.user = this.user; tm.isLeader = this.isLeader;
            return tm;
        }
    }
}
