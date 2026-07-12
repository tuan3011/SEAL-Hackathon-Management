# 3. State Transition Matrix

Ma trận kiểm soát luồng trạng thái của Mentorship Request.

## Sơ đồ chuyển đổi (State Machine)
| Current State | Action | Next State | Allowed Roles | Rule trong Source Code |
| :--- | :--- | :--- | :--- | :--- |
| N/A | `createRequest` | **OPEN** | Leader | Set cứng: `status(MentorshipRequestStatus.OPEN)` |
| **OPEN** | `acceptRequest` | **IN_PROGRESS** | Mentor, Judge | `if (request.getStatus() != OPEN) throw` |
| **OPEN** | `rejectRequest` | **REJECTED** | Mentor, Judge | `if (request.getStatus() != OPEN) throw` |
| **OPEN** | `cancelRequest` | **CANCELLED** | Leader, Admin | `if (request.getStatus() != OPEN) throw` |
| **IN_PROGRESS** | `resolveRequest` | **RESOLVED** | Assigned Mentor| `if (request.getStatus() != IN_PROGRESS) throw` |
| **IN_PROGRESS** | `releaseRequest` | **OPEN** | Assigned Mentor| `if (request.getStatus() != IN_PROGRESS) throw` |

## Lỗi / Rủi ro phát hiện
- **Race Condition tiềm ẩn ở `acceptRequest`:**
  - Logic check: `if (request.getStatus() != MentorshipRequestStatus.OPEN) throw`.
  - Mặc dù có gắn annotation `@Transactional`, nhưng hệ thống chưa triển khai cơ chế Locking (Pessimistic Write Lock hoặc `@Version` Optimistic Lock) tại Entity.
  - *Rủi ro:* Nếu 2 Mentor nhấn Accept cùng đúng 1 mili-giây, cả 2 luồng đều đọc status = OPEN và ghi đè lên nhau. Do Mentor thứ 2 ghi đè sau, Request sẽ bị tính cho Mentor thứ 2. Cần phải kiểm tra kĩ Entity.
