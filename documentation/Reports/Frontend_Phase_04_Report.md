# Frontend Refactor - Phase 4 Report

## Mục tiêu
Đồng bộ Form Submission (Nộp dự án) của thí sinh với Backend:
* Bổ sung trường dữ liệu `reportUrl` (Link báo cáo) vào form nhập liệu.
* Thay thế biểu thức Regex lỏng lẻo (`new URL()`) bằng Regex siêu chặt chẽ được cung cấp bởi Backend để bắt lỗi URL từ Frontend mà không cần đợi gửi API.

## Công việc đã thực hiện
**Sửa đổi file:** `frontend/src/pages/participant/SubmitProjectPage.tsx`
1. Sửa state: Thêm `reportUrl` và `reportError`.
2. Sửa hàm `isValidUrl(url)`: Áp dụng Regex Backend (`/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/`).
3. Sửa hàm `validateForm()`: Bổ sung kiểm tra tính hợp lệ của `reportUrl`. Mặc dù Backend có thể cho phép rỗng (Optional), nhưng nếu đã nhập thì phải đúng format.
4. Cập nhật giao diện JSX: Bổ sung trường nhập liệu cho Report URL bên dưới Demo URL, dùng lại style và icon chuẩn của Tailwind / Lucide-react.

## Self Review & AI Review
* Giao diện nhất quán: Trường nhập liệu Report URL khớp hoàn toàn 100% với Demo URL về margin, padding, viền báo lỗi. 
* Trải nghiệm mượt mà: Form bắt lỗi ngay khi người dùng bấm Submit (hoặc onChange nếu đã bị lỗi trước đó).

## Lịch sử Test
* **API Test:** Form gửi đi payload đầy đủ `{ teamId, roundId, repositoryUrl, demoUrl, reportUrl }`.
* **Regression Test:** Chạy `npm run build` kết thúc thành công (1.31s). Type Interface đã khớp 100% nhờ Phase 1.

Hoàn tất lộ trình Code!
