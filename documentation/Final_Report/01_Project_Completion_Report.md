# Báo Cáo Hoàn Thành Dự Án (Project Completion Report)
**Module:** Mentorship Request & Submission
**Luồng Nghiệp Vụ:** Số 4

## 1. Tổng quan module & Mục tiêu
Module Mentorship & Submission xử lý quá trình từ lúc thí sinh gặp khó khăn cần gọi Cố vấn, đến lúc vấn đề được giải quyết và thí sinh nộp bài dự thi cuối cùng.
Mục tiêu đợt nâng cấp này là thực hiện **Technical Audit toàn diện**, loại bỏ các lỗ hổng bảo mật nghiêm trọng (IDOR), chuẩn hóa máy trạng thái (State Machine), sửa lỗi logic hiển thị, cải thiện trải nghiệm Cố vấn và tối ưu hóa hệ thống.

## 2. Business Flow
Quy trình chuẩn hóa sau nâng cấp:
`Team gặp vấn đề` -> `Leader gọi Mentor (Request)` -> `Request vào Question Pool (Lọc theo Bảng đấu)` -> `Mentor thuộc Bảng đấu Accept` -> `Request chuyển sang IN_PROGRESS` -> `Mentor có quyền Release (Nhả lại Pool) hoặc Resolve (Đóng)` -> `Leader Cancel (nếu Request OPEN)` -> `Leader nộp bài (Validate Link)` -> `Waiting for Judging`.

## 3. Danh sách toàn bộ thay đổi
1. **Security:** Sửa lỗi IDOR cho phép Leader tự Resolve Request của chính mình.
2. **State Machine:** Sửa lỗi Hard Delete khi Cancel Request. Bổ sung trạng thái `CANCELLED`.
3. **UX/Logic:** Lọc Question Pool theo Track mà Mentor được phân công.
4. **UX/Logic:** Bổ sung tính năng Release Request cho Mentor.
5. **Validation:** Thêm ràng buộc Regex bắt buộc dùng định dạng HTTP(s) cho Link Github và Link Demo khi nộp bài.
6. **Bug Fix:** Sửa lỗi hiển thị Mentorship Request bị thiếu nếu thí sinh tham gia nhiều Team/Event.
7. **Performance:** Chuyển vòng lặp gửi Notification sang Batch Insert.
8. **Architecture:** Tách `MentorshipRequestService` thành Interface và Implementation.

## 4. Danh sách file đã tác động
**File mới:**
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestServiceImpl.java` (Từ file Service cũ)

**File đã sửa:**
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestService.java` (Sửa thành Interface)
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestController.java`
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestStatus.java`
* `backend\src\main\java\com\example\swp\features\submission\dto\request\CreateSubmissionRequest.java`
* `backend\src\main\java\com\example\swp\features\notification\NotificationService.java`

**File đã xóa:** Không có.

## 5. Cải thiện hệ thống (Improvements)
* **Security:** Cấm can thiệp chéo IDOR, phân quyền `@PreAuthorize` và kiểm tra Ownership chặt chẽ ở tầng Service.
* **Performance:** Giảm O(N) queries Insert xuống còn O(1) query Batch Insert khi tạo Request.
* **UI/Data:** Ngăn chặn data rác thông qua Regex Validation.

## 6. Testing Summary
Dự án đã PASS 100% các bài test (API Testing, Manual Validation Testing, Maven Regression Compile Test) ở toàn bộ 4 Phase. Logic hoạt động trơn tru.

## 7. Known Issues & Technical Debt còn lại
* **Rate Limit:** Thiếu Rate Limit cho tính năng "Accept" và "Release" liên tục của Mentor.
* **Event-Driven Architecture:** SSE Push Notification vẫn đang gọi trong vòng lặp. Nếu cần scale lên hàng nghìn user online, nên chuyển sang dùng Message Queue (RabbitMQ/Kafka).

## 8. Hướng phát triển tiếp theo
* Thêm Websocket/Chat Realtime vào giữa Mentor và Leader khi Request đang ở trạng thái `IN_PROGRESS` thay vì chỉ có nút Resolve cứng nhắc.
* Viết thêm Automated Unit Tests (JUnit/Mockito) cho `MentorshipRequestServiceImpl`.
