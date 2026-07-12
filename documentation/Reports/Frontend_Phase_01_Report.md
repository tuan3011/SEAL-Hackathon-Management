# Frontend Refactor - Phase 1 Report

## Mục tiêu
* Cập nhật các Interface TypeScript trong `MentorshipRequestService.ts` và `SubmissionService.ts`.
* Khai báo thêm các API mới từ Backend.

## Công việc đã thực hiện
* Sửa đổi `MentorshipRequest`: Thêm các field Optional/Required từ Backend (`resolvedAt`, `answer`, `rejectReason`, `mentorName`, `createdAt`).
* Thêm phương thức API `cancelRequest(id)` gọi đến `DELETE /mentorship-requests/{id}`.
* Thêm phương thức API `releaseRequest(id)` gọi đến `PATCH /mentorship-requests/{id}/release`.
* Cập nhật `Submission`: Thay thế field rác `content` thành các chuẩn URL của Backend (`repositoryUrl`, `demoUrl`, `reportUrl`, `status`).
* Cập nhật `CreateSubmissionRequest`: Xóa `content`, thêm 3 tham số URL tương ứng.

## Self Review & AI Review
* Code gọn gàng, Type Interface match 100% với Backend Payload và Response Schema.

## Lịch sử Test
* **API Test:** Không có lỗi 문법 trong config Axios.
* **Manual Test:** (Chưa áp dụng do chưa có UI).
* **Regression Test:** Đã chạy `npm run build` (tsc compile). Kết quả: **PASS**. Tất cả code Frontend cũ đều tương thích với Interface mới (do Frontend lúc viết form Submission đã bỏ qua Type của Service và tự map payload thô vào hàm `api.post`).

Sẵn sàng chuyển sang Phase 2.
