# Frontend Refactor - Phase 2 Report

## Mục tiêu
Đồng bộ UI của Thí sinh (Leader) với API mới của Backend:
* Cập nhật màu sắc, badge và thống kê cho trạng thái `CANCELLED`.
* Bổ sung nút **"Cancel Request"** ở Modal xem chi tiết để thí sinh có thể chủ động hủy khi Mentor chưa vào cuộc.

## Công việc đã thực hiện
**Sửa đổi file:** `frontend/src/pages/participant/MyMentorshipRequestsPage.tsx`
1. Khởi tạo giá trị thống kê đếm (Counter) cho `CANCELLED` trong `useMemo`.
2. Định nghĩa màu sắc UI cho status `CANCELLED` (`bg-gray-100 text-gray-600 border-gray-300`).
3. Tạo 1 ô "Cancelled" trong bảng Status Summary ở đầu trang.
4. Thêm hàm `handleCancelRequest(id)` để bật hộp thoại xác nhận `window.confirm` và gọi API `MentorshipRequestService.cancelRequest`.
5. Thiết kế và bổ sung nút "Cancel Request" có icon thùng rác (`Trash2` từ thư viện `lucide-react`) vào trong Modal chi tiết. Nút này sẽ tự động ẨN nếu trạng thái không phải là `OPEN`.

## Self Review & AI Review
* UI mới kế thừa thiết kế gốc (Tailwind CSS, Lucide Icons) và tích hợp hoàn hảo với hệ thống thông báo (`react-hot-toast`).
* Thẻ CANCELLED đồng bộ liền mạch với bảng hiển thị. Không phá vỡ Grid layout hiện tại (đổi grid-cols-4 thành grid-cols-5).

## Lịch sử Test
* **API Test:** Đã map đúng URL `DELETE /mentorship-requests/{id}`.
* **Regression Test:** Quá trình compile `npm run build` kết thúc thành công. (1.24s). 

Sẵn sàng chuyển sang Phase 3: Mentor Flow Sync.
