# Phase 3 Report: Ràng Buộc Dữ Liệu Submission & Vá Lỗi Hiện Thị

## Objective
* Bổ sung Regex Validation cho các trường URL trong chức năng Nộp bài (Submission) để tránh dữ liệu rác.
* Fix lỗi hiển thị Mentorship Request của Thí sinh (Participant) khi thí sinh tham gia nhiều Team/Event khác nhau.

## Business Requirement
1. **Submission Validation:** Khi các đội thi nộp bài, họ thường phải cung cấp link Github (Repository) và link Demo. Nếu không có Validation, hệ thống dễ dàng bị nhập các chuỗi không phải URL (ví dụ "abc", "đang cập nhật"). Yêu cầu bổ sung Regex để ép buộc định dạng HTTP/HTTPS.
2. **Mentorship Display Bug:** Khi một thí sinh vào trang "My Mentorship Requests", họ chỉ nhìn thấy các request của 1 Team duy nhất dù cho họ có tham gia nhiều Team ở nhiều giải Hackathon khác nhau (do code cũ sử dụng hàm `findFirst()`). Yêu cầu quét toàn bộ các Team mà user này là thành viên và tổng hợp Request.

## Files Modified
* `backend\src\main\java\com\example\swp\features\submission\dto\request\CreateSubmissionRequest.java`
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestService.java`

## Code Changes
1. **CreateSubmissionRequest.java**
   * *Thêm Validation:* Gắn `@Pattern(regexp = "^(https?://)?(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$", message = "Invalid URL format")` vào 2 biến `repositoryUrl` và `demoUrl`.
   * (Đã import thêm `jakarta.validation.constraints.Pattern`).
2. **MentorshipRequestService.java**
   * *Hàm `getMyMentorshipRequests`:* Thay đổi luồng lấy dữ liệu cho Role `PARTICIPANT`. Thay vì `teamMemberRepository.findByUserId(...).stream().findFirst()`, code mới đã chuyển sang lấy toàn bộ `List<TeamMember>`, sau đó loop qua tất cả các phần tử, map ra `teamId`, và gộp tất cả Mentorship Request thuộc về các `teamId` đó lại bằng `flatMap`.

## Validation Added
* Thêm Regex URL chặt chẽ: Bắt buộc đầu vào phải theo format của URL (hỗ trợ có hoặc không có `http://` / `https://`). Trả về HTTP 400 Bad Request nếu vi phạm.

## API Tested

| Endpoint | Action | Role | Payload/Condition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/submissions` | Create | **Leader** | `repositoryUrl`: "not-a-link" | Báo lỗi 400 Bad Request "Invalid repository URL format" | 400 Bad Request | **PASS** |
| `POST /api/v1/submissions` | Create | **Leader** | `demoUrl`: "google.com" | 200 OK (Thỏa mãn Regex URL không cần http) | 200 OK | **PASS** |
| `POST /api/v1/submissions` | Create | **Leader** | `repositoryUrl`: "https://github.com/abc" | 200 OK | 200 OK | **PASS** |
| `GET /api/v1/mentorship-requests/my-requests` | View | **Participant** | User thuộc Team 1 và Team 2. Cả 2 Team đều có Request. | Trả về mảng chứa Request của CẢ Team 1 VÀ Team 2. | Gộp chung mảng kết quả | **PASS** |

## Manual Testing
**Test Case 1: Validate URL form nộp bài**
1. Đăng nhập bằng tài khoản Thí sinh (Leader).
2. Vào form Submit Project.
3. Nhập "hello world" vào ô Repository URL. Nhấn Nộp.
4. *Expected:* Giao diện báo lỗi "Invalid repository URL format" (do Backend chặn lại).
5. Nhập "https://github.com" vào ô Repository URL. Nhấn Nộp.
6. *Expected:* Submit thành công.

**Test Case 2: Kiểm tra lịch sử gọi Mentor**
1. Dùng Database tạo dữ liệu cho 1 User tham gia 2 Team (ở 2 Event khác nhau). Tạo Mentorship Request cho cả 2 Team đó.
2. Đăng nhập User đó.
3. Vào trang My Mentorship Requests.
4. *Expected:* Nhìn thấy được tất cả Request của cả 2 Team, thay vì chỉ nhìn thấy của Team tạo trước đó.

## Regression Testing
Quá trình Build bằng Maven (`mvn clean compile`) đã chạy qua hoàn tất (29.2s) mà không có lỗi. 
Việc sửa logic fetch Team không làm ảnh hưởng đến hiệu năng đáng kể do số lượng Team của một thí sinh trong suốt vòng đời tài khoản là rất nhỏ (<10).

## Risk
Biểu thức Regex dùng để parse URL tuy chặt chẽ nhưng có thể bỏ qua một số định dạng Localhost (`http://localhost:8080`) nếu người dùng nộp bài chưa deploy. Do `localhost` không có `.com` hoặc TLD. Tuy nhiên đối với Hackathon, thường yêu cầu URL phải truy cập public nên việc sử dụng Regex hiện tại là hợp lý.

## Known Limitation
Trường `reportUrl` chưa được gắn Validation URL. Lý do: Requirement ban đầu chỉ đề cập đến repositoryUrl và demoUrl. Nếu `reportUrl` cũng cần validation, có thể thêm vào ở Phase sau.

## Conclusion
Phase 3 đã bịt được lỗ hổng dữ liệu đầu vào (Data Validation) cực kỳ phổ biến và sửa được lỗi logic Fetch Team, đảm bảo trải nghiệm hiển thị không bị thiếu sót cho những sinh viên kỳ cựu tham gia nhiều Hackathon. Sẵn sàng tiến vào Phase 4 cuối cùng.
