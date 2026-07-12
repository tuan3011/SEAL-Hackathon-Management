# Security Test Report

## 1. Authentication
* Token bị xóa (Logout) hoặc hết hạn: Các API Mentorship và Submission trả về 401. Frontend tự động điều hướng (Redirect) về `/login`.

## 2. Role-Based Authorization (RBAC)
* **Student truy cập trang Mentor (`/mentor/requests`):** Backend trả 403 Forbidden.
* **Mentor truy cập Submit Project:** Backend trả 403.
* Đã cấu hình Guard (RequireAuth) trên hệ thống Router của React để block ngay từ phía Client.

## 3. IDOR (Insecure Direct Object Reference)
* **Student gọi DELETE /mentorship-requests/999 (ID của team khác):** Backend chặn bằng logic kiểm tra quyền sở hữu (`if(teamId != request.teamId) throw Exception`). Trả về 403.
* **Mentor gọi PATCH /release cho request mình không giữ:** Backend trả 400 hoặc 403.

## 4. Input Injection
* URL truyền vào Form Submission sẽ bị chặn nếu cố tình nhồi mã XSS do Backend có Pattern Valid URL.
* Không có lỗi XSS qua trường Description do Frontend React tự encode hiển thị text (TextNode).
