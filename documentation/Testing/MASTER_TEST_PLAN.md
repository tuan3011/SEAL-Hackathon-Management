# MASTER TEST PLAN: Mentorship & Submission Module

## 1. Mục Tiêu (Objective)
Đảm bảo hai luồng nghiệp vụ cốt lõi (Submission và Mentorship Request) hoạt động chính xác tuyệt đối sau đợt vá lỗi Backend Phase 1 (Validation) và Phase 2 (Authorization). Đảm bảo tính toàn vẹn dữ liệu, không có Regression, và an toàn bảo mật.

## 2. Phạm Vi Kiểm Thử (Test Scope)
- **Module cần test:** `Submission`, `Mentorship Request`, `Notification`, `Hackathon Event`, `Round`, `Track`, `Team`.
- **Chức năng cần test:**
  - Submit Project (Tạo mới & Cập nhật).
  - Request Mentorship (Tạo mới).
  - Quản lý Request (Accept, Resolve, Release, Reject, Cancel).
- **Security cần test:** Track Authorization (Chống cướp việc), XSS (reportUrl), Null Bypass (repositoryUrl).
- **Business Flow:** Vòng đời của Submission và Mentorship từ lúc tạo đến lúc kết thúc/đánh giá.

## 3. Chiến Lược Kiểm Thử (Test Strategy)

### 3.1. Smoke Test
- **Mục tiêu:** Kiểm tra nhanh hệ thống có "sống" và các API cơ bản (Login, List Submission, List Request) có trả về HTTP 200 không.
- **Vì sao phải test:** Chặn quá trình test chi tiết nếu hệ thống đã sập ngay từ cổng.

### 3.2. Sanity Test
- **Mục tiêu:** Kiểm tra sâu vào chức năng vừa được vá (Validation URL, Track Authorization).
- **Vì sao phải test:** Xác nhận bản vá đã hoạt động trước khi làm Regression.

### 3.3. API Test
- **Mục tiêu:** Gửi HTTP Request trực tiếp qua Postman/Swagger, bỏ qua Frontend. Kiểm tra các ranh giới Payload, Type, và HTTP Status.
- **Vì sao phải test:** Phát hiện lỗi sâu ở Controller/DTO mà Frontend đã lỡ cho qua.

### 3.4. Validation & Boundary Test
- **Mục tiêu:** Ép dữ liệu vượt quá giới hạn (Title > 255 ký tự, Description > 2000 ký tự, URL rỗng).
- **Vì sao phải test:** Bảo vệ Database không bị Crash (HTTP 500).

### 3.5. Business Flow & Manual UI Test
- **Mục tiêu:** Đóng vai từng Role (Leader, Mentor) thực hiện click trên UI từ đầu đến cuối luồng.
- **Vì sao phải test:** Đảm bảo trải nghiệm người dùng cuối không bị đứt gãy do bản vá Backend.

### 3.6. Security & Permission Test
- **Mục tiêu:** Tấn công vào lỗ hổng IDOR, XSS, Role bypass.
- **Vì sao phải test:** Ngăn chặn Hacker thao túng dữ liệu hệ thống.

### 3.7. Regression Test
- **Mục tiêu:** Chạy lại toàn bộ bộ Test Case cũ.
- **Vì sao phải test:** Đảm bảo bản vá mới không phá vỡ tính năng đang chạy tốt.

### 3.8. Database Verification
- **Mục tiêu:** Dùng SQL Query kiểm tra dữ liệu thực tế sau khi API trả về 200.
- **Vì sao phải test:** Tránh trường hợp API báo thành công nhưng Database ghi nhầm/thiếu dữ liệu (Data Integrity).

## 4. Test Environment
- **Môi trường:** Staging / QA Environment.
- **Công cụ:** Postman (API), Chrome/Firefox (UI), MySQL Workbench (Database), JWT Token Generator.
