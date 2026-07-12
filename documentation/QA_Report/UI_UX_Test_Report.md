# UI / UX Test Report

## 1. Modals & Popups
* **Cancel Confirmation:** Hoạt động tốt với hàm `window.confirm`. Không có lỗi overlay.
* **Mentor Reply Modal:** Scroll tốt trên Mobile, text không bị overflow khi description quá dài.
* **Double Click Prevention:** (Bug) Thiếu cơ chế chặn Double Click trên nút "Cancel Request" (Leader). Có thể gây ra 2 request DELETE liên tiếp.

## 2. Empty States
* **My Mentorship Requests:** Hiển thị rõ ràng: "Your team has not made any mentorship requests yet" với viền đứt nét.
* **Mentor Dashboard:** Hiển thị: "You have no active mentorship sessions."
* **Submission:** Nếu không có Event đang mở, hiển thị cảnh báo màu Vàng "Hiện tại không có vòng thi nào đang diễn ra" thay vì crash component.

## 3. Form Validation UI
* Màu sắc cảnh báo (Đỏ) hoạt động chuẩn trên Form Submission khi Regex fail.
* Thông báo lỗi được chuyển xuống sát dưới Input box, dễ đọc.

## 4. Notifications
* Toast (React Hot Toast) hiện ở góc màn hình. Success Toast cho thao tác Cancel và Release hoạt động đúng định dạng.
