package com.example.swp.features.track;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrackMentorRepository extends JpaRepository<TrackMentor, Long> {

    @EntityGraph(attributePaths = {"mentor", "assignedBy"})
    List<TrackMentor> findByTrackId(Long trackId);

    List<TrackMentor> findByMentorId(Long mentorId);

    List<TrackMentor> findByEventId(Long eventId);

    /**
     * Key conflict-check query.
     * Used before assigning a judge to a submission:
     * "Is this user already a mentor for this track?"
     */
    boolean existsByTrackIdAndMentorId(Long trackId, Long mentorId);

    /**
     * Used to remove a specific mentor from a track.
     */
    java.util.Optional<TrackMentor> findByTrackIdAndMentorId(Long trackId, Long mentorId);

    void deleteByTrackId(Long trackId);

    /**
     * Returns all track IDs where the given user is assigned as mentor
     * within the given event. Used to show available judge slots.
     */
    @Query("SELECT tm.track.id FROM TrackMentor tm " +
           "WHERE tm.mentor.id = :userId AND tm.event.id = :eventId")
    List<Long> findMentoredTrackIdsByUserAndEvent(
            @Param("userId") Long userId,
            @Param("eventId") Long eventId);
}
