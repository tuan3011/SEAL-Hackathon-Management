-- RESET IDENTITY SCRIPT (SQL Server Version)
-- Script này giúp reset ID tự tăng (Auto Increment) về 0 (để bản ghi tiếp theo là 1).
-- Đảm bảo đã chạy CLEAN_DATABASE.sql trước khi chạy script này.

DBCC CHECKIDENT ('score', RESEED, 0);
DBCC CHECKIDENT ('prize', RESEED, 0);
DBCC CHECKIDENT ('criterion', RESEED, 0);
DBCC CHECKIDENT ('judge_assignment', RESEED, 0);
DBCC CHECKIDENT ('notification', RESEED, 0);
DBCC CHECKIDENT ('submission', RESEED, 0);
DBCC CHECKIDENT ('mentorship_request', RESEED, 0);
DBCC CHECKIDENT ('track_mentor', RESEED, 0);
DBCC CHECKIDENT ('team_member', RESEED, 0);
DBCC CHECKIDENT ('team', RESEED, 0);
DBCC CHECKIDENT ('round', RESEED, 0);
DBCC CHECKIDENT ('track', RESEED, 0);
DBCC CHECKIDENT ('hackathon_event', RESEED, 0);

-- Riêng bảng _user do giữ lại Admin, nên reset cho số tiếp theo hợp lý (VD: 9 để bản ghi tiếp là 10)
DBCC CHECKIDENT ('_user', RESEED, 9);
