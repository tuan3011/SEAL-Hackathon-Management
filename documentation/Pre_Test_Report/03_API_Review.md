# 03. API Review

## API Mapping (Mentorship & Submission)

| Action | Endpoint | Method | Payload | Xử lý Loading | Xử lý Lỗi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Create Request** | `/mentorship-requests` | `POST` | `teamId, title, description` | Có (`submitting`) | `toast.error` + error text |
| **Cancel Request** | `/mentorship-requests/{id}` | `DELETE`| N/A | Có (`isCancelling`) | `toast.error` + catch |
| **Accept Request** | `/mentorship-requests/{id}/accept` | `PATCH` | N/A | Có (`acceptingId`) | `toast.error` + catch |
| **Decline Request**| `/mentorship-requests/{id}/reject` | `PATCH` | `reason` | Có (`isSubmitting`) | `toast.error` + catch |
| **Resolve Request**| `/mentorship-requests/{id}/resolve`| `PATCH` | `answer` | Có (`isSubmitting`) | `toast.error` + catch |
| **Release Request**| `/mentorship-requests/{id}/release`| `PATCH` | N/A | Có (`isSubmitting`) | `toast.error` + catch |
| **Submit Project** | `/submissions` | `POST` | `teamId, roundId, repositoryUrl...`| Có (`submitting`) | Báo lỗi trực tiếp trên Form |
| **Update Profile** | `/profile/me` | `PUT` | `fullName, schoolName...` | Có (`saving`) | `toast.error` |

## Đánh giá
1. **Endpoint & Method:** Khớp hoàn toàn với Restful API Guidelines của Backend.
2. **Payload:** Các biến Optional được gửi dưới dạng `undefined` (không xuất hiện trong chuỗi JSON cuối cùng), giải quyết triệt để lỗi Regex từ Backend.
3. **Double Click Protection:** Mọi thao tác Mutation (POST, PUT, PATCH, DELETE) đều đã được gắn Loading State và Disabled Attributes để ngăn User click 2 lần.
4. **Retry:** Tạm thời chưa triển khai Auto-Retry (không nằm trong Scope của dự án này).
5. **Toast:** Hoạt động đúng với React Hot Toast, bao gồm cả luồng Success (200, 204) và Catch (400, 403, 500).
