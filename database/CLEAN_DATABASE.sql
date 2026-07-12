-- CLEAN DATABASE SCRIPT (SQL Server Version)

-- Bật chế độ TẮT kiểm tra khóa ngoại (Foreign Key)
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"

-- Xóa dữ liệu các bảng phụ tốn đến các bảng chính
-- Phải xóa triệt để các bảng Log, Token và Invitation để tránh lỗi mồ côi (Orphan) khi bật lại Constraint
DELETE FROM refresh_token;
DELETE FROM audit_log;
DELETE FROM team_invitation;
DELETE FROM event_registration;

-- Xóa các bảng Hackathon
DELETE FROM score;
DELETE FROM prize;
DELETE FROM criterion;
DELETE FROM judge_assignment;
DELETE FROM notification;
DELETE FROM submission;
DELETE FROM mentorship_request;
DELETE FROM track_mentor;
DELETE FROM team_member;
DELETE FROM team;
DELETE FROM round;
DELETE FROM track;
DELETE FROM hackathon_event;

-- Xóa user nhưng giữ lại admin hệ thống
DELETE FROM _user WHERE username != 'admin';

-- Bật lại chế độ kiểm tra khóa ngoại
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"

-- Đã xóa thành công toàn bộ dữ liệu nghiệp vụ.
