# DATABASE RELATIONSHIP DIAGRAM (Sơ Đồ Luồng Hoàn Chỉnh)

Sơ đồ mô phỏng kiến trúc tổng quát của Hackathon System bao gồm cả Chấm điểm (Scoring), Giải thưởng (Prize) và Giao việc Giám khảo (Judge Assignment).

```mermaid
erDiagram
    HACKATHON_EVENT ||--o{ ROUND : "has"
    HACKATHON_EVENT ||--o{ TRACK : "has"
    HACKATHON_EVENT ||--o{ PRIZE : "offers"
    HACKATHON_EVENT ||--o{ CRITERION : "defines"
    HACKATHON_EVENT ||--o{ TEAM : "contains"
    
    TRACK ||--o{ TEAM : "categorizes"
    TRACK ||--o{ TRACK_MENTOR : "assigns"
    USER ||--o{ TRACK_MENTOR : "assigned as mentor"
    
    TEAM ||--o{ TEAM_MEMBER : "has"
    USER ||--o{ TEAM_MEMBER : "is part of"
    TEAM ||--o{ PRIZE : "wins"
    
    TEAM ||--o{ SUBMISSION : "makes"
    ROUND ||--o{ SUBMISSION : "receives"
    
    ROUND ||--o{ JUDGE_ASSIGNMENT : "assigned in"
    USER ||--o{ JUDGE_ASSIGNMENT : "is judge"
    TRACK ||--o{ JUDGE_ASSIGNMENT : "limits scope"
    
    SUBMISSION ||--o{ SCORE : "graded by"
    CRITERION ||--o{ SCORE : "evaluated on"
    USER ||--o{ SCORE : "graded by judge"
    
    TEAM ||--o{ MENTORSHIP_REQUEST : "requests"
    USER ||--o{ MENTORSHIP_REQUEST : "accepts (Mentor)"
    
    USER ||--o{ NOTIFICATION : "receives"
```

## Chú giải Business Flow (Toàn vẹn Dữ liệu)
1. **Scoring Flow:** Một `Score` bắt buộc phải khóa với `Submission` của thí sinh, `Criterion` do Ban Tổ Chức quy định, và `User` mang Role `JUDGE`. Giám khảo chỉ được chấm bài nếu họ có bản ghi trong bảng `JudgeAssignment`.
2. **Mentorship Flow:** Mentor phụ thuộc qua bảng `TrackMentor`.
3. **Prize/Ranking:** Được trao cho `Team` dựa trên tổng điểm (`Score` * `Criterion.weight`). Bảng `Prize` liên kết trực tiếp với Team chiến thắng.
