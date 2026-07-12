# 06. Pre-Test Checklist

Dưới đây là danh sách kiểm tra (Checklist) tĩnh trước khi chuyển sang chạy Test API và Manual thực tế.

- [x] Build Success (`npm run build` không lỗi)
- [x] Type Check Success (Không có lỗi ép kiểu, TypeScript compiler pass)
- [x] No Dead Import (Không có import bị mờ)
- [x] No Dead Component (Các Modal, Form đều được gọi)
- [ ] No Console.log (**CẢNH BÁO:** Còn tồn đọng trong `NotificationBell.tsx` và `NotificationsPage.tsx` - Sẽ được bỏ qua hoặc xóa trong tương lai, nhưng không cản trở Testing).
- [x] No Debugger
- [x] No TODO / FIXME (Trong phạm vi Mentorship & Submission)
- [x] API Mapping Verified (Các Endpoint `/accept`, `/resolve`, v.v... đúng với spec)
- [x] DTO Verified
- [x] Validation Verified
- [x] Permission Verified (Phân chia role rành mạch giữa Leader và Mentor)
- [x] Business Flow Verified (Quy trình Open -> In Progress -> Resolved -> Submitted)
- [x] UI Consistency Verified
- [x] Loading State Verified (Đã bổ sung toàn diện)
- [x] Error Handling Verified (`toast.error` kèm bắt lỗi Axios Response)
- [x] Optional Field Handling Verified (`trim() || undefined` Pattern)
- [x] Double Click Protection Verified
- [x] **Ready For Manual Test**
