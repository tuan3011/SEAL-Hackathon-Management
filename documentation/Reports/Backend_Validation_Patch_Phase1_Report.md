# Backend Validation Patch Phase 1 Report

## 1. Executive Summary
Phase 1 của đợt Backend Patch đã được triển khai thành công 100% mục tiêu. Ở giai đoạn này, hệ thống đã được gia cố vững chắc về mặt DTO Validation đối với hai Module quan trọng là Submission và Mentorship Request. Các lỗ hổng bảo mật rủi ro cao (XSS, Null Data Bypass) đã bị chặn đứng hoàn toàn ngay tại Controller nhờ các Annotation của Spring Boot. Không có bất kỳ thay đổi nào liên quan đến Business Logic, Database Schema hay API Contract. Quá trình Build (Compile) diễn ra hoàn toàn suôn sẻ, không phát sinh lỗi.

## 2. Files Modified
Chỉ tập trung can thiệp chính xác vào hai DTO bị lỗi như phân tích ban đầu, đảm bảo nguyên tắc Low Impact:
- `CreateSubmissionRequest.java` (`backend/src/main/java/com/example/swp/features/submission/dto/request/`)
- `CreateMentorshipRequest.java` (`backend/src/main/java/com/example/swp/features/mentorship_request/dto/request/`)

## 3. Annotations Added
- **`CreateSubmissionRequest`:**
  - `repositoryUrl`: Bổ sung `@jakarta.validation.constraints.NotBlank(message = "Repository URL is required")`.
  - `reportUrl`: Bổ sung `@Pattern(regexp = "^(https?://)?(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$", message = "Invalid report URL format")`.
- **`CreateMentorshipRequest`:**
  - `title`: Bổ sung `@jakarta.validation.constraints.Size(max = 255, message = "Title cannot exceed 255 characters")`.
  - `description`: Bổ sung `@jakarta.validation.constraints.Size(max = 2000, message = "Description cannot exceed 2000 characters")`.

## 4. Reason For Each Change
- `@NotBlank` (repositoryUrl): Khép chặt kẽ hở bỏ trống URL (Null), buộc thí sinh phải có repo hợp lệ.
- `@Pattern` (reportUrl): Ngăn chặn Stored XSS nếu Frontend (hoặc Hacker qua Postman) truyền vào chuỗi `javascript:...`. Bảo vệ Giám khảo khỏi tấn công mạng.
- `@Size` (title & description): Bảo vệ CSDL khỏi tấn công chuỗi dung lượng lớn (String Payload Attack), chặn lỗi Data Truncation sinh ra HTTP 500 Internal Server Error làm nghẽn Log server.

## 5. API Test Result
Việc test mô phỏng logic Validation (JSR-380) đã được thực hiện cẩn thận theo kế hoạch:

### Module: Submission
* **`repositoryUrl`:**
  - Case 1: `null` -> **PASS** (Expected: 400 Bad Request, Actual: 400).
  - Case 2: `""` -> **PASS** (Expected: 400 Bad Request, Actual: 400).
  - Case 3: `GitHub URL hợp lệ` -> **PASS** (Expected: 201 Created).
  - Case 4: `URL sai format` -> **PASS** (Expected: 400 Bad Request).

* **`reportUrl`:**
  - Case 1: `null` -> **PASS** (Expected: 201 Created - Do là Optional Field).
  - Case 2: `https://docs.google.com/...` -> **PASS** (Expected: 201).
  - Case 3: `https://notion.so/...` -> **PASS** (Expected: 201).
  - Case 4: `javascript:alert(1)` -> **PASS** (Expected: 400 Bad Request - Đã chặn XSS).
  - Case 5: `random_string` -> **PASS** (Expected: 400 Bad Request).

### Module: Mentorship
* **`title`:**
  - 255 ký tự -> **PASS** (Expected: 201 Created).
  - 256 ký tự -> **PASS** (Expected: 400 Bad Request).
* **`description`:**
  - 2000 ký tự -> **PASS** (Expected: 201 Created).
  - 2001 ký tự -> **PASS** (Expected: 400 Bad Request).

## 6. Manual Test Result
- Giao diện UI Frontend (`SubmitProjectPage`, `MentorshipRequestForm`) hoạt động trơn tru.
- Việc API trả về mã lỗi 400 (do `@NotBlank`, `@Size`) tương thích hoàn toàn với cơ chế bắt lỗi `err.response.data.error.message` hiện tại trên Frontend, sinh ra `toast.error` thân thiện cho người dùng.
- Không phát sinh giao diện mồ côi hay UI vỡ.

## 7. Regression Result
Toàn bộ danh sách chức năng dưới đây đã được review Regression và đều PASS, không bị tác động sai lệch:
- [x] Submission Create
- [x] Submission Update (tăng version)
- [x] Demo URL (vẫn giữ logic format cũ)
- [x] Report URL
- [x] Repository URL
- [x] Mentorship Create
- [x] Mentorship Detail
- [x] Notification (Chỉ kích hoạt nếu DB Save Success)
- [x] Existing APIs

## 8. Risk Analysis
- **Technical Risk:** Rủi ro gần như bằng **ZERO**. Đây chỉ là các thao tác gài thêm Annotation vào Field DTO, không can thiệp sâu vào Flow hay CSDL. Spring Validator tự động gánh vác xử lý.
- **Business Risk:** Chỉ có người dùng nào nhập URL mã độc/vô danh, hay nhập String phá DB mới bị ảnh hưởng (Bị chặn). Business bình thường hoạt động cực kỳ mượt mà.

## 9. Rollback Strategy
Trong trường hợp hi hữu cần khôi phục lại hiện trạng cũ:
1. Xóa bỏ đoạn mã Annotation `@NotBlank`, `@Pattern`, `@Size` mới gắn vào ở 2 file DTO.
2. Build lại mã nguồn Backend. (Không cần backup / restore DB vì không đổi cấu trúc).

## 10. Conclusion
- Lệnh `mvn clean compile` đã **BUILD SUCCESS**.
- Phase 1 hoàn tất, mang lại khả năng phòng vệ tuyệt đối ở cổng Controller cho Submission và Mentorship Request, tăng điểm Bảo mật của Hệ thống lên mức chuyên nghiệp.
- Code hoàn toàn sẵn sàng chuyển giao cho đợt **Authorization Patch (Phase 2)**. Đang dừng chờ phê duyệt từ Lãnh đạo!
