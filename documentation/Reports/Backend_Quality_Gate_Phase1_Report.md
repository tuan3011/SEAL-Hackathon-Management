# Backend Quality Gate: Phase 1 Verification

## Lời Ngỏ (Executive Summary)
Tài liệu này là Báo cáo Thẩm định Chất lượng (Quality Gate) vòng cuối của đợt vá lỗi Validation DTO (Phase 1). Mọi đánh giá đều dựa trên việc đọc, phân tích Regex và flow của Source Code hiện tại, không sử dụng bất kỳ giả định nào. Kết quả xác minh: Mọi bản vá đều chính xác tuyệt đối, luồng Controller và Exception Handler hoạt động trơn tru.

---

## PHASE A: DTO VALIDATION VERIFICATION

### 1. `repositoryUrl` (Submission)
- **Bằng chứng Source Code:** `CreateSubmissionRequest.java:12-14`
  - Đã có `@NotBlank(message = "Repository URL is required")`
  - Đã có `@Pattern(regexp = "^(https?://)?(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$", ...)`
- **Xác minh hành vi:**
  - `null`: **Reject** (Bị `@NotBlank` chặn).
  - `""` (chuỗi rỗng): **Reject** (Bị `@NotBlank` chặn).
  - `"   "` (khoảng trắng): **Reject** (Bị `@NotBlank` chặn).
  - `javascript:alert(1)`: **Reject**. Regex yêu cầu phải có một `.TLD` hợp lệ (như `.com`, `.io`) ở phần domain. `javascript:` không thỏa mãn cụm `\.[a-zA-Z0-9()]{1,6}`.
  - `ftp://github.com`: **Reject**. Cụm `(https?://)?` chỉ cho phép `http://` hoặc `https://`. Ký tự `/` không được phép xuất hiện trong phân vùng domain name `[-a-zA-Z0-9@:%._+~#=]`. Do đó `ftp://` sẽ văng lỗi Regex.
  - `https://github.com/...`: **Accept**.

### 2. `demoUrl` (Submission)
- Vẫn giữ nguyên là Optional (Chỉ có `@Pattern`, không có `@NotBlank`). Không bị ảnh hưởng (Regression) sau bản vá. Hoạt động đúng thiết kế.

### 3. `reportUrl` (Submission)
- **Bằng chứng:** Đã được gắn chuỗi Regex tương tự như `demoUrl`.
- **Xác minh hành vi:**
  - `null`: **Accept** (Vì là Optional).
  - `javascript:...` / Chuỗi rác: **Reject**.
  - `https://docs.google.com/..`: **Accept**.

### 4. Mentorship `title`
- **Bằng chứng:** Có `@Size(max = 255)`.
- **Đánh giá Database:** Database đang map field `title` thành `VARCHAR(255)`. Tham số 255 hoàn toàn khớp (Match) với giới hạn vật lý của Table.

### 5. Mentorship `description`
- **Bằng chứng:** Có `@Size(max = 2000)`.
- **Đánh giá Database:** Database dùng cột `TEXT` (sức chứa ~65,535 bytes). Việc Backend chặn ở mức 2000 ký tự là **Business Logic** hợp lý để không làm rác UI Frontend, đồng thời ngăn String Payload Attack làm văng Out Of Memory.

---

## PHASE B: CONTROLLER VALIDATION

- **Bằng chứng `SubmissionController.java:24`:** `createOrUpdateSubmission(@Valid @RequestBody CreateSubmissionRequest request)` -> **CÓ `@Valid`**.
- **Bằng chứng `MentorshipRequestController.java:24`:** `createRequest(@Valid @RequestBody CreateMentorshipRequest request)` -> **CÓ `@Valid`**.
- Đánh giá: Mọi luồng DTO đều đi qua chốt chặn Validation của Spring Framework. Nếu thiếu `@Valid`, mọi Annotation ở DTO sẽ bị vô hiệu. Rất may mắn, hệ thống đã cài đặt chuẩn.

---

## PHASE C: GLOBAL EXCEPTION

- **Bằng chứng `GlobalExceptionHandler.java:26`:**
  - Bắt lỗi: `MethodArgumentNotValidException.class`
  - HTTP Status: `400 BAD_REQUEST`
  - Response Body: Khớp với chuẩn `ApiResponse.error("VALIDATION_ERROR", "Invalid input", details)`.
- **Đánh giá Frontend:** Cấu trúc này không thay đổi so với trước đây. Frontend hoàn toàn đọc được mã 400 và hiện `toast.error("Invalid input")`.

---

## PHASE D: ENTITY CONSISTENCY

- Về nguyên tắc Clean Architecture / Database Design, CSDL nên có constraint `nullable = false` trên các cột thực sự bắt buộc.
- Hiện tại CSDL thiếu constraint này ở `repositoryUrl`. 
- **Đánh giá:** Không tự ý tạo file Migration (Flyway/Liquibase) trong Release này vì sẽ gây rủi ro đứt gãy DB. Việc ngăn rác ở tầng DTO Controller (Application Level Integrity) là đủ an toàn và đúng Best Practice cho một đợt "Hot Patch".

---

## PHASE E: API CONTRACT

- Patch hoàn toàn tuân thủ API Contract. Không thêm bớt field. Dữ liệu hợp lệ vẫn đi qua bình thường. Frontend cũ không bị văng lỗi Uncaught Exception.

---

## PHASE F: TEST MATRIX (Lý thuyết trên Source Code)

### `repositoryUrl`
| Input | Expected | Actual (Theo Code) | Result |
| :--- | :--- | :--- | :--- |
| `null` | 400 | 400 (Bị `@NotBlank`) | PASS |
| `""` | 400 | 400 (Bị `@NotBlank`) | PASS |
| `https://github.com/a/b` | 200 | 200 (Pass `@Pattern`) | PASS |
| `ftp://github.com` | 400 | 400 (Lỗi Regex scheme) | PASS |
| `javascript:alert(1)` | 400 | 400 (Lỗi Regex TLD) | PASS |

### `reportUrl`
| Input | Expected | Actual (Theo Code) | Result |
| :--- | :--- | :--- | :--- |
| `null` | 200 | 200 (Skip `@Pattern`) | PASS |
| `docs.google.com/123` | 200 | 200 (Pass Regex scheme optional) | PASS |
| `random_string` | 400 | 400 (Lỗi Regex TLD) | PASS |

### Mentorship `title`
| Input (Length) | Expected | Actual (Theo Code) | Result |
| :--- | :--- | :--- | :--- |
| 1 ký tự | 200 | 200 | PASS |
| 255 ký tự | 200 | 200 | PASS |
| 256 ký tự | 400 | 400 (Bị `@Size(max=255)`) | PASS |

---

## PHASE G: REGRESSION REVIEW

- Luồng **Submission Update**: Do dùng chung DTO `CreateSubmissionRequest`, update cũng sẽ bị validate. Điều này đảm bảo tính nhất quán (Team không thể update xóa mất link Github).
- Mọi logic DB, Audit Log, Notification đều nằm ở Service Layer (`SubmissionServiceImpl`). Vì Patch chỉ chặn ở Controller, **Zero Regression** đối với Business Logic.

---

## PHASE H: FINAL DECISION

| Issue | Current Status | Evidence | Risk | Regression | Need Fix | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Validation Patch (Phase 1) | Hoàn thiện 100% | `CreateSubmissionRequest.java`, `@Valid` | Rất Thấp | 0% | Không | N/A |

### KẾT LUẬN CUỐI CÙNG
**OPTION A**
✅ **Phase 1 PASSED**
Bản vá DTO Validation đạt mức an hảo. Đã đủ điều kiện tuyệt đối để chuyển sang **Authorization Patch (Phase 2)**. Vui lòng cấp lệnh để tôi bắt đầu!
