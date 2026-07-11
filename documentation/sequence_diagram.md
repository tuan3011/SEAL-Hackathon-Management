
```mermaid
sequenceDiagram
    participant Participant
    participant Frontend
    participant Backend
    participant Database

    Participant->>Frontend: Clicks 'Submit Project'
    Frontend->>Backend: POST /api/submissions
    Backend->>Database: INSERT INTO submission
    Database-->>Backend: Submission ID
    Backend-->>Frontend: { success: true, submissionId: '...' }
    Frontend-->>Participant: Shows 'Submission Successful'
```
