# TEST ACCOUNTS MATRIX

Để phục vụ cho quá trình đăng nhập và test UI/API, hệ thống đã được sinh sẵn bộ Account sau. Tất cả account này đều chia sẻ chung một mật khẩu.

**Mật khẩu chung:** `password123`

## 1. System Administration
| Username | Role | Mô tả |
| :--- | :--- | :--- |
| `admin` | ADMIN | Super user có sẵn của hệ thống. |
| `org1`, `org2` | ORGANIZER | Người điều hành Hackathon. |

## 2. Judging & Review
| Username | Role | Mô tả |
| :--- | :--- | :--- |
| `judge1`, `judge2` | JUDGE | Giám khảo nội bộ. |
| `guest_judge1` | GUEST_JUDGE | Giám khảo khách mời (Quyền hạn bị giới hạn). |

## 3. Mentoring (Được gán cố định theo Track)
| Username | Role | Track Phụ Trách | Mục đích Test |
| :--- | :--- | :--- | :--- |
| `mentor_se1`, `mentor_se2` | MENTOR | Software Engineering | Dùng để test lấy Request của SE |
| `mentor_ai1`, `mentor_ai2` | MENTOR | Artificial Intelligence | Dùng để test cướp Request chéo (Bug Authorization) |
| `mentor_iot1`, `mentor_iot2`| MENTOR | Internet of Things | Dùng để test luồng Resolve, Release bình thường |

## 4. Student & Teams
| Username | Role | Nhóm (Team) | Trạng Thái Nhóm | Mục đích Test |
| :--- | :--- | :--- | :--- | :--- |
| `leader_team1` | PARTICIPANT | Team SE Alpha | Hợp lệ | Test Create Submission / Create Mentorship |
| `leader_team4` | PARTICIPANT | Team SE Delta | DISQUALIFIED | Test hệ thống có chặn nộp bài khi bị loại không |
| `member_team1` | PARTICIPANT | Team SE Alpha | Hợp lệ | Đăng nhập để test chặn nộp bài (vì không phải Leader) |
| `leader_team5` | PARTICIPANT | Team AI Omega | Hợp lệ | Đã có Mentorship `IN_PROGRESS`, dùng để test Resolve. |
