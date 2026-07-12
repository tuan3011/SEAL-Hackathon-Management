# 01. Source Code Review

## Tổng quan các file đã thay đổi trong đợt Refactor
1. **`MyMentorshipRequestsPage.tsx`**
   - *Mục đích:* Bổ sung trạng thái `isCancelling`, chuẩn hóa Loading state, khóa nút bấm để chống Double Click. Cập nhật `try...finally`.
   - *Kết quả Review:* Logic sạch, Type-safety được bảo đảm (`MentorshipRequest` interface). Không có import thừa.
2. **`MentorRequestsPage.tsx`**
   - *Mục đích:* Bổ sung trạng thái `acceptingId` để hiển thị Spinner đúng cho từng item trong danh sách, chống Double Accept.
   - *Kết quả Review:* Sạch, đúng nguyên tắc React (không mutate state trực tiếp). Khóa toàn bộ các action khác trong lúc đang `accepting`.
3. **`SubmitProjectPage.tsx`**
   - *Mục đích:* Chuẩn hóa gửi chuỗi `undefined` cho Optional URLs.
   - *Kết quả Review:* Sạch, `repositoryUrl.trim()` hoạt động an toàn.
4. **`ProfilePage.tsx`**, **`MentorshipRequestForm.tsx`**
   - *Mục đích:* Chống lỗi `400 Bad Request` do gửi `""`.
   - *Kết quả Review:* Logic chuyển đổi payload chuẩn xác, tránh lây lan rác lên Backend.

## Phát hiện Code Smell (Rác)
Thông qua công cụ quét mã nguồn tự động, tôi phát hiện các file **không thuộc phạm vi sửa đổi gần đây** có chứa rác (Debug Logs):
- **`NotificationBell.tsx`** (Dòng 103, 118, 125, 130...): Chứa nhiều `console.log("Navigating to...")`.
- **`NotificationsPage.tsx`** (Dòng 61, 75, 82...): Chứa `console.log("Notification clicked in page")`.
- *Nguyên nhân (Root Cause):* Dev Frontend chưa dọn dẹp các lệnh debug trong quá trình làm tính năng Notification Routing.
- *Đề xuất (Solution):* Xóa bỏ toàn bộ `console.log` tại 2 file này trước khi Build Production. **(HIỆN TẠI TÔI KHÔNG TỰ SỬA THEO LỆNH CỦA BẠN).**

Không phát hiện đoạn code `TODO` hay `FIXME` nào bị bỏ quên.
Không có Dead Component.
Không có Dead Import trong các file liên quan đến Mentorship/Submission.
