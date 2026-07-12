# 6. Security Review

## Authentication & Authorization
- **Guard:** Spring Security `@PreAuthorize` được áp dụng 100% trên Controller. Các Endpoints nhạy cảm như Xóa, Đổi Trạng Thái đều được phân Role chặt chẽ.
- **Ownership Check (Chống IDOR):** Đã được implement tốt. Ví dụ, gọi hàm lấy chi tiết Submission của Team khác sẽ bị bắt lại: `if (!isMember) throw AccessDeniedException("You can only view submissions for your own team.")`. 

## Data Injection
- Các lỗ hổng truyền Payload rác được giảm nhẹ thông qua DTO Mapping. 
- Nguy cơ ở `reportUrl` đã được đề cập trong *Missing Validation Report*.

## Race Condition & State Manipulation
- **Vấn đề:** Quá trình chuyển đổi trạng thái (Ví dụ Mentor Bấm Accept) đọc trạng thái bằng lệnh `findById` rồi sau đó `save()`. Trong môi trường Multi-thread, 2 Mentor bấm cùng lúc sẽ tạo ra Data Inconsistency (cùng chiếm quyền Mentorship).
- **Source Code liên quan:** `MentorshipRequestServiceImpl.java` -> `acceptRequest()`.
- **Rủi ro:** Trung bình (Medium). Không gây lộ dữ liệu, nhưng làm hỏng luồng nghiệp vụ.
- **Khuyến nghị:** Sử dụng Annotation `@Version` ở file Entity `MentorshipRequest` (Optimistic Locking), hoặc Lock tại truy vấn Query (Pessimistic Write Lock). Do Backend thiết kế khá chặt, chỉ có lỗi này là nổi cộm nhất.
