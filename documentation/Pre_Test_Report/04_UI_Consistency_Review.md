# 04. UI Consistency Review

## 1. Nút Bấm (Buttons)
* **Disabled States:** Các nút `Cancel`, `Accept`, `Decline`, `Submit` khi bị disabled (do loading) đều đã được áp dụng class `disabled:opacity-50`, tạo ra hiệu ứng mờ nhạt đồng nhất báo hiệu cho người dùng không thể click thêm.
* **Màu sắc:** 
  - Action an toàn (Accept): Xanh lá (`bg-green-600`).
  - Action cảnh báo (Cancel, Decline): Đỏ (`bg-red-50`, text đỏ).
  - Khớp 100% Design System gốc.

## 2. Loading Spinners
* Dùng chuẩn CSS Spinner: `<div className="animate-spin rounded-full h-4 w-4 border-b-2..."></div>`.
* Spinner được tích hợp trơn tru vào bên trong nút (inline with text) thay vì dùng toàn màn hình gây khó chịu. Chữ trên nút được thay đổi tương ứng (Vd: "Cancelling...", "Submitting...").

## 3. Popups & Modals
* Trong quá trình API đang chạy, hành vi Click Overlay để đóng Modal hoặc nút Close đều bị chặn (disabled/blocked). Điều này ngăn chặn việc UI biến mất trước khi thao tác API kết thúc.
* Lỗi ngắt đoạn giao diện không xảy ra.

## 4. Notifications (Toasts)
* Vị trí hiển thị chuẩn xác (React Hot Toast mặc định).
* Không xảy ra Duplicate Toast (hiện nhiều thông báo giống nhau) do hành vi click liên tục đã bị khóa lại bởi `isSubmitting`/`isCancelling`.

## Tổng kết
Đồng bộ UI đạt chuẩn. Cải tiến UX mượt mà, thông minh và an toàn.
