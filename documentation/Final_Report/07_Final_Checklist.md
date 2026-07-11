# Final Checklist

Toàn bộ các yêu cầu của luồng nghiệp vụ số 4 đã được đáp ứng đầy đủ:

- [x] Lỗi IDOR "Leader tự đóng Request" đã được vá.
- [x] Hủy (Cancel) Request không còn gây xóa cứng (Hard Delete) vào Database. Đã đổi thành trạng thái `CANCELLED`.
- [x] Đã chặn Hủy Request khi Mentor đã tham gia xử lý (Chỉ mở khóa cho trạng thái `OPEN`).
- [x] Đã lọc danh sách Question Pool (API `/open`) để hiển thị đúng chuyên ngành (Track) của Mentor.
- [x] Đã thêm cơ chế "Nhả Task" (Release Request) để Mentor có thể từ chối sau khi đã lỡ Accept.
- [x] Bắt lỗi 400 Bad Request nếu sinh viên nhập linh tinh vào đường link Repository / Demo khi Nộp Bài (Submission).
- [x] Đã hiển thị lịch sử gọi Mentor đầy đủ cho những Sinh viên tham gia nhiều Đội/Giải đấu.
- [x] Đã tối ưu tốc độ Insert Notification (Sửa N+1 Query).
- [x] Đã tách `MentorshipRequestService` theo đúng chuẩn thiết kế Clean Architecture (Interface + Impl).

Toàn bộ báo cáo đã được lưu vào thư mục `Final_Report`. Hoàn thành nhiệm vụ!
