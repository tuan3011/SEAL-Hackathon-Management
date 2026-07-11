package com.example.swp.features.hackathon_event;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.hackathon_event.dto.request.CreateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.request.UpdateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventResponse;
import com.example.swp.features.hackathon_event.event.HackathonCompletedEvent;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.ranking.RankingService;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.criterion.CriterionRepository;
import com.example.swp.features.prize.PrizeRepository;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventAnalyticsResponse;
import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class HackathonEventServiceImpl implements HackathonEventService {

    private final HackathonEventRepository hackathonEventRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final RoundRepository roundRepository;
    private final RankingService rankingService;
    private final ApplicationEventPublisher eventPublisher;
    private final CriterionRepository criterionRepository;
    private final com.example.swp.features.team.TeamRepository teamRepository;
    private final com.example.swp.features.team_member.TeamMemberRepository teamMemberRepository;
    private final com.example.swp.features.track.TrackRepository trackRepository;
    private final PrizeRepository prizeRepository;
    private final SubmissionRepository submissionRepository;
    private final Slugify slugify = Slugify.builder().build();

    // ==================== CREATE ====================

    @Override
    @Transactional
    public HackathonEventResponse createHackathonEvent(CreateHackathonEventRequest request) {
        User organizer = getCurrentUser();
        if (request.getOrganizerId() != null) {
            organizer = userRepository.findById(request.getOrganizerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organizer not found with id: " + request.getOrganizerId()));
        }

        // Validate: endTime phải sau startTime
        validateTimeRange(request.getStartTime(), request.getEndTime(), "Event end time must be after start time.");

        // Validate: registration window (nếu có)
        if (request.getRegistrationStart() != null && request.getRegistrationEnd() != null) {
            validateTimeRange(request.getRegistrationStart(), request.getRegistrationEnd(),
                    "Registration start time must be before registration end time.");
        }
        // Validate: registrationEnd must be before startTime
        if (request.getRegistrationEnd() != null && request.getStartTime() != null) {
            validateTimeRange(request.getRegistrationEnd(), request.getStartTime(),
                    "Registration time must be before the event starts.");
        }

        // Validate: minTeamSize <= maxTeamSize (nếu có)
        if (request.getMinTeamSize() != null && request.getMaxTeamSize() != null
                && request.getMinTeamSize() > request.getMaxTeamSize()) {
            throw new IllegalArgumentException("Minimum team size cannot be greater than maximum team size.");
        }

        // Generate unique slug
        String baseSlug = slugify.slugify(request.getName());
        String uniqueSlug = generateUniqueSlug(baseSlug);

        HackathonEvent event = HackathonEvent.builder()
                .name(request.getName())
                .slug(uniqueSlug)
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .registrationStart(request.getRegistrationStart())
                .registrationEnd(request.getRegistrationEnd())
                .minTeamSize(request.getMinTeamSize() != null ? request.getMinTeamSize() : 2)
                .maxTeamSize(request.getMaxTeamSize() != null ? request.getMaxTeamSize() : 5)
                .rules(request.getRules())
                .imageUrl(request.getImageUrl())
                .organizer(organizer)
                .status(HackathonStatus.DRAFT)
                .build();

        HackathonEvent savedEvent = hackathonEventRepository.save(event);

        auditLogService.logAction("CREATE_HACKATHON_EVENT", "HackathonEvent", savedEvent.getId(), null, "Created event: " + savedEvent.getName(), savedEvent.getId());
        log.info("Hackathon event created successfully: id={}, name={} by organizer={}", savedEvent.getId(), savedEvent.getName(), organizer.getUsername());
        return mapToResponse(savedEvent);
    }

    // ==================== READ ====================

    @Override
    @Transactional(readOnly = true)
    public Page<HackathonEventResponse> getAllHackathonEvents(Pageable pageable) {
        return hackathonEventRepository.findByIsDeletedFalseAndStatusIn(
                List.of(HackathonStatus.PUBLISHED, HackathonStatus.IN_PROGRESS, HackathonStatus.COMPLETED), pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HackathonEventResponse> getAllEventsForAdmin(Pageable pageable) {
        return hackathonEventRepository.findByIsDeletedFalse(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HackathonEventResponse> getMyHackathonEvents() {
        User organizer = getCurrentUser();
        return hackathonEventRepository.findByOrganizerIdAndIsDeletedFalseOrderByCreatedAtDesc(organizer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HackathonEventResponse getHackathonEventBySlug(String slug) {
        HackathonEvent event = hackathonEventRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found with slug: " + slug));
        return mapToResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public HackathonEventResponse getHackathonEventById(Long id) {
        HackathonEvent event = findEventById(id);
        return mapToResponse(event);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public HackathonEventResponse updateHackathonEvent(Long id, UpdateHackathonEventRequest request) {
        HackathonEvent event = findEventById(id);
        requireOrganizerOrAdmin(event);

        // Chỉ cho phép edit khi event ở DRAFT hoặc PUBLISHED
        if (event.getStatus() != HackathonStatus.DRAFT && event.getStatus() != HackathonStatus.PUBLISHED) {
            throw new IllegalStateException(
                    "Cannot edit event in status: " + event.getStatus() + ". Only DRAFT and PUBLISHED events can be edited.");
        }

        java.util.Map<String, Object> oldMap = new java.util.HashMap<>();
        oldMap.put("name", event.getName());
        oldMap.put("description", event.getDescription());
        oldMap.put("startTime", event.getStartTime() != null ? event.getStartTime().toString() : null);
        oldMap.put("endTime", event.getEndTime() != null ? event.getEndTime().toString() : null);
        oldMap.put("registrationStart", event.getRegistrationStart() != null ? event.getRegistrationStart().toString() : null);
        oldMap.put("registrationEnd", event.getRegistrationEnd() != null ? event.getRegistrationEnd().toString() : null);
        oldMap.put("minTeamSize", event.getMinTeamSize());
        oldMap.put("maxTeamSize", event.getMaxTeamSize());
        oldMap.put("rules", event.getRules());
        oldMap.put("imageUrl", event.getImageUrl());

        // Partial update — chỉ update field non-null
        if (request.getName() != null) {
            event.setName(request.getName());
            event.setSlug(generateUniqueSlug(slugify.slugify(request.getName())));
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getStartTime() != null) {
            event.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            event.setEndTime(request.getEndTime());
        }
        if (request.getRegistrationStart() != null) {
            event.setRegistrationStart(request.getRegistrationStart());
        }
        if (request.getRegistrationEnd() != null) {
            event.setRegistrationEnd(request.getRegistrationEnd());
        }
        if (request.getMinTeamSize() != null) {
            event.setMinTeamSize(request.getMinTeamSize());
        }
        if (request.getMaxTeamSize() != null) {
            event.setMaxTeamSize(request.getMaxTeamSize());
        }
        if (request.getRules() != null) {
            event.setRules(request.getRules());
        }
        if (request.getImageUrl() != null) {
            event.setImageUrl(request.getImageUrl());
        }
        if (request.getOrganizerId() != null) {
            User newOrganizer = userRepository.findById(request.getOrganizerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organizer not found with id: " + request.getOrganizerId()));
            event.setOrganizer(newOrganizer);
        }

        // Validate sau khi merge: endTime > startTime
        validateTimeRange(event.getStartTime(), event.getEndTime(), "Event end time must be after start time.");

        // Validate: registration window (nếu cả 2 đều có)
        if (event.getRegistrationStart() != null && event.getRegistrationEnd() != null) {
            validateTimeRange(event.getRegistrationStart(), event.getRegistrationEnd(),
                    "Registration start time must be before registration end time.");
        }
        
        // Validate registrationEnd must be before startTime
        if (event.getRegistrationEnd() != null && event.getStartTime() != null) {
            validateTimeRange(event.getRegistrationEnd(), event.getStartTime(),
                    "Registration time must be before the event starts.");
        }

        // Validate: minTeamSize <= maxTeamSize
        if (event.getMinTeamSize() != null && event.getMaxTeamSize() != null
                && event.getMinTeamSize() > event.getMaxTeamSize()) {
            throw new IllegalArgumentException("Minimum team size cannot be greater than maximum team size.");
        }

        java.util.Map<String, Object> newMap = new java.util.HashMap<>();
        newMap.put("name", event.getName());
        newMap.put("description", event.getDescription());
        newMap.put("startTime", event.getStartTime() != null ? event.getStartTime().toString() : null);
        newMap.put("endTime", event.getEndTime() != null ? event.getEndTime().toString() : null);
        newMap.put("registrationStart", event.getRegistrationStart() != null ? event.getRegistrationStart().toString() : null);
        newMap.put("registrationEnd", event.getRegistrationEnd() != null ? event.getRegistrationEnd().toString() : null);
        newMap.put("minTeamSize", event.getMinTeamSize());
        newMap.put("maxTeamSize", event.getMaxTeamSize());
        newMap.put("rules", event.getRules());
        newMap.put("imageUrl", event.getImageUrl());

        String oldValueJson = null;
        String newValueJson = null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            oldValueJson = mapper.writeValueAsString(oldMap);
            newValueJson = mapper.writeValueAsString(newMap);
        } catch (Exception e) {
            // ignore
        }

        HackathonEvent updatedEvent = hackathonEventRepository.save(event);
        auditLogService.logAction("UPDATE_HACKATHON_EVENT", "HackathonEvent",
                updatedEvent.getId(), oldValueJson, newValueJson, updatedEvent.getId());
        log.info("Hackathon event updated: id={}, name='{}'", updatedEvent.getId(), updatedEvent.getName());

        return mapToResponse(updatedEvent);
    }

    // ==================== STATUS TRANSITION ====================

    @Override
    @Transactional
    public HackathonEventResponse updateHackathonEventStatus(Long id, HackathonStatus newStatus) {
        HackathonEvent event = findEventById(id);
        requireOrganizerOrAdmin(event);

        HackathonStatus currentStatus = event.getStatus();

        // Validate state machine transition
        if (!currentStatus.canTransitionTo(newStatus)) {
            String hint = buildTransitionHint(currentStatus, newStatus);
            throw new IllegalStateException(String.format(
                    "Cannot transition status from %s to %s. %s",
                    currentStatus, newStatus, hint));
        }

        // Validate single active event constraint
        if (newStatus == HackathonStatus.PUBLISHED || newStatus == HackathonStatus.IN_PROGRESS) {
            boolean hasActiveEvent = hackathonEventRepository.existsByStatusInAndIsDeletedFalseAndIdNot(
                    List.of(HackathonStatus.PUBLISHED, HackathonStatus.IN_PROGRESS), id);
            if (hasActiveEvent) {
                throw new IllegalStateException(
                        "Cannot activate this event: Another event is currently active (PUBLISHED or IN_PROGRESS). " +
                        "Only one event can take place at any given time.");
            }
        }

        // Validate registration times before publishing
        if (newStatus == HackathonStatus.PUBLISHED) {
            if (event.getRegistrationStart() == null || event.getRegistrationEnd() == null) {
                throw new IllegalStateException("Cannot publish event: Registration Start and End times must be set.");
            }
            if (event.getRegistrationEnd().isBefore(event.getRegistrationStart())) {
                throw new IllegalStateException("Cannot publish event: Registration End time must be after Start time.");
            }

            // Check if tracks exist
            boolean hasTracks = !trackRepository.findByHackathonEventId(event.getId()).isEmpty();
            if (!hasTracks) {
                throw new IllegalStateException("Cannot publish event: Event must have at least one Track.");
            }

            // Check if rounds exist
            boolean hasRounds = !roundRepository.findByHackathonEventId(event.getId()).isEmpty();
            if (!hasRounds) {
                throw new IllegalStateException("Cannot publish event: Event must have at least one Round.");
            }

            // Check if criteria exist and sum of weights is exactly 100%
            List<com.example.swp.features.criterion.Criterion> criteria = criterionRepository.findByHackathonEventId(event.getId());
            if (criteria.isEmpty()) {
                throw new IllegalStateException("Cannot publish event: Event must have at least one scoring criterion.");
            }
            int totalWeight = criteria.stream().mapToInt(com.example.swp.features.criterion.Criterion::getWeight).sum();
            if (totalWeight != 100) {
                throw new IllegalStateException("Cannot publish event: Total criteria weight must be exactly 100% (currently " + totalWeight + "%).");
            }
        }

        if (newStatus == HackathonStatus.IN_PROGRESS) {
            long teamCount = teamRepository.findByEventId(event.getId()).size();
            int requiredTeams = event.getMinTeamSize() != null ? event.getMinTeamSize() : 2;
            if (teamCount < requiredTeams) {
                throw new IllegalStateException("Cannot start event: At least " + requiredTeams + " teams are required to start the hackathon (currently " + teamCount + ").");
            }

            // Check if each track has at least 2 active teams
            List<com.example.swp.features.track.Track> tracks = trackRepository.findByHackathonEventId(event.getId());
            for (com.example.swp.features.track.Track track : tracks) {
                long trackTeamCount = teamRepository.findByTrackId(track.getId()).stream()
                        .filter(t -> t.getStatus() != com.example.swp.features.team.TeamStatus.DISQUALIFIED)
                        .count();
                if (trackTeamCount < 2) {
                    throw new IllegalStateException("Cannot start event: Track '" + track.getName() + "' must have at least 2 active teams (currently " + trackTeamCount + ").");
                }
            }

            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            // Automatically adjust timeline dates to match the manual start
            if (event.getRegistrationEnd() == null || event.getRegistrationEnd().isAfter(now)) {
                event.setRegistrationEnd(now);
            }
            event.setStartTime(now);

            // Adjust first round start time to now so submissions can begin immediately
            List<com.example.swp.features.round.Round> rounds = roundRepository.findByHackathonEventId(event.getId());
            if (rounds != null) {
                for (com.example.swp.features.round.Round round : rounds) {
                    if (round.getRoundOrder() == 1) {
                        if (round.getStartTime() == null || round.getStartTime().isAfter(now)) {
                            round.setStartTime(now);
                            roundRepository.save(round);
                        }
                    }
                }
            }
        }

        event.setStatus(newStatus);
        HackathonEvent updatedEvent = hackathonEventRepository.save(event);

        // NẾU EVENT ĐƯỢC PUBLISHED -> GỬI THÔNG BÁO CHO TẤT CẢ PARTICIPANT
        if (currentStatus == HackathonStatus.DRAFT && newStatus == HackathonStatus.PUBLISHED) {
            List<User> participants = userRepository.findByRole(Role.PARTICIPANT);
            String notiTitle = "🎉 Hackathon Mới: " + updatedEvent.getName();
            String notiMessage = "Hackathon " + updatedEvent.getName() + " đã chính thức mở đăng ký. Nhanh tay đăng ký tham gia ngay!";
            
            for (User participant : participants) {
                notificationService.createNotification(
                        participant,
                        notiTitle,
                        notiMessage,
                        "SYSTEM_ALERT",
                        "HACKATHON_EVENT",
                        updatedEvent.getId()
                );
            }
            log.info("Sent notifications to {} participants for newly published event id={}", participants.size(), updatedEvent.getId());
        }

        // NẾU EVENT CHUYỂN SANG IN_PROGRESS -> QUÉT VÀ LOẠI CÁC TEAM KHÔNG ĐỦ MIN_TEAM_SIZE
        if (currentStatus == HackathonStatus.PUBLISHED && newStatus == HackathonStatus.IN_PROGRESS) {
            List<com.example.swp.features.team.Team> eventTeams = teamRepository.findByEventId(updatedEvent.getId());
            int disqualifiedCount = 0;
            for (com.example.swp.features.team.Team team : eventTeams) {
                if (team.getStatus() != com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
                    long currentSize = teamMemberRepository.countByTeamId(team.getId());
                    if (currentSize < updatedEvent.getMinTeamSize()) {
                        team.setStatus(com.example.swp.features.team.TeamStatus.DISQUALIFIED);
                        team.setDisqualificationReason("Not enough members (" + currentSize + "/" + updatedEvent.getMinTeamSize() + ") when registration closed.");
                        team.setDisqualifiedAt(java.time.LocalDateTime.now());
                        teamRepository.save(team);
                        disqualifiedCount++;
                    }
                }
            }
            log.info("Transition to IN_PROGRESS: Disqualified {} teams for not meeting minTeamSize={}", disqualifiedCount, updatedEvent.getMinTeamSize());
        }

        // NẾU EVENT COMPLETED -> PUBLISH EVENT ĐỂ GỬI NOTIFICATION KẾT QUẢ TOP 1-2-3 (ASYNC)
        if (currentStatus == HackathonStatus.IN_PROGRESS && newStatus == HackathonStatus.COMPLETED) {
            // Tính ranking trong transaction (data consistency)
            List<TeamRankingResponse> top3 = List.of();
            var finalRound = roundRepository.findTopByHackathonEventIdOrderByRoundOrderDesc(event.getId());
            if (finalRound.isPresent()) {
                top3 = rankingService.getRankingForRound(finalRound.get().getId())
                        .stream().limit(3).collect(Collectors.toList());
            } else {
                log.warn("Event id={} completed but has no rounds — skipping ranking notification", event.getId());
            }

            // Publish event → sau khi COMMIT, HackathonEventListener sẽ xử lý async
            eventPublisher.publishEvent(new HackathonCompletedEvent(
                    updatedEvent.getId(), updatedEvent.getName(), top3));
            log.info("Published HackathonCompletedEvent for eventId={} with {} top teams",
                    updatedEvent.getId(), top3.size());
        }

        auditLogService.logAction("UPDATE_HACKATHON_EVENT_STATUS", "HackathonEvent",
                updatedEvent.getId(), "status: " + currentStatus.name(), "status: " + newStatus.name(), updatedEvent.getId());
        log.info("Hackathon event status changed: id={}, {} → {}", id, currentStatus, newStatus);

        return mapToResponse(updatedEvent);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void deleteHackathonEvent(Long id) {
        HackathonEvent event = findEventById(id);
        requireOrganizerOrAdmin(event);

        // Only allow deleting events in DRAFT or CANCELLED status
        if (event.getStatus() == HackathonStatus.PUBLISHED) {
            throw new IllegalStateException(
                    "Cannot delete event in PUBLISHED status. Please cancel the event first.");
        }
        if (event.getStatus() == HackathonStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                    "Cannot delete event in IN_PROGRESS status. Please cancel the event first.");
        }
        if (event.getStatus() == HackathonStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Cannot delete event in COMPLETED status.");
        }

        event.setDeleted(true);
        hackathonEventRepository.save(event);

        auditLogService.logAction("DELETE_HACKATHON_EVENT", "HackathonEvent",
                event.getId(), "isDeleted: false", "isDeleted: true", event.getId());
        log.info("Hackathon event soft-deleted: id={}, name='{}'", event.getId(), event.getName());
    }

    // ==================== PRIVATE HELPERS ====================

    private HackathonEvent findEventById(Long id) {
        return hackathonEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found with id: " + id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Kiểm tra quyền: chỉ organizer của event hoặc ADMIN mới được thao tác.
     */
    private void requireOrganizerOrAdmin(HackathonEvent event) {
        User currentUser = getCurrentUser();
        boolean isOwner = event.getOrganizer().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only the organizer or admin can perform this action.");
        }
    }

    /**
     * Validate start < end.
     */
    private void validateTimeRange(java.time.LocalDateTime start, java.time.LocalDateTime end, String message) {
        if (start != null && end != null && !end.isAfter(start)) {
            throw new IllegalArgumentException(message);
        }
    }

    /**
     * Generate unique slug. Nếu slug đã tồn tại, append -1, -2, -3...
     */
    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (hackathonEventRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    private HackathonEventResponse mapToResponse(HackathonEvent event) {
        return HackathonEventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .slug(event.getSlug())
                .description(event.getDescription())
                .status(event.getStatus().name())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .registrationStart(event.getRegistrationStart())
                .registrationEnd(event.getRegistrationEnd())
                .minTeamSize(event.getMinTeamSize())
                .maxTeamSize(event.getMaxTeamSize())
                .rules(event.getRules())
                .imageUrl(event.getImageUrl())
                .organizerId(event.getOrganizer() != null ? event.getOrganizer().getId() : null)
                .organizerName(event.getOrganizer() != null ? event.getOrganizer().getUsername() : null)
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public HackathonEventResponse cloneEvent(Long id) {
        HackathonEvent original = hackathonEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found with id: " + id));

        // Generate a unique slug
        String baseName = "Copy of " + original.getName();
        String candidateSlug = slugify.slugify(baseName);
        int counter = 1;
        while (hackathonEventRepository.existsBySlug(candidateSlug)) {
            candidateSlug = slugify.slugify(baseName + "-" + counter);
            counter++;
        }

        // Clone event itself
        HackathonEvent cloned = new HackathonEvent();
        cloned.setName(baseName + (counter > 1 ? " (" + (counter - 1) + ")" : ""));
        cloned.setSlug(candidateSlug);
        cloned.setDescription(original.getDescription());
        cloned.setStatus(HackathonStatus.DRAFT);
        cloned.setRegistrationStart(original.getRegistrationStart());
        cloned.setRegistrationEnd(original.getRegistrationEnd());
        cloned.setStartTime(original.getStartTime());
        cloned.setEndTime(original.getEndTime());
        cloned.setMinTeamSize(original.getMinTeamSize());
        cloned.setMaxTeamSize(original.getMaxTeamSize());
        cloned.setRules(original.getRules());
        cloned.setImageUrl(original.getImageUrl());
        cloned.setOrganizer(original.getOrganizer());

        HackathonEvent savedEvent = hackathonEventRepository.save(cloned);

        // Map original tracks to cloned tracks
        java.util.Map<Long, com.example.swp.features.track.Track> trackMap = new java.util.HashMap<>();
        List<com.example.swp.features.track.Track> originalTracks = trackRepository.findByHackathonEventId(original.getId());
        for (com.example.swp.features.track.Track t : originalTracks) {
            com.example.swp.features.track.Track ct = new com.example.swp.features.track.Track();
            ct.setName(t.getName());
            ct.setDescription(t.getDescription());
            ct.setHackathonEvent(savedEvent);
            com.example.swp.features.track.Track savedTrack = trackRepository.save(ct);
            trackMap.put(t.getId(), savedTrack);
        }

        // Clone Rounds
        List<com.example.swp.features.round.Round> originalRounds = roundRepository.findByHackathonEventId(original.getId());
        for (com.example.swp.features.round.Round r : originalRounds) {
            com.example.swp.features.round.Round cr = new com.example.swp.features.round.Round();
            cr.setName(r.getName());
            cr.setDescription(r.getDescription());
            cr.setStartTime(r.getStartTime());
            cr.setEndTime(r.getEndTime());
            cr.setRoundOrder(r.getRoundOrder());
            cr.setAdvancementSlots(r.getAdvancementSlots());
            cr.setHackathonEvent(savedEvent);
            roundRepository.save(cr);
        }

        // Clone Criteria
        List<com.example.swp.features.criterion.Criterion> originalCriteria = criterionRepository.findByHackathonEventId(original.getId());
        for (com.example.swp.features.criterion.Criterion c : originalCriteria) {
            com.example.swp.features.criterion.Criterion cc = new com.example.swp.features.criterion.Criterion();
            cc.setName(c.getName());
            cc.setDescription(c.getDescription());
            cc.setWeight(c.getWeight());
            cc.setMaxScore(c.getMaxScore());
            cc.setHackathonEvent(savedEvent);
            criterionRepository.save(cc);
        }

        // Clone Prizes
        List<com.example.swp.features.prize.Prize> originalPrizes = prizeRepository.findByHackathonEventId(original.getId());
        for (com.example.swp.features.prize.Prize p : originalPrizes) {
            com.example.swp.features.prize.Prize cp = new com.example.swp.features.prize.Prize();
            cp.setName(p.getName());
            cp.setDescription(p.getDescription());
            cp.setRank(p.getRank());
            cp.setHackathonEvent(savedEvent);
            if (p.getTrack() != null && trackMap.containsKey(p.getTrack().getId())) {
                cp.setTrack(trackMap.get(p.getTrack().getId()));
            }
            prizeRepository.save(cp);
        }

        auditLogService.logAction("CLONE_EVENT", "HACKATHON_EVENT", savedEvent.getId(), savedEvent.getName(), "Cloned from event ID: " + original.getId(), savedEvent.getId());

        return mapToResponse(savedEvent);
    }

    private String buildTransitionHint(HackathonStatus from, HackathonStatus to) {
        // Specific, actionable hints for each invalid transition
        if (from == HackathonStatus.DRAFT && to == HackathonStatus.IN_PROGRESS) {
            return "Sự kiện đang ở trạng thái DRAFT chưa thể chuyển thẳng sang IN_PROGRESS. Vui lòng PUBLISH sự kiện trước, sau đó mới chuyển sang IN_PROGRESS.";
        }
        if (from == HackathonStatus.DRAFT && to == HackathonStatus.COMPLETED) {
            return "Sự kiện đang ở DRAFT không thể kết thúc. Cần đi qua: DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED.";
        }
        if (from == HackathonStatus.PUBLISHED && to == HackathonStatus.COMPLETED) {
            return "Sự kiện đang ở PUBLISHED chưa thể kết thúc. Vui lòng chuyển sang IN_PROGRESS trước, rồi mới COMPLETED.";
        }
        if (from == HackathonStatus.IN_PROGRESS && to == HackathonStatus.PUBLISHED) {
            return "Sự kiện đang diễn ra (IN_PROGRESS) không thể quay lại trạng thái PUBLISHED.";
        }
        if (from == HackathonStatus.IN_PROGRESS && to == HackathonStatus.DRAFT) {
            return "Sự kiện đang diễn ra không thể quay lại DRAFT.";
        }
        if (from == HackathonStatus.COMPLETED) {
            return "Sự kiện đã kết thúc (COMPLETED) là trạng thái cuối cùng, không thể thay đổi thêm.";
        }
        if (from == HackathonStatus.CANCELLED) {
            return "Sự kiện đã bị hủy (CANCELLED) là trạng thái cuối cùng, không thể thay đổi thêm.";
        }
        return String.format("Luồng hợp lệ: DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED. Từ %s chỉ có thể chuyển sang: %s.",
                from, from.getAllowedTransitions());
    }

    @Override
    @Transactional(readOnly = true)
    public HackathonEventAnalyticsResponse getEventAnalytics(Long eventId) {
        hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        List<com.example.swp.features.team.Team> teams = teamRepository.findByEventId(eventId);
        long totalTeams = teams.size();
        long totalParticipants = teams.stream()
                .filter(t -> t.getTeamMembers() != null)
                .mapToInt(t -> t.getTeamMembers().size())
                .sum();

        long totalSubmissions = submissionRepository.findByEventId(eventId).size();

        java.util.Map<String, Long> teamsPerTrack = teams.stream()
                .filter(t -> t.getTrack() != null)
                .collect(Collectors.groupingBy(t -> t.getTrack().getName(), Collectors.counting()));

        return HackathonEventAnalyticsResponse.builder()
                .totalTeams(totalTeams)
                .totalParticipants(totalParticipants)
                .totalSubmissions(totalSubmissions)
                .teamsPerTrack(teamsPerTrack)
                .build();
    }
}
