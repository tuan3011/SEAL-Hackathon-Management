# 05. Regression Risk Analysis

## Đánh giá Mức độ Rủi ro
*Mức độ rủi ro chung của đợt sửa code vừa qua được đánh giá là: **LOW (Rất thấp)***.

## Phân tích Từng Module

1. **Authentication / Authorization (Low Risk)**
   - Không có bất kỳ thay đổi nào liên quan đến Token, Guards, Login hay Routing logic. Hệ thống phân quyền vẫn được giữ nguyên vẹn.

2. **Dashboard & Sidebar Navigation (Low Risk)**
   - API lấy danh sách Requests và Submission vẫn trả về cấu trúc DTO không thay đổi. Sidebar hoạt động dựa trên role, không bị can thiệp.

3. **Notification System (Low Risk)**
   - Việc `console.log` trong Notification Component là "rác" để lại từ luồng phát triển cũ nhưng **không** gây sập ứng dụng (Crash). Rủi ro duy nhất là làm rác bộ đệm Console của Browser.
   
4. **Mentorship Request Module (Low Risk)**
   - Thay đổi chủ yếu là thêm state `try/finally` và `isCancelling` / `acceptingId`. Đây là các Local State của React, chúng bị hủy (unmount) khi User rời khỏi trang. Không có rủi ro tràn bộ nhớ (Memory Leak) hoặc Global State Corruption.

5. **Submission & Profile (Low Risk)**
   - Việc thay đổi chuỗi `""` thành `undefined` là sự điều chỉnh về phía Payload JSON (Data Transfer). Không tác động đến UI hay các component anh em. Việc này giảm thiểu rủi ro Regression với Backend (Backend sẽ không bị Exception nữa).
