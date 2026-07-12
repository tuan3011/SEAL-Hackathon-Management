# API TEST CASES

## 1. POST /api/v1/submissions (Create Submission)
**Purpose:** Kiểm tra tạo bài nộp và hệ thống Validation DTO mới.
**Authorization:** JWT Token (Role: PARTICIPANT, isLeader: true)

| Test Case | Request Body / Payload | Expected Status | Expected Response | DB Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Valid Case** | Đầy đủ field, URL github đúng chuẩn | 201 Created | Trả về SubmissionResponse | Tạo bản ghi mới, Version = 1 |
| **Invalid Case 1** | `repositoryUrl`: `null` hoặc bỏ trống field | 400 Bad Request | `"message": "Repository URL is required"` | Không có record mới |
| **Invalid Case 2** | `repositoryUrl`: `""` | 400 Bad Request | `"message": "Repository URL is required"` | Không có record mới |
| **Security Case 1** | `reportUrl`: `"javascript:alert(1)"` | 400 Bad Request | `"message": "Invalid report URL format"` | Không bị lưu XSS vào DB |
| **Boundary Case** | `reportUrl`: `null` | 201 Created | Thành công (Optional field) | Cột `report_url` = NULL |

---

## 2. PATCH /api/v1/mentorship-requests/{id}/accept (Accept Mentorship)
**Purpose:** Kiểm tra lỗ hổng cướp việc (Track Authorization Bypass).
**Authorization:** JWT Token (Role: MENTOR)

| Test Case | Pre-condition | Expected Status | Expected Response | DB Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Valid Case** | Mentor được assign vào Track A, Request thuộc Track A | 200 OK | Status đổi thành `IN_PROGRESS` | `mentor_id` = ID của Mentor |
| **Security Case (IDOR/Bypass)** | Mentor được assign Track A, cố tình truyền `id` của Request thuộc Track B | 403 Forbidden | `"message": "You are not assigned to the track of this team."` | `mentor_id` vẫn rỗng (NULL), Status `OPEN` |
| **Permission Case** | User là GUEST_JUDGE | 403 Forbidden | `"message": "Guest judges cannot accept..."` | DB không đổi |
| **Race Condition** | Request đang là IN_PROGRESS (Do Mentor khác nhận trước) | 409 Conflict | `"message": "This request was already modified..."` | DB giữ nguyên Mentor cũ |

---

## 3. POST /api/v1/mentorship-requests (Create Mentorship Request)
**Purpose:** Kiểm tra giới hạn độ dài ký tự tránh sập Database.
**Authorization:** JWT Token (Role: PARTICIPANT, isLeader: true)

| Test Case | Payload | Expected Status | Expected Response | DB Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Boundary Max** | `title`: 255 ký tự chữ `a`, `description`: 2000 ký tự chữ `b` | 201 Created | Thành công | DB lưu đủ chữ |
| **Boundary Overflow 1** | `title`: 256 ký tự chữ `a` | 400 Bad Request | `"message": "Title cannot exceed 255 characters"` | Không lưu rác vào DB |
| **Boundary Overflow 2** | `description`: 2001 ký tự chữ `b` | 400 Bad Request | `"message": "Description cannot exceed 2000 characters"`| Không lưu rác vào DB |
