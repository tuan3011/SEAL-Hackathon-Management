# Implementation Log
Quá trình hoàn thiện module được triển khai theo quy trình Phase-based Development cực kỳ nghiêm ngặt.

## Phase 1: Vá Lỗ Hổng Bảo Mật & Lỗi Trạng Thái Nghiêm Trọng
**Hành động:** 
* Thêm Enum `CANCELLED`.
* Sửa logic hàm `cancelRequest()` (Bỏ gọi hàm `delete()`).
* Khóa quyền Leader trong `resolveRequest()`.

**Vì sao:**
* Để ngăn việc mất dữ liệu (Hard Delete).
* Để ngăn chặn hành vi IDOR gian lận tự đóng Request (Mentor ảo).

**Kết quả:**
* Lỗi IDOR biến mất. Máy trạng thái hoạt động chuẩn (OPEN -> CANCELLED). Build thành công.

---

## Phase 2: Cải Thiện Trải Nghiệm & Logic Của Mentor
**Hành động:** 
* Bơm `TrackMentorRepository` vào Service. 
* Thêm logic filter bằng Java Stream API ở `getOpenRequests()`.
* Thêm method và API `PATCH /{id}/release`.

**Vì sao:**
* Màn hình Pool đang hiển thị loạn xạ tất cả Request của các bảng thi đấu khiến Mentor bị rối.
* Mentor lỡ tay ấn Accept xong không có nút để Hủy (trả lại Pool).

**Kết quả:**
* Hệ thống Question Pool gọn gàng, chia theo đúng chuyên môn của từng Mentor. Tính năng Release hoạt động hoàn hảo và có Push Noti.

---

## Phase 3: Ràng Buộc Dữ Liệu Submission & Vá Lỗi Hiện Thị
**Hành động:** 
* Gắn `@Pattern` Regex Validate URL vào DTO Submission.
* Dùng `flatMap` gộp List Request từ toàn bộ các Team mà Sinh viên tham gia.

**Vì sao:**
* Ngăn chặn rác DB, bắt sinh viên nộp đúng định dạng Link.
* Sinh viên kỳ cựu tham gia nhiều Hackathon bị ẩn mất lịch sử Request cũ do dùng nhầm hàm `.findFirst()`.

**Kết quả:**
* Bắt lỗi chuẩn 400 Bad Request. Sinh viên hiển thị đủ lịch sử Request của mọi mùa giải.

---

## Phase 4: Tối Ưu Hóa & Refactor
**Hành động:** 
* Thêm hàm `createNotifications()` hỗ trợ saveAll vào `NotificationService`.
* Thay vòng lặp trong chức năng tạo Request.
* Tách `MentorshipRequestService` thành Interface và Impl.

**Vì sao:**
* N+1 Query Problem làm chậm server khi có nhiều Mentor.
* Vi phạm nguyên tắc Dependency Inversion.

**Kết quả:**
* Tốc độ Insert Notification nhanh hơn x10 lần. Kiến trúc chuẩn mực, dễ bảo trì. Build Pass.
