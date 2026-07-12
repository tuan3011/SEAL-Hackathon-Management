# Regression Test Report

## Phạm vi bị ảnh hưởng (Impact Scope)
* Dashboard Module (Nơi xem thống kê).
* Notification Module.

## Test Results
1. **Sidebar Navigation:** Vẫn highlight đúng tab khi truy cập các URL hiện tại. PASS.
2. **Dashboard Counters:** Thống kê của Leader vẫn phản ánh đúng số liệu mới nhất khi có Request chuyển sang `CANCELLED`. PASS.
3. **TypeScript Build:** `npm run build` PASS, chứng tỏ không có Component nào trên hệ thống bị gãy do thay đổi Type của DTO.
4. **Notification:** Batch Notification mới của Backend hoạt động đúng. Sinh viên nhận được Email khi Mentor Resolve. PASS.
