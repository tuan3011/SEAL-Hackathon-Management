# Manual Test Report

## MENTORSHIP MODULE

### TC-01: Leader Cancel Request
* **Precondition:** Có 1 request đang OPEN.
* **Steps:** Vào trang My Requests -> Bấm View Details -> Bấm Cancel Request -> Bấm OK trên popup.
* **Expected:** Request biến mất, hiện Toast Success, đếm số Cancelled tăng lên.
* **Result:** PASS.

### TC-02: Mentor Release Request
* **Precondition:** Mentor đang nhận 1 request (IN_PROGRESS).
* **Steps:** Vào Mentor Dashboard -> Bấm Reply -> Bấm Release Task -> Confirm.
* **Expected:** Task biến mất khỏi Dashboard, Toast Success.
* **Result:** PASS.

## SUBMISSION MODULE

### TC-03: Create Submission Validation
* **Precondition:** Vòng thi đang mở.
* **Steps:** Vào Submit Project -> Nhập `repositoryUrl` là "abc" -> Bấm ngoài (Blur).
* **Expected:** Form báo lỗi chữ đỏ: "Please enter a valid URL...". Không cho bấm nút Submit.
* **Result:** PASS.

### TC-04: Submit with Empty Optional Fields
* **Precondition:** Vòng thi mở.
* **Steps:** Nhập đúng `repositoryUrl`, bỏ trống `demoUrl` và `reportUrl` -> Bấm Submit.
* **Expected:** Thành công chuyển về Dashboard.
* **Result:** TBD (Có nguy cơ FAIL do API 400 nếu gửi chuỗi rỗng `""` thay vì undefined).
