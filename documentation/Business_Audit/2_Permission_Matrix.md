# 2. Permission Matrix (RBAC)

Ma trận phân quyền được chứng minh thông qua các annotation `@PreAuthorize` và check logic trong Service.

## Submission Module
| Action | Controller Rule | Service / Business Rule | Security Status |
| :--- | :--- | :--- | :--- |
| **Create/Update** | `hasRole('PARTICIPANT')` | User phải là Leader (`!teamMember.isLeader() -> throw`). Phải thuộc về đúng Team đó. | An toàn tuyệt đối |
| **Get By ID** | `isAuthenticated()` | Nếu là PARTICIPANT thì phải thuộc Team đó (`!isMember -> throw`). Role khác được xem tự do. | An toàn tuyệt đối |
| **Get By Team** | `isAuthenticated()` | Tương tự Get By ID. | An toàn tuyệt đối |
| **Get By Round** | `ADMIN, ORGANIZER, JUDGE, MENTOR` | `JUDGE` chỉ xem được nếu có bản ghi phân công (JudgeAssignment) tại Track tương ứng. | An toàn tuyệt đối |

## Mentorship Module
| Action | Controller Rule | Service / Business Rule | Security Status |
| :--- | :--- | :--- | :--- |
| **Create Request** | `hasRole('PARTICIPANT')` | Phải là Leader của Team. | An toàn tuyệt đối |
| **View Open** | `hasRole('MENTOR')` | Chỉ xem được Request thuộc Track mà Mentor đã được assign (`assignedTrackIds.contains`). | An toàn tuyệt đối |
| **Accept Request** | `hasRole('MENTOR')` | Chặn đứng `GUEST_JUDGE` (throw AccessDeniedException). | An toàn tuyệt đối |
| **Resolve/Release**| `hasRole('MENTOR')` (Release), `PARTICIPANT, MENTOR` (Resolve) | Phải chính xác là Mentor ĐANG GIỮ task đó (`request.getMentor().getId().equals...`). | An toàn tuyệt đối |
| **Cancel Request** | `PARTICIPANT, ADMIN, ORGANIZER` | Nếu là PARTICIPANT thì phải là Leader của Team tạo ra request đó. | An toàn tuyệt đối |
