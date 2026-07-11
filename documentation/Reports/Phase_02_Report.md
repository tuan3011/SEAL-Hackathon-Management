# Phase 2 Report: Cải Thiện Trải Nghiệm & Logic Của Mentor

## Objective
* Lọc danh sách Request hiển thị trong Question Pool (API `GET /open`) theo Bảng đấu (Track) của Mentor.
* Thêm tính năng Release (Nhả Request) để Mentor có thể trả Request về lại trạng thái `OPEN` nếu không thể hỗ trợ.

## Business Requirement
1. **Lọc theo Track:** Hệ thống hiện tại đang trả về toàn bộ Mentorship Request cho tất cả Mentor. Yêu cầu hệ thống phải check bảng `TrackMentor`, lấy danh sách Track mà Mentor đang phụ trách, và chỉ hiển thị Request của các Team thuộc các Track đó.
2. **Release Request:** Nếu một Mentor lỡ nhấn `Accept` một Request nhưng sau đó phát hiện mình không có đủ kiến thức chuyên môn để giải quyết (hoặc có việc bận đột xuất), Mentor đó phải có khả năng nhả (Release) Request ra. Request sẽ chuyển từ `IN_PROGRESS` về lại `OPEN` và xóa `mentor_id`, đồng thời gửi thông báo lại cho Leader của Team.

## Files Modified
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestService.java`
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestController.java`

## Code Changes
1. **MentorshipRequestService.java**
   * *Dependency Injection:* Thêm `TrackMentorRepository` để có thể truy vấn Track của Mentor.
   * *Hàm `getOpenRequests`:* Sửa logic fetch dữ liệu. Thay vì trả về toàn bộ mảng `requestRepository.findByStatus(OPEN)`, code mới sẽ lấy ra danh sách `trackId` của Mentor hiện tại thông qua `TrackMentorRepository`, sau đó dùng Java Stream API để `filter` các request sao cho `request.getTeam().getTrack().getId()` nằm trong danh sách `trackId` được phân công.
   * *Hàm `releaseRequest` (MỚI):* Nhận vào `requestId`. Kiểm tra quyền xem người gọi có đúng là Mentor đang xử lý request này không. Kiểm tra trạng thái phải là `IN_PROGRESS`. Sau đó set `request.setMentor(null)` và `request.setStatus(OPEN)`. Cuối cùng, tạo một Notification gửi tới Team Leader báo rằng Request đã được nhả lại vào Pool.
2. **MentorshipRequestController.java**
   * Thêm endpoint `PATCH /api/v1/mentorship-requests/{id}/release`.
   * Gắn quyền `@PreAuthorize("hasRole('MENTOR')")`.

## Validation Added
* `if (request.getStatus() != MentorshipRequestStatus.IN_PROGRESS)` -> Lỗi nếu Request không ở trạng thái In Progress mà lại đòi Release.
* `if (request.getMentor() == null || !request.getMentor().getId().equals(mentor.getId()))` -> Lỗi nếu Mentor khác cố tình Release request của người khác.

## API Tested

| Endpoint | Action | Role | Payload/Condition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/mentorship-requests/open` | Lọc Request | **Mentor** | Mentor thuộc Track A | Trả về list rỗng nếu không có team Track A nào gửi request (Dù Track B có request) | List đã được filter | **PASS** |
| `PATCH /api/v1/mentorship-requests/{id}/release` | Nhả Task | **Mentor 1** | Request đang được Mentor 2 nhận | Báo lỗi AccessDenied "Only assigned mentor..." | Báo lỗi AccessDenied | **PASS** |
| `PATCH /api/v1/mentorship-requests/{id}/release` | Nhả Task | **Mentor 1** | Request đang OPEN | Báo lỗi IllegalState "Only in-progress requests..." | Báo lỗi IllegalState | **PASS** |
| `PATCH /api/v1/mentorship-requests/{id}/release` | Nhả Task | **Mentor 1** | Hợp lệ (Đang IN_PROGRESS do M1 giữ) | Trả về 200 OK. State về `OPEN`, Mentor bị null. Có gửi Notification cho Leader. | 200 OK, logic đúng | **PASS** |

## Manual Testing
**Test Case 1: Filter Question Pool**
1. Setup DB: Team 1 (Track A) tạo Request. Team 2 (Track B) tạo Request. Cả 2 đều OPEN.
2. Đăng nhập bằng Mentor X (Được phân công Track A).
3. Gọi API `/open`.
4. *Expected:* Chỉ nhìn thấy Request của Team 1. Không nhìn thấy Request của Team 2.

**Test Case 2: Release Task**
1. Mentor X bấm Accept Request của Team 1. Request chuyển sang IN_PROGRESS.
2. Mentor X gọi API `/release` cho Request đó (bấm nút Nhả Task trên UI).
3. *Expected:* Request biến mất khỏi mục "My Requests" của Mentor X, xuất hiện trở lại ở mục "Question Pool" (OPEN). Leader của Team 1 nhận được chuông thông báo "Mentor X has released your request".

## Regression Testing
Quá trình Build bằng Maven (`mvn clean compile`) đã chạy qua hoàn tất (26.8s) mà không có lỗi. 
Quyền hạn và API cũ không bị ảnh hưởng. Các thư viện injected (TrackMentorRepository) hoạt động tốt với `@RequiredArgsConstructor`.

## Risk
Việc dùng Stream API `filter` trong Java thay vì query thẳng bằng SQL (`@Query("... JOIN ...")`) có thể ảnh hưởng nhẹ đến Performance nếu số lượng Request OPEN tại một thời điểm lên tới hàng chục nghìn. Tuy nhiên, quy mô của một giải Hackathon thường chỉ giới hạn dưới vài trăm Request OPEN, do đó logic In-Memory Filtering hoàn toàn đáp ứng được và code dễ maintain hơn. Sẽ xem xét chuyển sang Custom JPA Query ở Phase 4 nếu nhận thấy dấu hiệu thắt cổ chai.

## Known Limitation
Chưa có chức năng "Block Mentor". Nếu một Mentor liên tục "Accept" rồi "Release" cùng một request (nhằm mục đích troll team), hệ thống hiện tại chưa có bộ đếm/chặn (Rate limit) hành vi này. Sẽ cần xem xét thêm ở tương lai.

## Conclusion
Phase 2 đã hoàn thành xuất sắc việc phân luồng Mentor theo Track, giảm tải rác trong Question Pool và cung cấp cơ chế thoái lui (Release) an toàn cho Mentor khi gặp task khó. Hệ thống vững chắc hơn nhiều so với ban đầu. Sẵn sàng cho Phase 3.
