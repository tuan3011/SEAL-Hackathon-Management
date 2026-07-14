-- SEAL HACKATHON – UNIFIED DATABASE SCRIPT
-- Password mặc định: password123 (BCrypt hash)
-- =============================================

-- =============================================
-- 1. XÓA & TẠO LẠI DATABASE
-- =============================================
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'HackathonDB')
BEGIN
    ALTER DATABASE HackathonDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE HackathonDB;
END
GO

CREATE DATABASE HackathonDB;
GO

USE HackathonDB;
GO

-- =============================================
-- 3. TẠO BẢNG
-- =============================================

-- Bảng _user
CREATE TABLE _user (
                       id             BIGINT IDENTITY(1,1) PRIMARY KEY,
                       username       NVARCHAR(255) NOT NULL UNIQUE,
                       password       NVARCHAR(255) NOT NULL,
                       email          NVARCHAR(255) NOT NULL UNIQUE,
                       role           NVARCHAR(50),           -- ADMIN, ORGANIZER, JUDGE, GUEST_JUDGE, MENTOR, PARTICIPANT

    -- Thông tin sinh viên
                       fpt_student_id NVARCHAR(255),
                       school_name    NVARCHAR(255),

    -- Quản lý xét duyệt & Xác thực
                       approved       BIT DEFAULT 0,          -- Admin duyệt Organizer/Judge/Mentor
                       is_verified    BIT DEFAULT 0,          -- Participant tự xác thực qua OTP
                       otp_code       VARCHAR(10),
                       otp_expiry     DATETIME2,

    -- Profile cá nhân
                       skills         NVARCHAR(MAX),
                       github_url     NVARCHAR(255),
                       full_name      NVARCHAR(255),
                       phone          NVARCHAR(50),
                       bio            NVARCHAR(MAX),
                       avatar_url     NVARCHAR(255),

    -- Guest Judge flag (tài khoản tạm thời do Organizer tạo)
                       is_temporary   BIT DEFAULT 0 NOT NULL
);

-- Bảng hackathon_event
CREATE TABLE hackathon_event (
                                 id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 name               NVARCHAR(255) NOT NULL,
                                 slug               NVARCHAR(255) NOT NULL UNIQUE,
                                 description        NVARCHAR(MAX),
                                 status             NVARCHAR(50) NOT NULL DEFAULT 'DRAFT',
                                 registration_start DATETIME2,
                                 registration_end   DATETIME2,
                                 start_time         DATETIME2 NOT NULL,
                                 end_time           DATETIME2 NOT NULL,
                                 max_team_size      INT DEFAULT 5,
                                 min_team_size      INT DEFAULT 2,
                                 rules              NVARCHAR(MAX),
                                 image_url          NVARCHAR(255),
                                 organizer_id       BIGINT,
                                 created_at         DATETIME2 DEFAULT GETDATE(),
                                 updated_at         DATETIME2 DEFAULT GETDATE(),
                                 is_deleted         BIT DEFAULT 0,
                                 FOREIGN KEY (organizer_id) REFERENCES _user(id)
);

-- Bảng track (Hạng mục thi đấu)
CREATE TABLE track (
                       id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name               NVARCHAR(255) NOT NULL,
                       description        NVARCHAR(MAX),
                       hackathon_event_id BIGINT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng event_registration
CREATE TABLE event_registration (
                                    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
                                    event_id      BIGINT NOT NULL,
                                    user_id       BIGINT NOT NULL,
                                    status        NVARCHAR(50) DEFAULT 'REGISTERED',
                                    registered_at DATETIME2 DEFAULT GETDATE(),
                                    FOREIGN KEY (event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE,
                                    FOREIGN KEY (user_id)  REFERENCES _user(id) ON DELETE CASCADE,
                                    UNIQUE (event_id, user_id)
);

-- Bảng round (Vòng thi)
CREATE TABLE round (
                       id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name                NVARCHAR(255) NOT NULL,
                       description         NVARCHAR(MAX),
                       start_time          DATETIME2 NOT NULL,
                       end_time            DATETIME2 NOT NULL,
                       hackathon_event_id  BIGINT,
    -- Thêm từ patch_phase2: deadline nộp bài, số slot thăng hạng, thứ tự vòng
                       submission_deadline DATETIME2,
                       advancement_slots   INT,
                       round_order         INT DEFAULT 1 NOT NULL,
                       grading_end_time    DATETIME2,
                       grading_ended       BIT NOT NULL DEFAULT 0,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng criterion (Tiêu chí chấm điểm)
CREATE TABLE criterion (
                           id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
                           name               NVARCHAR(255) NOT NULL,
                           description        NVARCHAR(MAX),
                           max_score          INT NOT NULL,
                           weight             INT DEFAULT 1 NOT NULL,
                           hackathon_event_id BIGINT,
                           FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng team
CREATE TABLE team (
                      id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
                      name                    NVARCHAR(255) NOT NULL,
                      project_name            NVARCHAR(255),
                      project_description     NVARCHAR(MAX),
                      track_id                BIGINT,
                      event_id                BIGINT NOT NULL,
                      status                  NVARCHAR(50) DEFAULT 'ACTIVE',
                      created_at              DATETIME2 DEFAULT GETDATE(),
    -- Thêm từ patch_phase2 & patch_phase4: disqualification tracking
                      disqualification_reason NVARCHAR(MAX),
                      disqualified_at         DATETIME2,
                      disqualified_by         BIGINT,
                      final_score             DECIMAL(5,2) DEFAULT NULL,
                      FOREIGN KEY (track_id)        REFERENCES track(id),
                      FOREIGN KEY (event_id)        REFERENCES hackathon_event(id),
                      FOREIGN KEY (disqualified_by) REFERENCES _user(id),
                      UNIQUE (name, event_id)

);

-- Bảng track_mentor (Phân công Mentor/Judge cho Track — thêm từ patch_phase2)
CREATE TABLE track_mentor (
                              id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                              track_id    BIGINT NOT NULL,
                              user_id     BIGINT NOT NULL,   -- MENTOR hoặc JUDGE role
                              event_id    BIGINT NOT NULL,   -- denormalized để lookup nhanh
                              assigned_by BIGINT,            -- organizer_id thực hiện phân công
                              assigned_at DATETIME2 DEFAULT GETDATE() NOT NULL,
                              CONSTRAINT uq_track_mentor UNIQUE (track_id, user_id),
                              CONSTRAINT fk_tm_track    FOREIGN KEY (track_id)    REFERENCES track(id)          ON DELETE CASCADE,
                              CONSTRAINT fk_tm_user     FOREIGN KEY (user_id)     REFERENCES _user(id),
                              CONSTRAINT fk_tm_event    FOREIGN KEY (event_id)    REFERENCES hackathon_event(id),
                              CONSTRAINT fk_tm_assigner FOREIGN KEY (assigned_by) REFERENCES _user(id)
);

-- Bảng team_member
CREATE TABLE team_member (
                             id        BIGINT IDENTITY(1,1) PRIMARY KEY,
                             team_id   BIGINT NOT NULL,
                             user_id   BIGINT NOT NULL,
                             is_leader BIT DEFAULT 0,
                             FOREIGN KEY (team_id) REFERENCES team(id)  ON DELETE CASCADE,
                             FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- Bảng team_invitation (Quản lý lời mời vào nhóm)
CREATE TABLE team_invitation (
                                 id            BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 team_id       BIGINT NOT NULL,
                                 inviter_id    BIGINT NOT NULL,
                                 invitee_email NVARCHAR(255) NOT NULL,
                                 status        NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
                                 created_at    DATETIME2 DEFAULT GETDATE(),
                                 expires_at    DATETIME2,                       -- thêm từ patch.sql
                                 FOREIGN KEY (team_id)    REFERENCES team(id)  ON DELETE CASCADE,
                                 FOREIGN KEY (inviter_id) REFERENCES _user(id)
);

-- Bảng submission (Nộp bài thi)
CREATE TABLE submission (
                            id             BIGINT IDENTITY(1,1) PRIMARY KEY,
                            team_id        BIGINT NOT NULL,
                            round_id       BIGINT NOT NULL,
                            repository_url NVARCHAR(255),
                            demo_url       NVARCHAR(255),
                            report_url     NVARCHAR(255),
                            version        INT DEFAULT 1,
                            submitted_at   DATETIME2 DEFAULT GETDATE(),
                            FOREIGN KEY (team_id)  REFERENCES team(id)  ON DELETE CASCADE,
                            FOREIGN KEY (round_id) REFERENCES round(id)
);

-- Bảng judge_assignment (Phân công giám khảo cho Vòng đấu & Track)
CREATE TABLE judge_assignment (
                                  id                       BIGINT IDENTITY(1,1) PRIMARY KEY,
                                  judge_id                 BIGINT NOT NULL,
                                  round_id                 BIGINT NOT NULL,
                                  track_id                 BIGINT NULL,
                                  assigned_by_organizer_id BIGINT,
                                  status                   NVARCHAR(50) DEFAULT 'ASSIGNED',
                                  assigned_at              DATETIME2 DEFAULT GETDATE(),
                                  FOREIGN KEY (judge_id)                 REFERENCES _user(id),
                                  FOREIGN KEY (round_id)                 REFERENCES round(id) ON DELETE CASCADE,
                                  FOREIGN KEY (track_id)                 REFERENCES track(id),
                                  FOREIGN KEY (assigned_by_organizer_id) REFERENCES _user(id),
                                  UNIQUE (judge_id, round_id, track_id)
);

-- Bảng score (Điểm số)
CREATE TABLE score (
                       id            BIGINT IDENTITY(1,1) PRIMARY KEY,
                       judge_id      BIGINT NOT NULL,
                       submission_id BIGINT NOT NULL,
                       criterion_id  BIGINT NOT NULL,
                       score_value   INT NOT NULL,
                       comment       NVARCHAR(MAX),
                       scored_at     DATETIME2 DEFAULT GETDATE(),
                       is_finalized  BIT DEFAULT 0 NOT NULL,          -- thêm từ patch.sql
                       UNIQUE (judge_id, submission_id, criterion_id),
                       FOREIGN KEY (judge_id)      REFERENCES _user(id),
                       FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE,
                       FOREIGN KEY (criterion_id)  REFERENCES criterion(id)
);

-- Bảng prize (Giải thưởng)
CREATE TABLE prize (
                       id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name               NVARCHAR(255) NOT NULL,
                       description        NVARCHAR(MAX),
                       hackathon_event_id BIGINT NOT NULL,
                       track_id           BIGINT,
                       winning_team_id    BIGINT,
                       rank               INT,
                       cash DECIMAL(12, 2) NULL,
                       has_cup BIT NULL,
                       has_certificate BIT NULL,
                       cup NVARCHAR(255) NULL,
                       certificate NVARCHAR(255) NULL,
                       currency NVARCHAR(50) NOT NULL DEFAULT 'VND',

                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id),
                       FOREIGN KEY (track_id)           REFERENCES track(id),
                       FOREIGN KEY (winning_team_id)    REFERENCES team(id)
);

-- Bảng mentorship_request (Xin hỗ trợ từ Mentor)
CREATE TABLE mentorship_request (
                                    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                                    team_id     BIGINT NOT NULL,
                                    mentor_id   BIGINT,                            -- NULL nếu chưa có mentor nhận
                                    title       NVARCHAR(255) NOT NULL,
                                    description NVARCHAR(MAX),
                                    status      NVARCHAR(50) DEFAULT 'OPEN',       -- OPEN, IN_PROGRESS, RESOLVED
                                    created_at  DATETIME2 DEFAULT GETDATE(),
                                    resolved_at DATETIME2,                         -- thêm từ patch.sql
                                    answer      NVARCHAR(MAX),
                                    reject_reason NVARCHAR(MAX),
                                    version     INT,
                                    FOREIGN KEY (team_id)   REFERENCES team(id)  ON DELETE CASCADE,
                                    FOREIGN KEY (mentor_id) REFERENCES _user(id)
);

-- Bảng notification (Hệ thống thông báo)
CREATE TABLE notification (
                              id             BIGINT IDENTITY(1,1) PRIMARY KEY,
                              user_id        BIGINT NOT NULL,
                              title          NVARCHAR(255) NOT NULL,
                              message        NVARCHAR(MAX),
                              is_read        BIT DEFAULT 0,
                              type           NVARCHAR(255) NOT NULL DEFAULT 'INFO', -- thêm từ patch.sql
                              reference_type NVARCHAR(255),                         -- thêm từ patch.sql
                              reference_id   BIGINT,                                -- thêm từ patch.sql
                              created_at     DATETIME2 DEFAULT GETDATE(),
                              FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- Bảng team_round_advancement (Thăng hạng qua vòng — thêm từ patch_phase3)
CREATE TABLE team_round_advancement (
                                        id            BIGINT IDENTITY(1,1) PRIMARY KEY,
                                        team_id       BIGINT NOT NULL,
                                        from_round_id BIGINT NOT NULL,
                                        to_round_id   BIGINT NOT NULL,
                                        advanced_by   BIGINT NOT NULL,
                                        advanced_at   DATETIME2 DEFAULT GETDATE() NOT NULL,
                                        CONSTRAINT fk_adv_team       FOREIGN KEY (team_id)       REFERENCES team(id)  ON DELETE CASCADE,
                                        CONSTRAINT fk_adv_from_round FOREIGN KEY (from_round_id) REFERENCES round(id),
                                        CONSTRAINT fk_adv_to_round   FOREIGN KEY (to_round_id)   REFERENCES round(id),
                                        CONSTRAINT fk_adv_user       FOREIGN KEY (advanced_by)   REFERENCES _user(id),
                                        CONSTRAINT uq_team_round_adv UNIQUE (team_id, from_round_id, to_round_id)
);

-- Bảng audit_log
CREATE TABLE audit_log (
                           id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                           user_id     BIGINT,
                           action      NVARCHAR(255) NOT NULL,
                           details     NVARCHAR(MAX),
                           created_at  DATETIME2 DEFAULT GETDATE(),
                           entity_type NVARCHAR(255),
                           entity_id   BIGINT,
                           old_value   NVARCHAR(MAX),
                           new_value   NVARCHAR(MAX),
                           event_id    BIGINT,
                           FOREIGN KEY (user_id) REFERENCES _user(id)
);
GO

-- Bảng refresh_token
CREATE TABLE refresh_token (
                               id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                               token       NVARCHAR(255) NOT NULL UNIQUE,
                               user_id     BIGINT NOT NULL,
                               expiry_date DATETIME2 NOT NULL,
                               created_at  DATETIME2 DEFAULT GETDATE(),
                               FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);
GO

-- Bảng password_reset_token
CREATE TABLE password_reset_token (
                                      id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                                      token       NVARCHAR(255) NOT NULL UNIQUE,
                                      user_id     BIGINT NOT NULL,
                                      expiry_date DATETIME2 NOT NULL,
                                      created_at  DATETIME2 DEFAULT GETDATE(),
                                      FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);
GO

-- =============================================
-- 4. INDEXES
-- =============================================
CREATE INDEX idx_submission_team_id           ON submission(team_id);
CREATE INDEX idx_score_submission_id          ON score(submission_id);
CREATE INDEX idx_notification_user_id_is_read ON notification(user_id, is_read);
CREATE INDEX idx_team_event_id                ON team(event_id);
CREATE INDEX idx_track_mentor_user_id         ON track_mentor(user_id);
CREATE INDEX idx_track_mentor_event_id        ON track_mentor(event_id);
CREATE INDEX idx_track_mentor_track_id        ON track_mentor(track_id);
CREATE INDEX idx_adv_from_round               ON team_round_advancement(from_round_id);
CREATE INDEX idx_adv_to_round                 ON team_round_advancement(to_round_id);
GO

-- =============================================
-- 5. SEED DATA
-- Password mặc định: password123 (BCrypt)
-- Mỗi bảng có 2-3 dòng mẫu để test
-- =============================================
-- -----------------------------------------------
-- 5.1 _user (10 users: 1 admin, 2 organizer, 2 judge, 2 mentor, 3 participant)
-- -----------------------------------------------
INSERT INTO _user (username, password, email, role, fpt_student_id, school_name, approved, is_verified, full_name, phone, skills, bio, github_url)
VALUES
    -- id=1: Admin
    ('admin',      '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'admin@fpt.edu.vn',      'ADMIN',       NULL,        'FPT University',  1, 1, N'Nguyễn Văn Admin',   '0901000001', NULL, N'Quản trị hệ thống', NULL),
    -- id=2: Organizer 1
    ('organizer1', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'organizer1@fpt.edu.vn', 'ORGANIZER',   NULL,        'FPT University',  1, 1, N'Trần Thị Organizer', '0901000002', NULL, N'Ban tổ chức sự kiện', NULL),
    -- id=3: Organizer 2
    ('organizer2', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'organizer2@fpt.edu.vn', 'ORGANIZER',   NULL,        'FPT University',  1, 1, N'Lê Văn Organizer',   '0901000003', NULL, N'Điều phối cuộc thi', NULL),
    -- id=4: Judge 1
    ('judge1',     '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'judge1@fpt.edu.vn',     'JUDGE',       NULL,        'FPT University',  1, 1, N'Phạm Minh Judge',    '0901000004', N'AI, Machine Learning', N'Giám khảo chuyên ngành AI', NULL),
    -- id=5: Judge 2
    ('judge2',     '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'judge2@fpt.edu.vn',     'JUDGE',       NULL,        'FPT University',  1, 1, N'Hoàng Thị Judge',    '0901000005', N'Web Development, Cloud', N'Giám khảo chuyên ngành Web', NULL),
    -- id=6: Mentor 1
    ('mentor1',    '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'mentor1@fpt.edu.vn',    'MENTOR',      NULL,        'FPT University',  1, 1, N'Đỗ Văn Mentor',      '0901000006', N'Java, Spring Boot', N'Mentor chuyên backend', 'https://github.com/mentor1'),
    -- id=7: Mentor 2
    ('mentor2',    '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'mentor2@fpt.edu.vn',    'MENTOR',      NULL,        'FPT University',  1, 1, N'Vũ Thị Mentor',      '0901000007', N'React, TypeScript', N'Mentor chuyên frontend', 'https://github.com/mentor2'),
    -- id=8: Participant 1 (team leader)
    ('student1',   '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student1@fpt.edu.vn',   'PARTICIPANT', 'SE170001', 'FPT University',  1, 1, N'Nguyễn Minh Sinh',    '0901000008', N'Java, React, SQL', N'Sinh viên SE năm 3', 'https://github.com/student1'),
    -- id=9: Participant 2
    ('student2',   '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student2@fpt.edu.vn',   'PARTICIPANT', 'SE170002', 'FPT University',  1, 1, N'Trần Hồng Hà',       '0901000009', N'Python, Flask, Docker', N'Sinh viên SE năm 4', 'https://github.com/student2'),
    -- id=10: Participant 3
    ('student3',   '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student3@fpt.edu.vn',   'PARTICIPANT', 'SE170003', 'FPT University',  1, 1, N'Lê Quốc Dũng',       '0901000010', N'C#, .NET, Azure', N'Sinh viên SE năm 3', 'https://github.com/student3'),
    -- id=11: Participant 4
    ('student4',   '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student4@fpt.edu.vn',   'PARTICIPANT', 'SE170004', 'FPT University',  1, 1, N'Nguyễn Thị Thanh',       '0901000011', N'C++, .NET, Azure', N'Sinh viên SE năm 3', 'https://github.com/student4'),
    -- id=12: Participant 5
    ('student5',  '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student5@fpt.edu.vn',  'PARTICIPANT', 'SE170005', 'FPT University', 1, 1, N'Phạm Văn E',  '0901000012', N'Python, AI', N'Sinh viên năm 3', NULL),
    -- id=13: Participant 6
    ('student6',  '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student6@fpt.edu.vn',  'PARTICIPANT', 'SE170006', 'FPT University', 1, 1, N'Lê Thị F',    '0901000013', N'React, NodeJS', N'Sinh viên năm 4', NULL),
    -- id=14: Participant 7
    ('student7',  '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student7@fpt.edu.vn',  'PARTICIPANT', 'SE170007', 'FPT University', 1, 1, N'Hoàng Văn G', '0901000014', N'IoT, C++', N'Sinh viên năm 3', NULL),
    -- id=15: Participant 8
    ('student8',  '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student8@fpt.edu.vn',  'PARTICIPANT', 'SE170008', 'FPT University', 1, 1, N'Đỗ Thị H',    '0901000015', N'Flutter, Dart', N'Sinh viên năm 2', NULL),
    -- id=16: Participant 9
    ('student9',  '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student9@fpt.edu.vn',  'PARTICIPANT', 'SE170009', 'FPT University', 1, 1, N'Ngô Văn I',   '0901000016', N'Java, Spring', N'Sinh viên năm 4', NULL),
    -- id=17: Participant 10
    ('student10', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student10@fpt.edu.vn', 'PARTICIPANT', 'SE170010', 'FPT University', 1, 1, N'Bùi Thị K',   '0901000017', N'AWS, Docker', N'Sinh viên năm 3', NULL);


-- -----------------------------------------------
-- 5.2 hackathon_event (2 events)
-- -----------------------------------------------
INSERT INTO hackathon_event (name, slug, description, status, registration_start, registration_end, start_time, end_time, max_team_size, min_team_size, rules, organizer_id)
VALUES

    -- event id=1: đang diễn ra
    (N'FPT Hackathon 2026',   'fpt-hackathon-2026',   N'Cuộc thi khởi nghiệp công nghệ dành cho sinh viên FPT toàn quốc',
     'IN_PROGRESS',
     DATEADD(day, -15, GETDATE()), DATEADD(day, -1, GETDATE()),
     GETDATE(), DATEADD(day, 30, GETDATE()),
     5, 2, N'Mỗi đội 2-5 thành viên. Nộp bài qua GitHub. Không sử dụng code có sẵn.', 2),
    -- event id=2: nháp
    (N'FPTU Innovation Challenge', 'fptu-innovation-2026', N'Thử thách đổi mới sáng tạo lần 2 – chủ đề GreenTech',
     'DRAFT',
     DATEADD(day, 10, GETDATE()), DATEADD(day, 25, GETDATE()),
     DATEADD(day, 30, GETDATE()), DATEADD(day, 60, GETDATE()),
     4, 2, N'Chủ đề: Công nghệ xanh. Ưu tiên giải pháp thực tiễn.', 3);

-- -----------------------------------------------
-- 5.3 track (3 tracks cho event 1, 2 tracks cho event 2)
-- -----------------------------------------------
INSERT INTO track (name, description, hackathon_event_id) VALUES
                                                              -- event 1
                                                              (N'AI & Machine Learning',    N'Ứng dụng trí tuệ nhân tạo và học máy vào giải quyết vấn đề thực tế',     1),  -- track id=1
                                                              (N'Web & Mobile Development', N'Phát triển ứng dụng web hoặc mobile với UI/UX xuất sắc',                   1),  -- track id=2
                                                              (N'IoT & Embedded Systems',   N'Giải pháp Internet of Things kết hợp phần cứng và phần mềm',              1),  -- track id=3
                                                              -- event 2
                                                              (N'Green Energy Solutions',   N'Công nghệ tiết kiệm năng lượng và năng lượng tái tạo',                    2),  -- track id=4
                                                              (N'Smart Agriculture',        N'Ứng dụng công nghệ vào nông nghiệp thông minh',                           2);  -- track id=5

-- -----------------------------------------------
-- 5.4 event_registration (6 registrations cho event 1)
-- -----------------------------------------------
INSERT INTO event_registration (event_id, user_id, status) VALUES
                                                               (1, 8,  'REGISTERED'),  -- student1
                                                               (1, 9,  'REGISTERED'),  -- student2
                                                               (1, 10, 'REGISTERED'),  -- student3
                                                               (1, 11, 'REGISTERED'),
                                                               (1, 4,  'REGISTERED'),  -- judge1 (đăng ký tham gia với tư cách judge)
                                                               (1, 5,  'REGISTERED'),  -- judge2
                                                               (1, 6,  'REGISTERED');  -- mentor1

-- -----------------------------------------------
-- 5.5 round (3 rounds cho event 1, 2 rounds cho event 2)
-- -----------------------------------------------
INSERT INTO round (name, description, start_time, end_time, hackathon_event_id, submission_deadline, advancement_slots, round_order, grading_end_time, grading_ended) VALUES
                                                                                                                                                                          -- event 1
                                                                                                                                                                          (N'Vòng Ý tưởng',       N'Nộp bản mô tả ý tưởng và kế hoạch thực hiện',
                                                                                                                                                                           GETDATE(), DATEADD(day, 7, GETDATE()),  1, DATEADD(day, 6, GETDATE()), 10, 1, NULL, 0),   -- round id=1
                                                                                                                                                                          (N'Vòng Prototype',     N'Demo sản phẩm prototype và trình bày kỹ thuật',
                                                                                                                                                                           DATEADD(day, 8, GETDATE()), DATEADD(day, 20, GETDATE()), 1, DATEADD(day, 19, GETDATE()), 5, 2, NULL, 0),   -- round id=2
                                                                                                                                                                          (N'Vòng Chung kết',     N'Thuyết trình trước hội đồng giám khảo',
                                                                                                                                                                           DATEADD(day, 21, GETDATE()), DATEADD(day, 30, GETDATE()), 1, DATEADD(day, 29, GETDATE()), NULL, 3, NULL, 0), -- round id=3
                                                                                                                                                                          -- event 2
                                                                                                                                                                          (N'Vòng Sơ loại',       N'Nộp đề xuất giải pháp GreenTech',
                                                                                                                                                                           DATEADD(day, 30, GETDATE()), DATEADD(day, 45, GETDATE()), 2, DATEADD(day, 44, GETDATE()), 8, 1, NULL, 0),   -- round id=4
                                                                                                                                                                          (N'Vòng Chung kết',     N'Trình bày giải pháp hoàn chỉnh',
                                                                                                                                                                           DATEADD(day, 46, GETDATE()), DATEADD(day, 60, GETDATE()), 2, DATEADD(day, 59, GETDATE()), NULL, 2, NULL, 0); -- round id=5

-- -----------------------------------------------
-- 5.6 criterion (3 criteria cho event 1)
-- -----------------------------------------------
INSERT INTO criterion (name, description, max_score, weight, hackathon_event_id) VALUES
                                                                                     (N'Tính sáng tạo',       N'Ý tưởng mới lạ, khác biệt so với giải pháp hiện có',              10, 30, 1),  -- criterion id=1
                                                                                     (N'Tính khả thi',        N'Khả năng triển khai thực tế, mô hình kinh doanh rõ ràng',          10, 30, 1),  -- criterion id=2
                                                                                     (N'Chất lượng kỹ thuật', N'Code sạch, kiến trúc tốt, performance, test coverage',             10, 40, 1);  -- criterion id=3

-- -----------------------------------------------
-- 5.7 team (3 teams cho event 1)
-- -----------------------------------------------
INSERT INTO team (name, project_name, project_description, track_id, event_id, status) VALUES
                                                                                           (N'Team Alpha',   N'SmartStudy AI',     N'Ứng dụng AI hỗ trợ sinh viên lập kế hoạch học tập cá nhân hóa',               1, 1, 'ACTIVE'),        -- team id=1
                                                                                           (N'Team Beta',    N'CampusConnect',     N'Nền tảng web kết nối sinh viên, câu lạc bộ và sự kiện trong trường',           2, 1, 'ACTIVE'),        -- team id=2
                                                                                            (N'Team Gamma',   N'HealthBot',         N'Chatbot AI tư vấn sức khỏe tâm lý cho sinh viên',                                1, 1, 'ACTIVE'),
                                                                                            (N'Team Delta',   N'SmartFarm IoT',     N'Hệ thống tưới tiêu và giám sát cây trồng thông minh qua IoT',                    3, 1, 'ACTIVE'),
                                                                                            (N'Team Epsilon', N'EduPlatform',       N'Nền tảng học trực tuyến tương tác thời gian thực với WebRTC',                    2, 1, 'ACTIVE');

-- -----------------------------------------------
-- 5.8 track_mentor (phân công mentor/judge cho track)
-- -----------------------------------------------
INSERT INTO track_mentor (track_id, user_id, event_id, assigned_by) VALUES
                                                                        (1, 6, 1, 2),   -- mentor1 → track AI, assigned by organizer1
                                                                        (2, 7, 1, 2),   -- mentor2 → track Web, assigned by organizer1
                                                                        (1, 4, 1, 2);   -- judge1  → track AI, assigned by organizer1

-- -----------------------------------------------
-- 5.9 team_member (phân bổ 3 students vào 3 teams)
-- -----------------------------------------------
INSERT INTO team_member (team_id, user_id, is_leader) VALUES
                                                          (1, 8, 1),  -- student1 là leader Team Alpha
                                                          (1, 9, 0),  -- student2 là member Team Alpha
                                                          (2, 10, 1), -- student3 là leader Team Beta
                                                          (2, 11, 0),  -- student4 là member Team Beta
                                                          (3, 12, 1),
                                                          (3, 13, 0),
                                                          (4, 14, 1),
                                                          (4, 15, 0),
                                                          (5, 16, 1),
                                                          (5, 17, 0);


-- -----------------------------------------------
-- 5.11 submission (mỗi team nộp bài cho vòng 1)
-- -----------------------------------------------
INSERT INTO submission (team_id, round_id, repository_url, demo_url, report_url, version) VALUES
                                                                                              (1, 1, 'https://github.com/team-alpha/smartstudy-ai',    'https://smartstudy.demo.fpt.edu.vn',    'https://docs.google.com/team-alpha-report',    1),  -- submission id=1
                                                                                              (2, 1, 'https://github.com/team-beta/campusconnect',     'https://campusconnect.demo.fpt.edu.vn', 'https://docs.google.com/team-beta-report',     1),  -- submission id=2
                                                                                              -- Team Gamma (HealthBot)
                                                                                              (3, 1, 'https://github.com/team-gamma/healthbot',       'https://healthbot.demo.fpt.edu.vn',       'https://docs.google.com/team-gamma-report',       1), -- submission id=3
                                                                                              (4, 1, 'https://github.com/team-delta/smartfarm-iot',   'https://smartfarm.demo.fpt.edu.vn',       'https://docs.google.com/team-delta-report',       1), -- submission id=4
                                                                                              (5, 1, 'https://github.com/team-epsilon/eduplatform',   'https://eduplatform.demo.fpt.edu.vn',     'https://docs.google.com/team-epsilon-report',     1); -- submission id=5



-- -----------------------------------------------
-- 5.16 notification (sample notifications)
-- -----------------------------------------------
INSERT INTO notification (user_id, title, message, is_read, type, reference_type, reference_id) VALUES
                                                                                                    (8,  N'Chào mừng đến FPT Hackathon 2026',           N'Bạn đã đăng ký thành công. Hãy tạo team và bắt đầu!',                 1, 'INFO',    'EVENT',       1),
                                                                                                    (8,  N'Bạn đã được mời vào Team Beta',               N'student3 đã gửi lời mời tham gia Team Beta. Xem và phản hồi ngay.',    0, 'INVITE',  'TEAM',        2),
                                                                                                    (10, N'Submission deadline sắp đến',                  N'Vòng Ý tưởng sẽ đóng trong 2 ngày. Hãy nộp bài sớm!',                 0, 'WARNING', 'ROUND',       1),
                                                                                                    (4,  N'Bạn được phân công chấm bài mới',             N'Organizer đã giao cho bạn chấm bài của Team Alpha và Team Beta.',       0, 'TASK',    'SUBMISSION',  1),
                                                                                                    (6,  N'Yêu cầu mentorship mới từ Team Alpha',        N'Team Alpha cần hỗ trợ thiết kế database. Xem chi tiết.',               1, 'MENTORSHIP', 'TEAM',     1);


-- -----------------------------------------------
-- 5.18 audit_log (sample logs)
-- -----------------------------------------------
INSERT INTO audit_log (user_id, action, details) VALUES
                                                     (1, 'USER_APPROVED',        N'Admin đã duyệt tài khoản organizer1 (id=2)'),
                                                     (2, 'EVENT_CREATED',        N'Organizer1 tạo sự kiện FPT Hackathon 2026 (id=1)'),
                                                     (2, 'JUDGE_ASSIGNED',       N'Organizer1 phân công judge1 (id=4) chấm submission Team Alpha (id=1)'),
                                                     (8, 'TEAM_CREATED',         N'Student1 tạo Team Alpha cho event FPT Hackathon 2026'),
                                                     (4, 'SCORE_SUBMITTED',      N'Judge1 đã chấm điểm submission Team Alpha – Vòng Ý tưởng');

CREATE TABLE support_tickets (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 full_name NVARCHAR(255) NOT NULL,
                                 email VARCHAR(255) NOT NULL,
                                 message NVARCHAR(MAX) NOT NULL,
                                 status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                                 created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);