# Test Summary Report

| Metric | Count |
| :--- | :--- |
| **Total Test Cases** | 45 |
| **Passed** | 43 |
| **Failed** | 2 |
| **Blocked** | 0 |
| **Not Run** | 0 |
| **Total Bugs Found** | 2 |

## Bug Breakdown
* **Critical:** 0
* **High:** 1 (Lỗi HTTP 400 khi nộp chuỗi rỗng vào field Optional)
* **Medium:** 1 (Lỗi Double Click nút Cancel Request)
* **Low:** 0

## Kết luận QA
Cấu trúc kiến trúc của Frontend sau khi Refactor đã đi đúng hướng và đáp ứng đầy đủ yêu cầu Business của hệ thống Backend mới.
Tuy nhiên, do phát hiện 1 lỗi High (Bug 02) có khả năng gây gián đoạn quy trình Nộp bài (Submission) của thí sinh và 1 lỗi UX (Bug 01), module **chưa thể** được kết luận là hoàn thiện hoàn toàn.
Cần Dev xử lý ngay 2 Bug trong danh sách để đạt tỷ lệ Pass 100%. Mất khoảng 5 phút để fix các lỗi này.
