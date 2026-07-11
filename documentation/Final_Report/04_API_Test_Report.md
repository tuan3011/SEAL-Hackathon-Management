# API Test Report

Dưới đây là tổng hợp kết quả Test của tất cả các API bị tác động trong suốt quá trình nâng cấp:

| API Endpoint | HTTP Method | Mục đích | Test Case | Expected | Actual | Kết quả |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/mentorship-requests/{id}/resolve` | `PATCH` | Leader tự đóng Request | Hợp lệ | Lỗi 403 Access Denied | 403 | **PASS** |
| `/api/v1/mentorship-requests/{id}/resolve` | `PATCH` | Mentor đóng Request sai Status | Status = `OPEN` | Lỗi IllegalStateException | Lỗi IllegalState | **PASS** |
| `/api/v1/mentorship-requests/{id}/resolve` | `PATCH` | Mentor đóng Request chuẩn | Status = `IN_PROGRESS` | HTTP 200 OK | HTTP 200 OK | **PASS** |
| `/api/v1/mentorship-requests/{id}` | `DELETE` | Hủy Request khi đang giải quyết | Status = `IN_PROGRESS` | Lỗi IllegalStateException | Lỗi IllegalState | **PASS** |
| `/api/v1/mentorship-requests/{id}` | `DELETE` | Hủy Request hợp lệ | Status = `OPEN` | DB update thành `CANCELLED` | DB update thành `CANCELLED` | **PASS** |
| `/api/v1/mentorship-requests/open` | `GET` | Lấy Question Pool rác | Thuộc Track khác | Bị ẩn | Bị ẩn | **PASS** |
| `/api/v1/mentorship-requests/{id}/release` | `PATCH` | Nhả Request | Hợp lệ | Mentor thành Null, Status về `OPEN` | Mentor = Null, Status = `OPEN` | **PASS** |
| `/api/v1/submissions` | `POST` | Nộp bài (Sai Link Demo) | `demoUrl` = "test" | 400 Bad Request (Regex Invalid) | 400 Bad Request | **PASS** |
| `/api/v1/mentorship-requests/my-requests` | `GET` | Lấy lịch sử Request Sinh Viên | Sinh viên thuộc 2 Team | List chứa 2 object của 2 Team | Chứa đủ 2 Team | **PASS** |

Tất cả các API đều hoạt động ổn định và xử lý lỗi (Exception Handling) chuẩn chỉnh.
