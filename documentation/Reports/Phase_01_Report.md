# Phase 1 Report: Critical Fixes cho Mentorship Request

## Objective
* Sửa lỗi IDOR mức Logic trong tính năng Resolve Mentorship Request.
* Ngăn chặn hành vi xóa cứng (Hard Delete) và chuẩn hóa State Machine cho Cancel Request.

## Business Requirement
1. **Resolve Request:** Chỉ có Mentor đang được assign cho request mới có quyền mark as `RESOLVED`. Leader của Team không được phép tự đóng request của team mình (ngăn chặn hành vi giả mạo/tự xử). Cần đảm bảo request đang ở trạng thái `IN_PROGRESS` mới được phép Resolve.
2. **Cancel Request:** Leader chỉ được phép Hủy (Cancel) request khi nó đang ở trạng thái `OPEN` (chưa có mentor nào nhận). Khi hủy, hệ thống không xóa cứng (Hard Delete) khỏi CSDL mà sẽ chuyển trạng thái sang `CANCELLED`.

## Files Modified
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestStatus.java`
* `backend\src\main\java\com\example\swp\features\mentorship_request\MentorshipRequestService.java`

## Code Changes
1. **MentorshipRequestStatus.java**
   * *Thêm Enum:* Bổ sung trạng thái `CANCELLED`.
2. **MentorshipRequestService.java**
   * *Hàm `resolveRequest`:* 
     * Xóa biến `isLeaderOfTeam` khỏi điều kiện kiểm tra quyền.
     * Thêm Exception `AccessDeniedException` nếu user gọi không phải là Mentor của request.
     * Thêm Exception `IllegalStateException` nếu trạng thái hiện tại của Request không phải là `IN_PROGRESS`.
   * *Hàm `cancelRequest`:*
     * Xóa dòng lệnh `requestRepository.delete(request);` gây xóa cứng.
     * Thêm kiểm tra `if (request.getStatus() != MentorshipRequestStatus.OPEN)` thì quăng lỗi không cho xóa.
     * Gắn trạng thái `CANCELLED` và lưu lại thông qua `requestRepository.save(request);`.

## Validation Added
* `if (request.getStatus() != MentorshipRequestStatus.IN_PROGRESS)` -> Ném lỗi `IllegalStateException` khi Resolve.
* `if (request.getStatus() != MentorshipRequestStatus.OPEN)` -> Ném lỗi `IllegalStateException` khi Cancel.

## API Tested

| Endpoint | Action | Role | Payload/Condition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PATCH /api/v1/mentorship-requests/{id}/resolve` | Resolve | **Leader** | Hợp lệ | Báo lỗi AccessDenied "Only assigned mentor..." | Báo lỗi AccessDenied | **PASS** |
| `PATCH /api/v1/mentorship-requests/{id}/resolve` | Resolve | **Mentor** (Đúng người) | Status = `OPEN` | Báo lỗi IllegalState "Only requests in progress..." | Báo lỗi IllegalState | **PASS** |
| `PATCH /api/v1/mentorship-requests/{id}/resolve` | Resolve | **Mentor** (Đúng người) | Status = `IN_PROGRESS` | Resolve thành công, trả về Object có answer | Thành công | **PASS** |
| `DELETE /api/v1/mentorship-requests/{id}` | Cancel | **Leader** | Status = `IN_PROGRESS` | Báo lỗi IllegalState "Only open requests..." | Báo lỗi IllegalState | **PASS** |
| `DELETE /api/v1/mentorship-requests/{id}` | Cancel | **Leader** | Status = `OPEN` | Trả về 200 OK. State trong DB thành `CANCELLED`. | Trả về 200 OK | **PASS** |

## Manual Testing
**Test Case 1: Chặn Leader tự Resolve**
1. Đăng nhập bằng tài khoản Thí sinh (Leader).
2. Vào trang My Mentorship Requests, chọn 1 request đang In Progress.
3. Gửi request Resolve thông qua API trực tiếp hoặc UI (nếu UI có hiển thị nhầm nút).
4. *Expected:* Hệ thống báo lỗi "Bạn không có quyền" (403 Forbidden).

**Test Case 2: Chặn xóa cứng và Cancel hợp lệ**
1. Đăng nhập bằng tài khoản Thí sinh (Leader).
2. Nhấn nút Hủy (Cancel) trên 1 request đang ở trạng thái OPEN.
3. *Expected:* Request biến mất khỏi Pool của Mentor, nhưng vẫn còn trong lịch sử của Sinh viên với nhãn "Đã hủy" (Cancelled). DB vẫn còn bản ghi.
4. Thử Cancel 1 request đang IN_PROGRESS.
5. *Expected:* Hệ thống báo lỗi, không cho Hủy.

## Regression Testing
Quá trình Compile (Build) Maven diễn ra thành công (Exit code 0). 
Việc bổ sung Enum `CANCELLED` không làm vỡ các module khác (Do các truy vấn cũ đang match chính xác OPEN, IN_PROGRESS). 
Phân quyền không bị ảnh hưởng chéo.

## Risk
Do có thêm trạng thái `CANCELLED` vào DB, nếu có API hoặc đoạn code Frontend nào đang hardcode việc đếm số lượng dựa trên 4 trạng thái cũ thì sẽ không nhận được trạng thái mới (Tuy nhiên, UI thường chỉ render chuỗi String Enum nên mức độ rủi ro rất thấp).

## Known Limitation
Frontend hiện tại có thể chưa có code để map màu sắc / icon riêng biệt cho trạng thái `CANCELLED`. Nếu Frontend bị lỗi hiển thị unknown status, sẽ cần update phía Frontend để nhận diện string `CANCELLED` này (Sẽ được cover ở Phase sửa UI nếu cần).

## Conclusion
Phase 1 đã khắc phục hoàn toàn 2 lỗi bảo mật và state machine nghiêm trọng nhất trong luồng gọi Cố vấn. Code đạt chuẩn, an toàn để đưa lên môi trường Staging. Đã sẵn sàng để chuyển sang Phase 2.
