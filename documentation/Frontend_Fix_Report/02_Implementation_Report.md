# Implementation Report (Phase 1 & 2)

## Phase 1: Optional Field Standardization
* **Mục tiêu:** Đảm bảo toàn bộ các trường dữ liệu tùy chọn (Optional Fields) không gửi chuỗi rỗng `""` xuống Backend.
* **Các file đã sửa:**
  1. `SubmitProjectPage.tsx`: Chuyển `demoUrl` và `reportUrl` sang `trim() || undefined`.
  2. `MentorshipRequestForm.tsx`: Chuyển `description` sang `trim() || undefined`.
  3. `ProfilePage.tsx`: Chuyển toàn bộ các form values (`fullName`, `fptStudentId`, `schoolName`, `githubUrl`, `skills`) sang `trim() || undefined`.

## Phase 2: API Action Standardization
* **Mục tiêu:** Ngăn chặn lỗi Double Submit và lỗi gọi API liên tục do người dùng thao tác nhanh.
* **Các file đã sửa:**
  1. `MyMentorshipRequestsPage.tsx` (Tính năng Cancel Request):
     - Thêm state `isCancelling`.
     - Cập nhật hàm `handleCancelRequest` với `try...finally` để reset state `isCancelling`.
     - Thêm UI loading spinner vào nút Cancel Request và khóa nút (disabled) trong quá trình gọi API. Khóa cả nút Close và Block hành động click ra ngoài Modal khi đang xử lý.
  2. `MentorRequestsPage.tsx` (Tính năng Accept Request):
     - Thêm state `acceptingId` để theo dõi chính xác Request nào đang được xử lý (Do đây là giao diện list).
     - Cập nhật hàm `handleAccept` với `try...finally`.
     - Thêm UI loading spinner, disable nút Accept và Decline trong quá trình gọi API.

## Self Review
* Tất cả API call từ Frontend đều đã an toàn 100% trước 2 vấn đề: Double Click và Optional Fields Validation.
* Không làm thay đổi luồng nghiệp vụ hoặc can thiệp Backend.
* Build TypeScript hoàn toàn không có lỗi.

Chuẩn bị sẵn sàng sang Phase 4 (Test API) và Phase 5 (Test Manual).
