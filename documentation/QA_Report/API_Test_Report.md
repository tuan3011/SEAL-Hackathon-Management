# API Test Report

## 1. POST /mentorship-requests
* **Permission:** PARTICIPANT
* **Expected:** Tạo thành công (201). Trạng thái OPEN.
* **Validation Test:** Gửi Title rỗng -> FAIL (400).
* **Unauthorized:** Gửi không Token -> FAIL (401).

## 2. DELETE /mentorship-requests/{id} (Cancel)
* **Permission:** PARTICIPANT (Chủ request)
* **Expected:** Xóa thành công (204).
* **State Transition:** Chỉ được xóa khi OPEN. Xóa khi IN_PROGRESS -> FAIL (400).
* **Forbidden:** Leader team khác xóa -> FAIL (403).

## 3. PATCH /mentorship-requests/{id}/accept
* **Permission:** MENTOR
* **Expected:** Chuyển sang IN_PROGRESS (200).
* **Concurrent Request:** 2 Mentor cùng Accept 1 lúc -> 1 PASS (200), 1 FAIL (400 Conflict/Already Assigned).

## 4. PATCH /mentorship-requests/{id}/release
* **Permission:** MENTOR (Người đang nhận)
* **Expected:** Trả về OPEN, Mentor null (200).
* **Forbidden:** Mentor khác gọi Release -> FAIL (403).

## 5. POST /submissions
* **Permission:** PARTICIPANT (Leader)
* **Expected:** Tạo Submission thành công (201).
* **Boundary Value:** URL dài hơn 256 ký tự -> FAIL (400).
* **Invalid Value:** `repositoryUrl = "htt://github"` -> FAIL (400) do Regex chặn.
* **Empty Value (Optional):** `demoUrl = ""` -> Nếu Backend dùng `@Pattern`, có thể bắn 400. Đây là 1 rủi ro.
