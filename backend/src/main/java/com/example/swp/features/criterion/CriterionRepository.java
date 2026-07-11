package com.example.swp.features.criterion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CriterionRepository extends JpaRepository<Criterion, Long> {

    // Find custom criteria for a specific event
    List<Criterion> findByHackathonEventId(Long hackathonEventId);

    // Find default criteria (where event is null)
    List<Criterion> findByHackathonEventIsNull();

    // Find all criteria for an event (custom + default)
    @Query("SELECT c FROM Criterion c WHERE c.hackathonEvent.id = :hackathonEventId OR c.hackathonEvent IS NULL")
    List<Criterion> findAllByHackathonEventIdOrDefault(Long hackathonEventId);
}
