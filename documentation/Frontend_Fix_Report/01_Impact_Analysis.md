# Phase 0: Impact Analysis

Sau khi quét toàn bộ Frontend Source Code, dưới đây là bảng phân tích chi tiết mức độ ảnh hưởng của các API Actions và các Form gửi dữ liệu (Optional Fields):

| File | Function | API được gọi | Có Loading/Disabled không? | Double Click Risk | Gửi Optional Field sai ("") |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SubmitProjectPage.tsx` | `handleSubmit` | `api.post('/submissions')` | Có (`submitting`) | Không | **Có** (`demoUrl`, `reportUrl`) |
| `MentorshipRequestForm.tsx` | `handleSubmit` | `createRequest` | Có (`submitting`) | Không | **Có** (`description`) |
| `MyMentorshipRequestsPage.tsx` | `handleCancelRequest`| `cancelRequest` | **KHÔNG** | **CÓ** | Không |
| `MentorRequestsPage.tsx` | `handleAccept` | `acceptRequest` | **KHÔNG** | **CÓ** | Không |
| `MentorRequestsPage.tsx` | `handleDeclineSubmit`| `rejectRequest` | Có (`isSubmitting`) | Không | Không |
| `MentorDashboardPage.tsx` | `handleSendAnswer` | `resolveRequest` | Có (`isSubmitting`) | Không | Không |
| `MentorDashboardPage.tsx` | `handleReleaseRequest`| `releaseRequest`| Có (`isSubmitting`) | Không | Không |
| `ProfilePage.tsx` | `handleSubmit` | `api.put('/profile/me')`| Có (`saving`) | Không | **Có** (`githubUrl`) |

## Phân tích (Root Cause) & Lỗi Phát Sinh Mới
Ngoài 2 lỗi đã được QA báo cáo, tôi đã rà soát và phát hiện thêm **2 lỗi mới** tiềm ẩn:
1. **Lỗi Double Click ở tính năng Accept Request (`MentorRequestsPage.tsx`)**:
   - Tương tự như Cancel, hàm `handleAccept` hoàn toàn không có cơ chế `isSubmitting` để disable các nút trong danh sách. Nếu Mentor bấm liên tục, Frontend sẽ gửi nhiều PATCH request lên Server.
2. **Lỗi Optional Field ngầm định ở Profile (`ProfilePage.tsx`)**:
   - Field `githubUrl` có cơ chế Validation URL ở Backend. Nếu User truyền chuỗi rỗng `""` thay vì để `undefined` hoặc `null`, Backend sẽ ném lỗi 400 Bad Request làm gián đoạn quá trình Cập nhật Profile. (Tương tự lỗi Submit Project).

## Đề xuất Solution chung
- **Standardize API Actions:** Khai báo thống nhất các state `isSubmitting`, `isCancelling`, `isAccepting` ở các trang còn thiếu. Dùng thuộc tính `disabled` cho tất cả các loại Button gọi API. Đảm bảo sử dụng `try/catch/finally` trong mọi Action.
- **Standardize Optional Fields:** Tại tất cả các Payload có Optional, áp dụng pattern: `fieldName: fieldName.trim() === '' ? undefined : fieldName`. Backend mặc định cấu hình ngầm định bỏ qua validate `@Pattern` nếu giá trị payload là missing/undefined (Do Jackson Map).

Do đã phát hiện thêm 2 lỗi mới ngoài phạm vi báo cáo ban đầu, theo đúng nguyên tắc làm việc:
**Tôi sẽ KHÔNG TỰ Ý SỬA CODE và DỪNG LẠI TẠI ĐÂY.**

Vui lòng duyệt Kế hoạch Analysis này. Nếu bạn chấp thuận mở rộng phạm vi fix cho cả `MentorRequestsPage` và `ProfilePage`, hãy cấp lệnh: **PROCEED PHASE 1**.
