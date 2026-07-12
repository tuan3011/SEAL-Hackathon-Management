# Bug Report

## BUG-01: Race Condition (Double Submit) khi Hủy Mentorship Request
* **Mức độ:** Medium
* **Mô tả:** Trong component `MyMentorshipRequestsPage.tsx`, hàm `handleCancelRequest` thiếu biến cờ `isSubmitting` để khóa (disable) nút bấm. Người dùng mạng yếu có thể vô tình bấm đúp vào nút Cancel, gây ra 2 lệnh API `DELETE` liên tiếp (lệnh thứ 2 sẽ trả về lỗi 404 hoặc 400).
* **Vị trí file:** `frontend/src/pages/participant/MyMentorshipRequestsPage.tsx`
* **Đề xuất xử lý:** Bổ sung state `[isCancelling, setIsCancelling] = useState(false)` và `disabled={isCancelling}` cho nút Cancel Request.

## BUG-02: Lỗi Validation ngầm định đối với Optional Fields (Submission)
* **Mức độ:** High
* **Mô tả:** Trong Java Backend, annotation `@Pattern` (Regex) coi `null` là hợp lệ đối với trường Optional (không bắt buộc). Tuy nhiên, nếu Frontend khởi tạo state bằng chuỗi rỗng `useState('')` và gửi lên Backend giá trị `""`, Regex Pattern sẽ cố gắng kiểm tra `""` thay vì bỏ qua, dẫn đến việc báo lỗi Validation từ Server (HTTP 400) mặc dù trường đó là Optional.
* **Vị trí file:** `frontend/src/pages/participant/SubmitProjectPage.tsx`
* **Đề xuất xử lý:** Trong hàm `handleSubmit`, trước khi gửi qua `api.post('/submissions', {...})`, cần làm sạch Payload:
```typescript
const payload = {
    teamId: myTeam.id,
    roundId: roundId,
    repositoryUrl,
    demoUrl: demoUrl.trim() === '' ? undefined : demoUrl,
    reportUrl: reportUrl.trim() === '' ? undefined : reportUrl
};
```
