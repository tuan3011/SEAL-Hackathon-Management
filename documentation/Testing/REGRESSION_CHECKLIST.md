# REGRESSION CHECKLIST

Đảm bảo đợt vá lỗi Phase 1 & 2 không làm hỏng tính năng đang chạy.

## SUBMISSION MODULE
- [ ] **Create Submission:** Leader tạo thành công bằng UI.
- [ ] **Update Submission:** Leader nộp lại bài khi sát giờ. Version trong DB tăng lên đúng.
- [ ] **Data Integrity:** `demoUrl` và `reportUrl` vẫn lưu đúng Link hợp lệ.
- [ ] **Deadline Logic:** Chặn đúng sau giờ `endTime` của Round.
- [ ] **Advancement Logic:** Các nhóm bị loại (Disqualified) hoặc không qua vòng trước bị chặn nộp bài.
- [ ] **Role Permission:** Student (Không phải Leader) bị chặn.

## MENTORSHIP MODULE
- [ ] **Get Open Requests:** Mentor vẫn nhìn thấy đủ danh sách các Request thuộc Track của mình.
- [ ] **Accept Flow:** Mentor Accept thành công. Toast hiện màu xanh.
- [ ] **Resolve Flow:** Mentor Resolve thành công, ghi đè được câu trả lời.
- [ ] **Release Flow:** Mentor Release thành công, Request quay lại danh sách Open.
- [ ] **Cancel Flow:** Leader hủy thành công Request khi chưa ai nhận.
- [ ] **Reject Flow:** Mentor từ chối (Decline) Request do nội dung spam.
- [ ] **Notification:** Leader nhận được thông báo ngay khi trạng thái Request thay đổi.

## CORE SYSTEM
- [ ] **Login / JWT:** Token vẫn hoạt động, không bị văng lỗi Unauthenticated.
- [ ] **Swagger UI:** Truy cập `/swagger-ui.html` không bị sập. Payload hiển thị đúng.
- [ ] **Exception Format:** Format lỗi vẫn giữ nguyên `{ code, message, details }`, đảm bảo Frontend đọc được.
