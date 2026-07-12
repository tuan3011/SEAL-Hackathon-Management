# MANUAL UI TEST CASES

Mục tiêu: Mô phỏng hành vi click của người dùng thật qua giao diện Frontend.

## ROLE: STUDENT (Not Leader)

| Test Case ID | UI Area | Pre-condition | Steps | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M-STU-01** | Submission Page | Đã tham gia nhóm | 1. Đăng nhập.<br>2. Vào trang Nộp Bài. | Không thấy form nộp bài, hoặc thấy thông báo "Chỉ Leader mới được nộp". | Không thể submit. |
| **M-STU-02** | Mentorship Page | Như trên | 1. Vào danh sách Mentorship.<br>2. Bấm nút Request. | Nút Request bị ẩn hoặc báo lỗi Forbidden. | UI không sập, báo đúng Toast. |

## ROLE: LEADER

| Test Case ID | UI Area | Pre-condition | Steps | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M-LEA-01** | Submission Form | Vòng thi đang Mở | 1. Nhập Github URL.<br>2. Bấm Submit.<br>3. Bấm Submit lần 2 (Double click). | Toast báo thành công. Button Submit hiện Loading. | Không bị nhân đôi Request, Version tăng đúng 1. |
| **M-LEA-02** | Submission Form | Vòng thi đang Mở | 1. Xóa rỗng ô Repository URL.<br>2. Bấm Submit. | Form báo lỗi đỏ "Repository URL is required". | UI chặn không gọi API, hoặc API trả 400 hiện Toast đỏ. |
| **M-LEA-03** | Submission Form | Vòng thi đã Đóng | 1. Vào trang Nộp Bài. | Hiện màn hình "Thời gian nộp bài đã kết thúc" hoặc API chặn lỗi. | Không thể Submit muộn. |

## ROLE: MENTOR

| Test Case ID | UI Area | Pre-condition | Steps | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M-MEN-01** | Open Requests | Mentor thuộc Track A | 1. Mở danh sách Request. | Chỉ nhìn thấy Request của các Team thuộc Track A. | Không có Team Track B. |
| **M-MEN-02** | Accept Action | Có 1 Request mở | 1. Bấm nút Accept. | UI hiện Loading -> Cập nhật thành In Progress -> Sang tab "My Mentorship". | Trạng thái đồng bộ. |
| **M-MEN-03** | Resolve Action| Có 1 Request In Progress | 1. Mở chi tiết.<br>2. Nhập câu trả lời.<br>3. Bấm Resolve. | Trạng thái chuyển thành Resolved. Leader nhận được Notification. | Data luân chuyển đúng flow. |
