# SECURITY TEST CASES

Thiết kế mô phỏng các đợt tấn công từ nội bộ (Malicious User).

## 1. Stored XSS (Cross-Site Scripting)
- **Attack Method:** Bắn payload XSS qua trường `reportUrl`.
- **Steps:**
  1. Đăng nhập tài khoản Leader.
  2. Mở Postman, copy JWT Token.
  3. POST `/submissions` với body: `"reportUrl": "javascript:alert(document.cookie)"`
- **Expected Result:** API trả về `400 Bad Request` ("Invalid report URL format"). Payload bị từ chối thẳng thừng.
- **Risk (Nếu fail):** Kẻ gian chèn script. Khi Giám khảo (JUDGE) bấm vào nút "Xem Report" trên UI, Script kích hoạt đánh cắp Cookie Giám khảo.

## 2. IDOR / Business Logic Bypass (Track Authorization)
- **Attack Method:** Thao túng tham số trên URL API.
- **Steps:**
  1. Lấy ID của một Request thuộc nhóm Track SE (Giả sử ID = 100).
  2. Đăng nhập tài khoản Mentor chuyên môn AI (Không có quyền SE).
  3. Mở Postman, PATCH `/mentorship-requests/100/accept`.
- **Expected Result:** API trả về `403 Forbidden` ("You are not assigned to the track...").
- **Risk (Nếu fail):** Thí sinh bị tư vấn sai chuyên môn, gây phẫn nộ, hệ thống phân công chuyên môn phá sản.

## 3. Data Truncation / Boundary Overflow (String Attack)
- **Attack Method:** Gây tắc nghẽn Database bằng chuỗi cực lớn.
- **Steps:**
  1. POST `/mentorship-requests` với trường `title` dài 10,000 ký tự.
- **Expected Result:** API trả về `400 Bad Request` ngay tại Controller. Database không cần chạy truy vấn. Không có Log `SQLException` 500.
- **Risk (Nếu fail):** Máy chủ CSDL sập vì quá tải Log File.

## 4. Race Condition (Double Accept)
- **Attack Method:** Gọi API đồng thời.
- **Steps:**
  1. Dùng Tool bắn 100 request PATCH `/mentorship-requests/100/accept` cùng một millisecond bằng 2 Token của 2 Mentor khác nhau.
- **Expected Result:** Chỉ có 1 Request thành công (HTTP 200). 99 Request còn lại phải trả về HTTP 409 Conflict. Cột `version` trong DB tăng 1 lần duy nhất.
- **Risk (Nếu fail):** 2 Mentor cùng phụ trách 1 nhóm, hệ thống bị gãy trạng thái (Broken State).
