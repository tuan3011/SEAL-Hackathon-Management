# Backend Validation & Business Rule Audit

## PHASE 1 — Submission Business Rule Audit

### 1. Khi nào được phép Submit?
- **Event chưa mở (REGISTRATION / UPCOMING):** **Bị chặn.** Tại `SubmissionServiceImpl.java:62`, `if (team.getEvent().getStatus() != IN_PROGRESS) throw`.
- **Event đã FINISHED:** **Bị chặn.** Tương tự như trên.
- **Round chưa mở:** **Bị chặn.** Tại `SubmissionServiceImpl:106`, `if (now.isBefore(round.getStartTime())) throw`.
- **Round đã kết thúc (CLOSED):** **Bị chặn.** Tại dòng 109, `if (now.isAfter(round.getEndTime())) throw`. Hoặc nếu Giám khảo chốt sớm: `if (round.getGradingEnded() == true) throw`.
- **Đánh giá:** Logic trạng thái bao phủ khá tốt.

### 2. Deadline Validation (Bug Tiềm Ẩn)
- **Kiểm tra Deadline:** Backend khóa submit sau `round.getEndTime()`. 
- **Lỗ hổng:** Trong Entity `Round.java`, có tồn tại trường `submissionDeadline` (hạn chót nộp bài). Nhưng Service lại lấy `round.getEndTime()` (thời gian kết thúc vòng thi, thường bao gồm cả thời gian chấm thi) để làm mốc chặn nộp bài. 
- **Đánh giá:** Đây là **BUG LÓGIC**. Nếu Event quy định nộp bài trước ngày 5, và chấm thi đến ngày 10 (EndTime), thì thí sinh có thể gian lận nộp bài từ ngày 6 đến ngày 10 vì Backend dùng sai field chặn.

### 3. Team Validation
- **Đăng ký Event:** Có (ràng buộc qua `team.getEvent()`).
- **Quyền Submit (Advancement):** Có. Tại dòng 86, nếu Round > 1, phải check `teamRoundAdvancementRepository`.
- **Bị loại (Disqualified):** Có kiểm tra chặn.
- **Là Leader:** Có kiểm tra bắt buộc `teamMember.isLeader()`.

### 4. Duplicate Submission (Nộp nhiều lần)
- **Quy tắc:** Cho phép nộp lại nhiều lần đè lên bài cũ trước deadline.
- **Source Code:** Tại `SubmissionServiceImpl:113`, hệ thống dùng `findByTeamIdAndRoundId`. Nếu đã có, hệ thống không báo lỗi Duplicate mà sẽ tăng `version = version + 1`, ghi đè các URL và `submittedAt`. Đây là thiết kế "Update" hợp lý.

### 5. Submission State Machine
`Chưa Nộp (Không có Record)` -> `Đã nộp (Version 1)` -> `Đã cập nhật (Version N)`. Không có trạng thái Draft hay Rejected ở mức Submission.

---

## PHASE 2 — Mentorship Business Rule Audit

### 1. OPEN -> ACCEPT
- **Ai được Accept:** Role `MENTOR` và `JUDGE`. Chặn `GUEST_JUDGE`.
- **Lỗ hổng IDOR / Business Bypass:** Tại API `GET /open`, Mentor chỉ nhìn thấy Request thuộc **Track** mà họ được phân công. TUY NHIÊN, tại API `PATCH /accept` (`MentorshipRequestServiceImpl:78`), Backend **HOÀN TOÀN KHÔNG** kiểm tra xem Mentor này có thuộc đúng Track của Team đó hay không! 
- **Hậu quả:** Một Mentor ở Track Software Engineering có thể dùng Postman ép Accept một Request của Track AI, phá vỡ nguyên tắc chuyên môn.

### 2. IN_PROGRESS -> RESOLVE / RELEASE
- **Quyền thao tác:** Chỉ định cứng Mentor đang phụ trách (`request.getMentor().getId().equals(currentUser.getId())`).
- **Release:** Hủy Mentor, set Status về lại `OPEN`, thông báo cho Leader. (Thiết kế đúng).

---

## PHASE 3 — Validation Audit

Dựa trên DTO hiện tại:

| Field | Current Validation | Business Requirement | Đủ chưa | Thiếu gì | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `repositoryUrl` | `@Pattern` | Bắt buộc nộp mã nguồn | **CHƯA** | Thiếu `@NotBlank`. Có thể bypass bằng `null`. | CRITICAL |
| `reportUrl` | None | Nếu nộp, phải đúng chuẩn URL | **CHƯA** | Thiếu `@Pattern`. | HIGH |
| `title` | `@NotBlank` | Tối đa 255 ký tự (VARCHAR) | **CHƯA** | Thiếu `@Size(max=255)`. | LOW |
| `description` | None | Tối đa 2000 ký tự (TEXT) | **CHƯA** | Thiếu `@Size(max=2000)`. | LOW |

---

## PHASE 4 — Security Audit

- **Stored XSS:** Lỗ hổng rõ ràng tại `reportUrl` do không có `@Pattern` Regex. Kẻ tấn công có thể chèn `javascript:alert(1)`.
- **Business Logic Bypass:** Lỗ hổng API Accept Mentorship Request (Mentor nhận việc chéo Track do thiếu Validate Track).
- **Deadline Bypass:** Thí sinh nộp bài sau Deadline do Backend dùng nhầm biến `endTime` thay vì `submissionDeadline`.
- **Race Condition:** Không có. Entity `MentorshipRequest` đã có `@Version` và GlobalExceptionHandler đã xử lý 409 Conflict.

---

## PHASE 5 — Final Recommendation

| Hạng mục | Hiện trạng | Độ rủi ro | Có cần sửa | Priority |
| :--- | :--- | :--- | :--- | :--- |
| DTO Validation | Bypass được `repositoryUrl` (null), `reportUrl` (XSS) | Rất cao | Có | CRITICAL |
| Mentorship Track Bypass | API Accept không check Track của Mentor | Cao | Có | HIGH |
| Submission Deadline Bug | Check nhầm `endTime` thay vì `submissionDeadline` | Trung bình | Có | MEDIUM |
| Mentorship Title Size | Không giới hạn ký tự | Thấp | Có | LOW |

---

# IMPLEMENTATION PLAN

Kế hoạch triển khai đợt vá lỗi (Patch) Backend toàn diện. Bạn vui lòng duyệt Kế hoạch này.

### Phase 1: Backend Validation Patch (Security & Data Integrity)
- **File cần sửa:** 
  - `CreateSubmissionRequest.java`: Thêm `@NotBlank` cho `repositoryUrl`, thêm `@Pattern` cho `reportUrl`.
  - `CreateMentorshipRequest.java`: Thêm `@Size` cho `title` và `description`.
- **Mục tiêu:** Chặn đứng Stored XSS, chặn nộp bài không mã nguồn, ngăn lỗi Database do chuỗi quá dài.
- **Test:** API Test (Truyền giá trị rỗng, XSS payload).

### Phase 2: Business Rule Patch (Deadline & Track Routing)
- **File cần sửa:**
  - `SubmissionServiceImpl.java`: Sửa logic chặn giờ nộp bài thành `now.isAfter(round.getSubmissionDeadline())` thay vì `round.getEndTime()`. (Lưu ý phải check `submissionDeadline != null`).
  - `MentorshipRequestServiceImpl.java`: Bổ sung đoạn check Track trong hàm `acceptRequest`. Nếu Mentor không được gán vào Track của Team thì quăng `AccessDeniedException`.
- **Mục tiêu:** Bịt lỗ hổng nghiệp vụ nghiêm trọng (Nộp bài trễ, Nhận task sai chuyên môn).
- **Test:** Regression Test toàn bộ luồng tạo và nhận Mentorship. Thử gửi request Accept chéo ID Track.
