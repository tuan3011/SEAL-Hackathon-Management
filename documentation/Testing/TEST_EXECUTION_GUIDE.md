# TEST EXECUTION GUIDE (Thứ tự kiểm thử tối ưu)

Để đảm bảo hiệu suất phát hiện Bug và tránh cản trở tiến độ, QA Team phải thực hiện quy trình kiểm thử theo đúng trình tự sau:

## 1. SMOKE TEST
- **Lý do thực hiện đầu tiên:** Nếu hệ thống không khởi động được, API sập lỗi 500 diện rộng, thì không có lý do gì để test tiếp.
- **Thực hiện:** Truy cập trang chủ, Login, List Submission. Đảm bảo HTTP 200.

## 2. API TEST & SECURITY TEST (Bắt buộc chạy Postman trước)
- **Lý do:** Bản vá Phase 1 và Phase 2 tập trung vào Backend API. Dùng Postman sẽ mô phỏng được hành vi của Hacker (Bypass Validation, IDOR).
- **Thực hiện:** Chạy các Payload lỗi như null, rỗng, XSS, sai Track ID.

## 3. DATABASE VERIFICATION (Đi kèm API Test)
- **Lý do:** Kẹp chung với lúc chạy Postman. Bắn 1 request -> Quét 1 lệnh SQL. Đảm bảo Backend thực sự xử lý đúng ranh giới Database.

## 4. VALIDATION & UI TEST (Manual UI)
- **Lý do:** Sau khi API cứng cáp, bắt đầu test mặt tiền (Frontend).
- **Thực hiện:** Đóng vai Leader, bấm nút Submit, nhập sai Format. Chờ xem Toast đỏ có mọc lên đúng văn bản "Invalid repository URL format" không.

## 5. BUSINESS FLOW TEST (Luồng End-to-End)
- **Lý do:** Khi từng khối (API, UI) đã đúng, ráp thành đường ống (Flow).
- **Thực hiện:** Leader tạo Request -> Mentor Accept -> Mentor Resolve -> Leader nhận Notify. Không đứt quãng.

## 6. REGRESSION TEST
- **Lý do:** Đảm bảo không phá hỏng đồ cũ.
- **Thực hiện:** Chạy Checklist Regression. Mở lại các tính năng không láng giềng.

## 7. FINAL REVIEW & SIGN-OFF
- Lập Báo cáo xuất ra Template. QA Lead ký xác nhận (Sign-off) Go/No-Go Release.
