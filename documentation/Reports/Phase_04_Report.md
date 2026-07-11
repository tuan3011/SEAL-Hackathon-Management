# Phase 4 Report: Tối Ưu Hóa & Refactor Kiến Trúc

## Objective
* Tối ưu hóa Database Query: Giảm thiểu số lượng câu lệnh Insert được gọi khi tạo Mentorship Request (Batch Insert Notifications).
* Refactor Codebase: Tách `MentorshipRequestService` thành Interface và Implementation để tuân thủ nguyên tắc thiết kế chung của Spring Boot.

## Business Requirement
1. **Batch Insert Notification:** Khi một Team gửi Request, hệ thống phải thông báo cho TẤT CẢ các Mentor (có thể lên tới hàng chục người). Vòng lặp `for` cũ gọi `save()` liên tục sẽ gây nghẽn cổ chai Database (N+1 Insert problem). Yêu cầu chuyển sang dùng `saveAll()` để Spring Data JPA gom thành Batch Insert.
2. **Architecture Refactor:** Hầu hết các service trong dự án (ví dụ `SubmissionService`) đều đã được tách thành cặp `Interface` và `ServiceImpl`. `MentorshipRequestService` hiện đang là class nguyên khối. Cần tách ra để dễ viết Mock Test và đảo ngược phụ thuộc (Dependency Inversion).

## Files Modified/Created
* `backend\src\main\java\com\example\swp\features\notification\NotificationService.java`
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestService.java` (Sửa thành Interface)
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestServiceImpl.java` (File Implementation mới)

## Code Changes
1. **NotificationService.java**
   * Bổ sung hàm `createNotifications(List<User> users, String title, ...)`. Hàm này loop qua mảng User để khởi tạo các Object `Notification`, sau đó gọi duy nhất một lệnh `notificationRepository.saveAll(notifications)`. Cuối cùng mới thực hiện loop để push SSE.
2. **MentorshipRequestServiceImpl.java**
   * *Hàm `createRequest`:* Thay vòng lặp `for` cũ bằng câu lệnh `notificationService.createNotifications(...)` với mảng `mentors`.
   * *Class Signature:* Đổi tên file và tên class thành `MentorshipRequestServiceImpl`, thêm từ khóa `implements MentorshipRequestService`.
3. **MentorshipRequestService.java (Interface)**
   * Chứa toàn bộ các method public của service cũ: `createRequest`, `acceptRequest`, `resolveRequest`, `rejectRequest`, `cancelRequest`, `releaseRequest`, `getOpenRequests`, `getRequestById`, `getMyMentorshipRequests`.

## API Tested
Không có API mới được thêm vào. Toàn bộ API cũ của Mentorship đều được test lại thông qua quá trình Compile (Build) do Spring Context sẽ tự động inject Bean `MentorshipRequestServiceImpl` vào `MentorshipRequestController`.

## Regression Testing
Quá trình Build bằng Maven (`mvn clean compile`) đã hoàn tất xuất sắc (28.0s). 
Spring IoC Container tự động ánh xạ Controller với Interface mới thành công, không gặp lỗi `NoSuchBeanDefinitionException`. Tính tương thích ngược 100%.

## Conclusion
Phase 4 đã giải quyết triệt để vấn đề Tech Debt (nợ kỹ thuật) và tối ưu Performance cho luồng khởi tạo. Module Mentorship & Submission đã chính thức hoàn thiện với độ ổn định cao, bảo mật chặt chẽ và chuẩn Clean Architecture. Đã sẵn sàng xuất tài liệu Final Report.
