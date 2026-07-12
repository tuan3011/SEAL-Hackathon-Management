-- TEST DATA SEED SCRIPT (SQL Server Version)
-- Dữ liệu mô phỏng một sự kiện Hackathon thực tế:
-- Chú ý: password đều được hash là 'password123' với BCrypt.
DECLARE @pass VARCHAR(255) = '$2a$10$QpCEbCV9xv.wZTPEBiU.1uvXACIDKLx4o4tfLKj8q7mnDLqrVdA.q';

-- 1. SEED ACCOUNTS
SET IDENTITY_INSERT _user ON;
(205, 'member_team5_1', @pass, 'm5_1@fpt.edu.vn', 'PARTICIPANT', 'Member 1 T5', 'AI20001', 1, 1),
(206, 'member_team5_2', @pass, 'm5_2@fpt.edu.vn', 'PARTICIPANT', 'Member 2 T5', 'AI20002', 1, 1),
(207, 'member_team1_2', @pass, 'm1_2@fpt.edu.vn', 'PARTICIPANT', 'Member 2 T1', 'SE20003', 1, 1);
SET IDENTITY_INSERT _user OFF;

-- 2. SEED HACKATHON EVENT
SET IDENTITY_INSERT hackathon_event ON;
INSERT INTO hackathon_event (id, name, slug, status, start_time, end_time) VALUES 
(1, 'FPT Global Hackathon 2026', 'fpt-global-hackathon-2026', 'IN_PROGRESS', '2026-07-01 00:00:00', '2026-12-31 23:59:59');
SET IDENTITY_INSERT hackathon_event OFF;

-- 3. SEED TRACKS
SET IDENTITY_INSERT track ON;
INSERT INTO track (id, name, hackathon_event_id) VALUES 
(1, 'Software Engineering', 1), (2, 'Artificial Intelligence', 1), (3, 'Internet of Things', 1);
SET IDENTITY_INSERT track OFF;

-- 4. SEED ROUNDS
SET IDENTITY_INSERT round ON;
INSERT INTO round (id, name, hackathon_event_id, start_time, end_time, round_order, grading_ended) VALUES 
(1, 'Round 1: Idea Pitching', 1, '2026-07-05 00:00:00', '2026-07-20 23:59:59', 1, 0),
(2, 'Round 2: Prototype', 1, '2026-08-01 00:00:00', '2026-08-20 23:59:59', 2, 0),
(3, 'Round 3: Final Defense', 1, '2026-09-01 00:00:00', '2026-09-20 23:59:59', 3, 0);
SET IDENTITY_INSERT round OFF;

-- 5. SEED CRITERIA & PRIZES
SET IDENTITY_INSERT criterion ON;
INSERT INTO criterion (id, name, description, max_score, weight, hackathon_event_id) VALUES
(1, 'Innovation', 'How innovative is the idea?', 100, 2, 1),
(2, 'Technical Feasibility', 'Can this be built?', 100, 3, 1),
(3, 'UI/UX Design', 'Is the user experience good?', 100, 1, 1);
SET IDENTITY_INSERT criterion OFF;

SET IDENTITY_INSERT prize ON;
INSERT INTO prize (id, name, description, hackathon_event_id, track_id, rank) VALUES
(1, 'Grand Champion', 'Overall winner of the Hackathon', 1, NULL, 1),
(2, 'Best AI Solution', 'Winner of the AI track', 1, 2, 1),
(3, 'Best IoT Innovation', 'Winner of the IoT track', 1, 3, 1);
SET IDENTITY_INSERT prize OFF;

-- 6. ASSIGN MENTORS TO TRACKS
SET IDENTITY_INSERT track_mentor ON;
INSERT INTO track_mentor (id, track_id, user_id, event_id) VALUES 
(1, 1, 21, 1), (2, 1, 22, 1), (3, 2, 23, 1), (4, 2, 24, 1), (5, 3, 25, 1), (6, 3, 26, 1);
SET IDENTITY_INSERT track_mentor OFF;

-- 7. SEED TEAMS & TEAM MEMBERS
SET IDENTITY_INSERT team ON;
INSERT INTO team (id, name, event_id, track_id, status) VALUES 
(1, 'Team SE Alpha', 1, 1, 'ACTIVE'), (2, 'Team SE Beta', 1, 1, 'ACTIVE'),
(3, 'Team SE Gamma', 1, 1, 'ACTIVE'), (4, 'Team SE Delta', 1, 1, 'DISQUALIFIED'),
(5, 'Team AI Omega', 1, 2, 'ACTIVE'), (6, 'Team AI Zeta', 1, 2, 'ACTIVE'),
(7, 'Team AI Sigma', 1, 2, 'ACTIVE'), (8, 'Team AI Theta', 1, 2, 'ACTIVE'),
(9, 'Team IoT Core', 1, 3, 'ACTIVE'), (10, 'Team IoT Node', 1, 3, 'ACTIVE'),
(11, 'Team IoT Edge', 1, 3, 'ACTIVE'), (12, 'Team IoT Hub', 1, 3, 'ACTIVE');
SET IDENTITY_INSERT team OFF;

INSERT INTO team_member (team_id, user_id, is_leader) VALUES 
(1, 101, 1), (2, 102, 1), (3, 103, 1), (4, 104, 1),
(5, 105, 1), (6, 106, 1), (7, 107, 1), (8, 108, 1),
(9, 109, 1), (10, 110, 1), (11, 111, 1), (12, 112, 1),
(1, 201, 0), (2, 202, 0), (5, 205, 0), (5, 206, 0), (1, 207, 0);

-- 8. SEED MENTORSHIP REQUESTS
SET IDENTITY_INSERT mentorship_request ON;
INSERT INTO mentorship_request (id, team_id, mentor_id, title, description, status, version, created_at) VALUES 
(1, 1, NULL, 'Need help with Spring Boot Security', 'How to implement JWT?', 'OPEN', 1, GETDATE()),
(2, 5, 23, 'PyTorch Model Optimization', 'Model is too slow.', 'IN_PROGRESS', 2, GETDATE()),
(3, 9, 25, 'Raspberry Pi GPIO issue', 'Pins are shorting.', 'RESOLVED', 3, GETDATE()),
(4, 2, 21, 'Spam request', 'asdadasda', 'REJECTED', 2, GETDATE());
SET IDENTITY_INSERT mentorship_request OFF;

-- 9. SEED SUBMISSIONS, JUDGE ASSIGNMENTS & SCORES
SET IDENTITY_INSERT submission ON;
INSERT INTO submission (id, team_id, round_id, repository_url, report_url, version, submitted_at) VALUES 
(1, 1, 1, 'https://github.com/team1', NULL, 1, GETDATE()),
(2, 5, 1, 'https://github.com/team5', 'https://docs.google.com/team5', 2, GETDATE());
SET IDENTITY_INSERT submission OFF;

SET IDENTITY_INSERT judge_assignment ON;
INSERT INTO judge_assignment (id, judge_id, round_id, track_id, assigned_by_organizer_id, status, assigned_at) VALUES
(1, 12, 1, 1, 10, 'ASSIGNED', GETDATE()),
(2, 13, 1, 2, 10, 'ASSIGNED', GETDATE());
SET IDENTITY_INSERT judge_assignment OFF;

SET IDENTITY_INSERT score ON;
INSERT INTO score (id, judge_id, submission_id, criterion_id, score_value, comment, is_finalized, scored_at) VALUES
(1, 12, 1, 1, 85, 'Good idea.', 1, GETDATE()),
(2, 12, 1, 2, 90, 'Very feasible.', 1, GETDATE()),
(3, 13, 2, 1, 95, 'Great AI innovation.', 1, GETDATE());
SET IDENTITY_INSERT score OFF;

-- 10. SEED NOTIFICATIONS
SET IDENTITY_INSERT notification ON;
INSERT INTO notification (id, user_id, title, message, is_read, reference_type, reference_id, created_at) VALUES 
(1, 101, 'Request Accepted', 'Mentor has accepted your request.', 0, 'MentorshipRequest', 2, GETDATE()),
(2, 105, 'Request Resolved', 'Mentor resolved your request.', 1, 'MentorshipRequest', 3, GETDATE());
SET IDENTITY_INSERT notification OFF;

-- END OF SCRIPT
