# Master Test Plan

## 1. Test Scope
Kiểm thử toàn diện 2 phân hệ (Module):
* **Mentorship Request:** Tạo, Xem danh sách, Hủy, Nhận, Nhả (Release), và Trả lời (Resolve) yêu cầu hỗ trợ.
* **Submission:** Điền form nộp dự án, Kiểm tra Regex Validation của URL, Nộp bài.

## 2. Out of Scope
* Thuật toán chấm điểm (Judging).
* Đăng ký tham gia giải đấu (Registration).

## 3. Test Environment
* **Môi trường:** Staging / Localhost
* **Browser:** Chrome, Edge, Safari, Firefox (Latest versions)
* **Thiết bị:** Desktop (1920x1080), Tablet (768x1024), Mobile (390x844).

## 4. Test Accounts
* `student1@fpt.edu.vn` (Role: PARTICIPANT - Leader)
* `mentor1@fpt.edu.vn` (Role: MENTOR - Track A)
* `mentor2@fpt.edu.vn` (Role: MENTOR - Track B)

## 5. API Environment
* Base URL: `http://localhost:8080/api/v1`
* Auth: JWT Bearer Token

## 6. Database & Data Preparation
* Tạo 1 Event đang ở trạng thái `ONGOING`.
* Tạo 2 Team (Team A thuộc Track A, Team B thuộc Track B).
* Cấu hình thời gian Round sao cho `now() >= startTime && now() <= endTime`.
