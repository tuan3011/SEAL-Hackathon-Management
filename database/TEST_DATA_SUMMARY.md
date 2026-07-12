# EXPECTED DATABASE STATE & SUMMARY

Sau khi chạy chuỗi 3 File SQL, Database của bạn sẽ đạt trạng thái toàn diện mô phỏng 1 Hackathon hoàn chỉnh:

| Table Name | Expected Record Count | Ghi Chú |
| :--- | :--- | :--- |
| `_user` | 23 | Bao gồm Admin, 2 Org, 3 Judge, 6 Mentor, 12 Leader, 2 Member. |
| `hackathon_event` | 1 | Sự kiện chính "FPT Global Hackathon 2026". |
| `track` | 3 | SE, AI, IoT. |
| `round` | 3 | Round 1, 2, 3. |
| `team` | 12 | 11 Team Hợp lệ, 1 Team bị DISQUALIFIED. |
| `team_member` | 14 | 12 Leader, 2 Member. |
| `track_mentor` | 6 | Mỗi Track có 2 Mentor phụ trách. |
| `mentorship_request` | 4 | Đủ 4 trạng thái: OPEN, IN_PROGRESS, RESOLVED, REJECTED. |
| `submission` | 2 | Bản nộp của Team SE Alpha và AI Omega. |
| `criterion` | 3 | Tiêu chí chấm điểm: Innovation, Technical Feasibility, UI/UX. |
| `prize` | 3 | Các giải thưởng (Ranking system). |
| `judge_assignment` | 2 | Phân công Giám khảo 1 chấm SE, Giám khảo 2 chấm AI. |
| `score` | 3 | Bảng điểm đã được Giám khảo lưu xuống Submission. |
| `notification` | 2 | Thông báo test. |

## Hướng dẫn Reset Môi trường nhanh
**Thứ tự chạy:**
1. Chạy `CLEAN_DATABASE.sql` (Làm sạch rác từ bảng phụ đến bảng chính).
2. Chạy `RESET_IDENTITY.sql` (Đưa ID về 1).
3. Chạy `TEST_DATA_SEED.sql` (Bơm dữ liệu mồi đầy đủ).
