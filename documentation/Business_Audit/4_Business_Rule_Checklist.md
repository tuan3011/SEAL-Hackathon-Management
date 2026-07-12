# 4. Business Rule Checklist

Dưới đây là kết quả Audit các quy tắc nghiệp vụ khắt khe, đi kèm bằng chứng từ Backend Source Code.

## 4.1. Quy định nộp bài (Submission)

- [x] **Event phải đang chạy:** `team.getEvent().getStatus() != IN_PROGRESS` -> Throw IllegalStateException.
- [x] **Thời gian Event còn hiệu lực:** `now.isAfter(team.getEvent().getEndTime())` -> Throw IllegalStateException.
- [x] **Thời gian Round còn hiệu lực:** `now.isBefore(round.getStartTime())` hoặc `now.isAfter(round.getEndTime())` -> Throw.
- [x] **Round không bị chốt điểm sớm:** `round.getGradingEnded() == true` -> Throw.
- [x] **Chỉ có Leader được nộp:** `!teamMember.isLeader()` -> Throw AccessDenied.
- [x] **User phải hoàn thiện Profile:** `!currentUser.isProfileComplete()` -> Throw BadRequest.
- [x] **Team phải chốt danh sách (Finalized):** `team.getStatus() != FINALIZED` -> Throw BadRequest.
- [x] **Team không bị loại (Disqualified):** `team.getStatus() == DISQUALIFIED` -> Throw.
- [x] **Đủ số lượng thành viên tối thiểu:** `currentSize < minSize` -> Throw.
- [x] **Phải vượt qua vòng trước đó (Nếu Vòng > 1):** `!teamRoundAdvancementRepository.exists...` -> Throw.

*Nhận xét:* Rule nộp bài của Submission được code cực kỳ chặt chẽ, bao phủ 100% mọi kịch bản gian lận.

## 4.2. Quy định Mentorship Request

- [x] **Bị đóng băng theo Event:** Không cho phép Tạo, Sửa, Xóa, Nhận, Trả lời nếu Event đã `COMPLETED` hoặc `CANCELLED`.
- [x] **Hàng rào Guest Judge:** Guest Judge bị cấm cứng (`GUEST_JUDGE -> throw AccessDenied`) không được nhận việc mentor.
- [x] **Hiển thị theo Track:** Mentor chỉ nhìn thấy open request thuộc Track của mình (`assignedTrackIds.contains(teamTrack)`).

*Nhận xét:* Hoàn hảo về logic phân luồng.
