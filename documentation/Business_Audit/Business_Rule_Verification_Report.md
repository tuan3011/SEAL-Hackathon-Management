# Business Rule Verification Report (Independent Review)

## 1. Executive Summary
Đợt thẩm định độc lập này được thực hiện bằng cách đọc 100% Source Code hiện tại, loại bỏ mọi kết luận từ các báo cáo trước đó. Kết quả cho thấy:
- Lỗ hổng **Submission Deadline** trong báo cáo cũ là một kết luận **SAI LỆCH (FALSE POSITIVE)** do đánh giá nhầm mục đích sử dụng các trường dữ liệu của Developer.
- Lỗ hổng **Mentor Track Validation (API Bypass)** là một **BUG CÓ THẬT (TRUE POSITIVE)** liên quan đến phân quyền bảo mật (Authorization) cấp độ API.

---

## 2. Phần 1: Submission Deadline Verification

### 2.1. Xác minh Source Code
- Trong file `CreateRoundRequest.java`, Frontend chỉ có thể truyền lên 3 mốc thời gian: `startTime`, `endTime`, `gradingEndTime`. Hoàn toàn không tồn tại `submissionDeadline` ở DTO đầu vào.
- Tương ứng, trong API `POST /api/v1/rounds`, `RoundServiceImpl` không hề nhận giá trị `submissionDeadline` từ người dùng tạo sự kiện. Trường `submissionDeadline` trong Entity `Round.java` là một biến "Chết" (Dead code / Legacy column) bị thừa lại từ các thiết kế cũ.
- Trong `SubmissionServiceImpl.java` (Line 109), dòng code `if (now.isAfter(round.getEndTime())) throw` văng ra lỗi thông báo chính xác: *"The submission period for this round has ended."*

### 2.2. Kết luận (Final Verdict)
- **FALSE POSITIVE (BÁO CÁO CŨ SAI)**. Thiết kế hiện tại (dùng `endTime` làm mốc khóa nộp bài) là **Chủ Đích Thiết Kế (Intended Design)** của đội ngũ Backend.
- Nếu đổi sang dùng biến `submissionDeadline` như báo cáo cũ khuyên, chức năng chặn nộp bài sẽ bị **HỎNG TOÀN DIỆN**, vì cột `submissionDeadline` trong DB hiện tại đang rỗng (null).

### 2.3. Risk Assessment & Recommendation
- **Business Impact:** Không ảnh hưởng. Chức năng khóa nộp bài đang hoạt động hoàn hảo dựa trên `endTime`.
- **Recommendation:** **OPTION B - Đưa vào Technical Debt.** (Xóa bỏ thuộc tính `submissionDeadline` trong Entity `Round.java` trong đợt dọn dẹp sau, không cần fix chức năng).

---

## 3. Phần 2: Mentor Track Verification

### 3.1. Xác minh Source Code
- **Quy định Track của Mentor:** Mentor được gán vào các Track thông qua `TrackMentorRepository.java`. 
- **Việc kiểm tra ở UI:** Tại `MentorshipRequestServiceImpl.java` (Line 270 - API `getOpenRequests`), có đoạn filter rõ ràng: `filter(r -> r.getTeam().getTrack() != null && assignedTrackIds.contains(r.getTeam().getTrack().getId()))`. Điều này chứng tỏ Business Requirement là: **Mentor chỉ được nhận Task của Track mình phụ trách**.
- **Lỗ hổng ở API:** Tại phương thức `acceptRequest(Long requestId)` (Line 78), hệ thống chỉ check `mentor.getRole()` và `request.getStatus() == OPEN`. **Tuyệt đối không có bất kỳ dòng code nào** truy vấn `TrackMentorRepository` để kiểm tra quyền của Mentor với Track của Team.

### 3.2. Có thể tái hiện bằng Postman không?
- **CÓ.** Hacker (hoặc Mentor tò mò) có thể bấm F12, copy Endpoint `PATCH /api/v1/mentorship-requests/{id}/accept`, thay thế `{id}` bằng ID của một nhóm khác Track. Request sẽ bay thẳng qua Controller, vào Service, vượt qua cụm `if (role)` và gọi `save()`. Dữ liệu sẽ bị ghi đè.

### 3.3. Kết luận (Final Verdict)
- **BUG (MISSING AUTHORIZATION).** Backend đang dính lỗi API Validation Bypass (Tin tưởng mù quáng vào UI Filter).

### 3.4. Risk Assessment & Recommendation
- **Business Impact:** Nhóm thí sinh bị một Mentor không đúng chuyên môn nhận (Ví dụ Mentor Backend giành task của Frontend), làm hỏng chất lượng tư vấn, chiếm slot của Mentor đúng.
- **Regression Risk (Nếu sửa):** Zero. Nếu team không có Track (null), vốn dĩ API Get Open Requests đã không hiển thị cho Mentor, nên Mentor không có quyền Accept.
- **Recommendation:** **OPTION A - Fix ngay trong release này.**

---

## 4. Tổng hợp Quyết Định (Final Recommendations)

1. Lỗi Submission Deadline: **KHÔNG SỬA (Option B)**. (Phủ nhận báo cáo cũ).
2. Lỗi Mentor Accept Track: **BẮT BUỘC SỬA (Option A)**. 
3. Lỗi Validation DTO (Missing `@NotBlank` `repositoryUrl` và `@Pattern` `reportUrl` - đã confirm từ trước): **BẮT BUỘC SỬA (Option A)**.

Bạn chỉ cần ra lệnh **"APPROVED PHASE 1"**, tôi sẽ tiến hành mở các file Backend và tiêm (inject) các đoạn code Validation an toàn vào hệ thống, đảm bảo đúng chuẩn Clean Architecture và không gây side-effect (Regression).
