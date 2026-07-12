# Phase 1: Optional Field Standardization Report

## Mục tiêu
Đảm bảo toàn bộ các trường dữ liệu tùy chọn (Optional Fields) không gửi chuỗi rỗng `""` xuống Backend, nhằm tránh các lỗi 400 Bad Request từ cơ chế kiểm tra Validation (Regex / @Pattern) của Spring Boot.

## Các file đã sửa
1. **`SubmitProjectPage.tsx`**
   - *Trước:* Gửi thẳng `demoUrl`, `reportUrl` (có thể là `""`).
   - *Sau:* Áp dụng pattern `demoUrl: demoUrl.trim() || undefined`. Nếu rỗng, object sẽ chứa key nhưng value là `undefined`, giúp Axios tự động loại bỏ field này khỏi JSON hoặc Jackson Mapper bên Backend sẽ pass qua Annotation `@Pattern`.
2. **`MentorshipRequestForm.tsx`**
   - *Trước:* Gửi `description` nguyên bản.
   - *Sau:* `description: description.trim() || undefined`.
3. **`ProfilePage.tsx`**
   - *Trước:* Gửi toàn bộ object `form` chứa `githubUrl`, `schoolName`, v.v. bằng chuỗi rỗng.
   - *Sau:* Build lại `payload` trước khi gửi, áp dụng `trim() || undefined` cho tất cả các key.

## Self Review
* Các file gọi API tạo mới/cập nhật dữ liệu đã được rà soát không bỏ sót.
* Không có can thiệp nào vào Backend.
* Pattern xử lý thống nhất, code Clean và dễ đọc.

## Lịch sử Test
* **Regression Test:** Build TypeScript thành công (1.30s). Type Checking của TS không báo lỗi vì các DTO (Interface) đã định nghĩa field optional bằng dấu `?` (ví dụ `reportUrl?: string`).

Tiến trình đã hoàn thành, sẵn sàng sang Phase 2.
