# Manual Test Report

## 1. Tính năng Phân luồng Mentor
* **Step:** Mentor X (thuộc Track AI) đăng nhập -> Mở trang Question Pool.
* **Action:** Hệ thống gọi API `GET /open`.
* **Expected:** Chỉ hiện các Request từ Team thi Track AI.
* **Actual:** Giao diện đã ẩn toàn bộ Request của Track Web/Mobile.
* **Result:** **PASS**.

## 2. Tính năng Nhả (Release) Request
* **Step:** Mentor click vào nút "Trợ giúp" (Accept). Sau đó click "Từ chối xử lý" (Release).
* **Action:** Hệ thống chuyển state `IN_PROGRESS` -> `OPEN`.
* **Expected:** Request xuất hiện lại ở trang Question Pool của Mentor Y (cùng Track).
* **Actual:** Mentor Y nhìn thấy. Leader nhận được chuông thông báo.
* **Result:** **PASS**.

## 3. Tính năng Chặn Hủy (Cancel) Request
* **Step:** Sinh viên Leader ấn nút "Hủy hỗ trợ" khi Mentor đã vào cuộc (IN_PROGRESS).
* **Action:** UI gọi API `DELETE`.
* **Expected:** Báo lỗi. Request vẫn giữ nguyên.
* **Actual:** Pop-up đỏ báo "Only open requests can be cancelled".
* **Result:** **PASS**.

## 4. Tính năng nộp bài (Regex Format)
* **Step:** Sinh viên nộp dự án. Điền linh tinh vào ô Repository.
* **Action:** UI gọi API `POST /submissions`.
* **Expected:** Đẩy ra lỗi 400. Yêu cầu nhập đúng form Link.
* **Actual:** Form validation catch lỗi "Invalid repository URL format".
* **Result:** **PASS**.
