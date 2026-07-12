# Final Business Verification Report

## 1. Executive Summary
Đây là tài liệu Thẩm định Nghiệp vụ (Business Verification) độc lập, không phụ thuộc vào bất kỳ kết luận cũ nào. Toàn bộ nhận định trong báo cáo này được xây dựng dựa trên bằng chứng trực tiếp từ mã nguồn thực tế đang chạy của backend Java Spring Boot. Quá trình thẩm định đã rà soát 4 khía cạnh trọng yếu: Phân quyền Track Mentor, Ràng buộc dữ liệu nộp bài (Submission), Ràng buộc yêu cầu hỗ trợ (Mentorship), và Loại bỏ các kết luận sai lầm trước đây (False Positives).

Kết quả cốt lõi:
- **Xác nhận 2 lỗi bảo mật/logic nghiệp vụ (Confirmed Bug):** Bỏ lọt Authorization ở chức năng Accept Mentor và lọt validation XSS ở Submission.
- **Xác nhận 1 cải tiến kỹ thuật (Business Enhancement):** Bổ sung giới hạn độ dài ký tự tránh sập DB.
- **Bác bỏ 1 lỗi giả (False Positive):** Chức năng khóa nộp bài vẫn đang hoạt động đúng thiết kế.

---

## 2. VERIFY 1 — TRACK AUTHORIZATION (Quyền nhận Mentor theo Track)

### 2.1. Business Requirement
- **Quy định:** "Mentor chỉ được phép nhận (Accept) các Request thuộc chuyên môn (Track) mà họ đã được gán."
- **Bằng chứng Source Code (Business Rule, không phải tiện ích UI):** Tại `MentorshipRequestServiceImpl.java` (Line 270), API `getOpenRequests()` lọc cực kỳ khắt khe: `assignedTrackIds.contains(r.getTeam().getTrack().getId())`. Dòng code này khẳng định thiết kế lõi của hệ thống không cho phép Mentor nhìn thấy task ngoài chuyên môn.

### 2.2. Kiểm tra API `acceptRequest()`
- **Thực trạng:** Tại `MentorshipRequestServiceImpl.java` (Line 78), API `acceptRequest()` kiểm tra Role (`Role.MENTOR` / `Role.JUDGE`), chặn `GUEST_JUDGE`, check trạng thái `OPEN` và `IN_PROGRESS` của sự kiện. **Hoàn toàn KHÔNG CÓ** lệnh truy vấn `TrackMentorRepository` hay kiểm tra đối chiếu `Track` của Mentor với `Track` của Team.
- **Các tầng bảo vệ khác:** Spring Security `@PreAuthorize("hasRole('MENTOR')")` (Controller) chỉ bắt Role. Không có Custom AOP hay Filter nào can thiệp luồng này.
- **Có thể tái hiện bằng Postman?** **CÓ.** Một Mentor ở Track A có thể lấy được ID của Request thuộc Track B và gửi API `PATCH /api/v1/mentorship-requests/{id}/accept`. Backend sẽ cho qua và ghi tên Mentor đó vào Database.

### 2.3. Ảnh hưởng nếu sửa / không sửa
- **Nếu sửa:** Mentor Pool sẽ hoạt động chính xác theo chuyên môn. Không ảnh hưởng (Regression = 0) đến Notification, Release, Resolve, vì các chức năng này chỉ phụ thuộc vào `mentor_id` đã được chốt.
- **Nếu KHÔNG sửa (Business Impact):** Mức độ **HIGH**. Kẻ gian/Mentor tò mò có thể cướp slot tư vấn của Track khác, làm sai lệch chất lượng chuyên môn của sự kiện.

### 2.4. Kết luận
✅ **CONFIRMED BUG (Missing Function Level Access Control / Business Logic Bypass).**

---

## 3. VERIFY 2 — SUBMISSION VALIDATION (Dữ liệu nộp bài)

### 3.1. `repositoryUrl`
- **Bắt buộc hay không?** Theo Business, thí sinh thi Hackathon / đồ án phải nộp mã nguồn.
- **Bằng chứng Source Code:** `CreateSubmissionRequest.java` (Line 15) có gắn `@Pattern(regexp = "^(https?://)?...")`. Theo tiêu chuẩn Java Validation (JSR-380), việc gắn `@Pattern` thể hiện yêu cầu định dạng chặt chẽ. Tuy nhiên, nó bị thiếu `@NotBlank`. Nếu Frontend (hoặc Hacker) không gửi trường này trong JSON, Spring Validator bỏ qua `@Pattern`, dữ liệu `null` sẽ được nạp vào DB.
- **Kết luận:** ✅ **CONFIRMED BUG (Validation Bypass).**

### 3.2. `reportUrl`
- **Bắt buộc hay Optional?** Đây là trường Optional.
- **Bằng chứng Source Code:** `CreateSubmissionRequest.java` (Line 21) khai báo `private String reportUrl;`.
- **Lỗ hổng:** Vì không có `@Pattern`, hacker có thể gửi `reportUrl = "javascript:alert(document.cookie)"`. Khi Giám khảo chấm thi click vào link này trên UI, họ sẽ bị dính mã độc đánh cắp tài khoản (Stored XSS). Code hiện tại không có bất kỳ rào cản nào chặn việc này.
- **Nên xử lý thế nào?** Tái sử dụng chính xác chuỗi Regex của `demoUrl` để gắn cho `reportUrl`.
- **Kết luận:** ✅ **CONFIRMED BUG (Security Vulnerability - Stored XSS).**

---

## 4. VERIFY 3 — MENTORSHIP VALIDATION (Giới hạn dữ liệu)

### 4.1. Bằng chứng Source Code
- `CreateMentorshipRequest.java` có `@NotBlank` cho `title`, nhưng KHÔNG có `@Size`.
- Database (`MentorshipRequest.java` Line 35) định nghĩa `description` là `TEXT` (Lưu trữ lớn). Nhưng `title` là biến String mặc định, sẽ được Hibernate map thành `VARCHAR(255)`.

### 4.2. Business Impact
- Nếu không thêm `@Size`, hacker gửi Payload `title` chứa 10,000 ký tự. API sẽ Pass validation ban đầu, chui xuống Hibernate. MySQL sẽ chặn lại và quăng lỗi `Data truncation: Data too long`. Spring Boot không biết cách xử lý lỗi SQL này nên trả về lỗi **HTTP 500 Internal Server Error**. 
- Thêm `@Size(max=255)` sẽ bắt lỗi này ngay tại cửa ngõ Controller và trả về HTTP 400 Bad Request một cách mượt mà. Đảm bảo chuẩn Clean Code.
- **Kết luận:** ⚠ **BUSINESS ENHANCEMENT.**

---

## 5. VERIFY 4 — FALSE POSITIVE CHECK (Bác bỏ báo cáo sai)

### 5.1. Báo cáo bị bác bỏ: Lỗi Submission Deadline (Bug báo cáo ở đợt cũ)
- **Luận điểm sai cũ:** "Submission Service lấy nhầm biến `round.getEndTime()` làm hạn chót nộp bài, bỏ quên biến `round.getSubmissionDeadline()` trong Database."
- **Sự thật từ Source Code mới thẩm định:**
  1. `CreateRoundRequest.java` KHÔNG HỀ định nghĩa biến `submissionDeadline`. Người tổ chức tạo Round chỉ có thể nhập `startTime`, `endTime`, và `gradingEndTime`.
  2. `Round.java` có cột `submissionDeadline` nhưng nó là một **Dead Column** (Cột rác / tàn dư của thiết kế cũ).
  3. `SubmissionServiceImpl.java` cố ý dùng `round.getEndTime()` để chặn nộp bài. Dòng chữ cứng (Hard-coded text) ghi rõ: *"The submission period for this round has ended."*
- **Kết luận:** ❌ **FALSE POSITIVE.** Không có bug nào ở đây cả. Không được đổi sang `submissionDeadline` vì DB đang lưu null, đổi sẽ làm vỡ toàn bộ luồng nộp bài.

---

## 6. PRIORITY MATRIX

| Issue | Business Requirement | Evidence | Bug / Feature | Severity | Regression Risk | Implementation Complexity | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API Accept Request thiếu check Track** | Mentor chỉ nhận Request đúng Track | `MentorshipRequestServiceImpl:78` thiếu lệnh query Track | Bug | High | Rất thấp (Logic cách ly) | Thấp (Sửa Service) | Fix ngay trong Release này |
| **Bypass `repositoryUrl` (null)** | Thí sinh bắt buộc có link code | `CreateSubmissionRequest:15` thiếu `@NotBlank` | Bug | High | Cực thấp (Đúng chuẩn Validation) | Rất thấp (DTO) | Fix ngay trong Release này |
| **Stored XSS ở `reportUrl`** | URL nếu có phải an toàn | `CreateSubmissionRequest:21` trống trơn | Bug | High | Cực thấp | Rất thấp (DTO) | Fix ngay trong Release này |
| **Mentorship Title quá tải DB** | Giới hạn ký tự để tránh 500 | `CreateMentorshipRequest:12` thiếu `@Size` | Enhance | Low | Cực thấp | Rất thấp (DTO) | Đưa vào chung đợt Fix |
| **Deadline nộp bài bị nhầm cột** | Code dùng đúng `endTime` | `CreateRoundRequest` không có `submissionDeadline` | False Positive | N/A | Cao (Nếu cố sửa theo báo cáo sai) | N/A | Bỏ qua. Cột dư đưa vào Technical Debt |

---

## 7. FINAL VERDICT & RECOMMENDATION

1. **Track Authorization Bypass:** ✅ CONFIRMED BUG. Đề nghị: Sửa hàm `acceptRequest` trong Backend Service.
2. **Missing Validations (Repository, Report, XSS):** ✅ CONFIRMED BUG. Đề nghị: Bổ sung Annotation vào các file DTO.
3. **Database Overflow Risk (Title length):** ⚠ BUSINESS ENHANCEMENT. Đề nghị: Gắn thêm Annotation vào DTO.
4. **Dead Column (`submissionDeadline`):** ⚪ TECHNICAL DEBT. Đề nghị: Không can thiệp code logic hiện tại, xóa cột trong đợt DB Migration tương lai.
5. **Submission Deadline Logic:** ❌ FALSE POSITIVE. Đề nghị: Hủy bỏ cáo buộc lỗi này.

Tất cả đã được Verify độc lập với bằng chứng thép từ mã nguồn. Xin chỉ thị để tiến hành Implementation Phase.
