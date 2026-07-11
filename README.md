# 🦭 SEAL Hackathon Management System
> **A full-stack, comprehensive platform designed to organize, manage, and scale hackathon events seamlessly.**
SEAL Hackathon Management System handles everything from participant registration and team formation to mentor matchmaking, judge scoring, and dynamic round advancements. Built with modern web technologies, it provides a robust and scalable solution for hackathon organizers, participants, mentors, and judges.
***
## ✨ Key Features
- **🔐 Role-Based Access Control**: Secure login, routing, and specialized dashboards tailored for Admins, Organizers, Judges, Mentors, and Participants.
- **👥 Team Management & Invitations**: Seamlessly create teams, invite members, and manage team profiles and submissions.
- **🤝 Mentorship System**: Request mentors based on specific technical expertise and facilitate automatic or manual matching for guidance.
- **⚖️ Judge Assignment & Multi-Criteria Scoring**: Assign judges to specific tracks or teams, and evaluate projects across customizable scoring criteria.
- **🏆 Dynamic Leaderboard & Round Advancements**: Real-time tracking of scores, automatic rankings, and dynamic advancement of teams to subsequent hackathon rounds.
- **🔔 Real-Time Notifications & Emails**: Stay updated with Server-Sent Events (SSE) and integrated email alerts for important milestones, invitations, and announcements.
***
## 🧩 Business Flows (Backend Architecture)
### 1. Core System & Account Management (Foundation)
**Assigned to:** Nguyễn Quang Huy
**Modules:** `auth`, `user`, `profile`, `audit_log`, `notification`, `debug`
This flow serves as the backbone of the system. It handles user identity and provides shared services (notifications, logging).
```mermaid
flowchart TD
    Guest([New User]) --> Register["Account Registration (auth)"]
    Register --> AdminApprove["Admin Approval"]
    Login --> UpdateProfile["Update Profile (profile)"]
    Admin --> RoleAssign{"Role Assignment (user)"}
    
    %% Admin creates accounts for other roles
    
    %% Background Services
    SystemService((Shared Services)) -.-> SendNotif["Send Email/App Notification"]
    SystemService -.-> WriteLog["Record Audit Log"]
```
### 2. Event Initialization & Management
**Assigned to:** Nguyễn Khôi Nguyên
**Modules:** `hackathon_event`, `track`, `round`, `criterion`, `prize`
This flow is designed for Admins/Organizers to configure the "rules" and event structure before opening registration to participants.
```mermaid
flowchart TD
    Admin --> CreateEvent["Create New Hackathon Event"]
    AdminOrg["Admin/Organizer"] --> ConfigTracks["Configure Tracks"]
    ConfigTracks --> ConfigRounds["Configure Rounds"]
    ConfigRounds --> SetCriteria["Set Scoring Criteria"]
    SetCriteria --> SetPrizes["Set Prizes"]
    
    SetPrizes --> OpenRegistration([Open Event Registration])
```
### 3. Registration & Team Formation (Participants)
**Assigned to:** Nguyễn Lê Anh Tú
**Modules:** `event_registration`, `team`, `team_invitation`, `team_member`
This flow outlines the participant's journey from event registration to finding teammates and finalizing the team roster.
```mermaid
flowchart TD
    Participant([Participant]) --> RegisterEvent["Register for Event"]
    
    RegisterEvent --> CreateTeam["Create Team"]
    CreateTeam --> SendInvite["Send Team Invitation"]
    
    OtherParticipant([Other Participant]) --> ViewInvite["View Invitation"]
    ViewInvite --> AcceptInvite{"Accept?"}
    
    AcceptInvite -->|Yes| JoinTeam["Join as Team Member"]
    AcceptInvite -->|No| RejectInvite["Reject"]
    
    JoinTeam --> InternalManage["Leader Management: Kick/Transfer Role"]
    InternalManage --> TeamReady([Team Ready])
```
### 4. Competition & Mentorship (Hackathon Execution)
**Assigned to:** Võ Thanh Tuấn
**Modules:** `submission`, `mentorship_request`
This flow occurs in real-time during the event. Teams develop their projects, request mentor assistance when stuck, and submit their final work.
```mermaid
flowchart TD
    TeamReady([Team Coding]) --> GotBug{"Need Help?"}
    
    GotBug -->|Yes| CreateReq["Create Mentorship Request"]
    CreateReq --> MentorPool[(Request Pool)]
    
    Mentor([Mentor]) --> AcceptReq["Accept Request"]
    AcceptReq --> ResolveReq["Resolve Issue"]
    ResolveReq --> FinishCoding
    
    GotBug -->|No| FinishCoding["Finalize Project"]
    
    FinishCoding --> SubmitProject["Submit Project (Submission)"]
    SubmitProject --> WaitJudging([Wait for Judging])
```
### 5. Judging, Ranking & Reporting
**Assigned to:** Trương Ngọc Bảo
**Modules:** `judge_assignment`, `score`, `ranking`, `dashboard`, `export`
The final flow to conclude the hackathon. It covers the evaluation of submissions, announcing results, and generating reports.
```mermaid
flowchart TD
    Organizer([Organizer]) --> AssignJudge["Assign Judges"]
    AssignJudge --> JudgeEvaluate
    
    Judge([Judge]) --> ViewSubmission["View Team Submissions"]
    ViewSubmission --> JudgeEvaluate["Score based on Criteria"]
    
    JudgeEvaluate --> CalcRanking["Calculate Rankings"]
    %% Automatically advances rounds
    CalcRanking --> GivePrize["Award Prizes"]
    
    GivePrize --> Dashboard["View Overall Dashboard"]
    Dashboard --> ExportData["Export Excel/CSV Reports"]
    ExportData --> EndHackathon([End Hackathon Event])
```
***
## 🛠️ Tech Stack
### Backend
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring_boot-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![Spring Security](https://img.shields.io/badge/spring_security-%236DB33F.svg?style=for-the-badge&logo=springsecurity&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Hibernate](https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=Hibernate&logoColor=white)
### Frontend
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
### Database
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
***
## ⚙️ Local Setup / Installation Instructions
### Prerequisites
- Java 17 (or higher)
- Node.js (v18+)
- MySQL Server
### 1. Database Setup
Start your MySQL server and create a database named `seal_hackathon`:
```sql
CREATE DATABASE seal_hackathon;
```
### 2. Backend Setup
Clone the repository and navigate to the backend directory:
```bash
git clone https://github.com/tuan3011/SEAL-Hackathon-Management.git
cd SEAL-Hackathon-Management/backend
```
*Note: Update `src/main/resources/application.properties` with your MySQL credentials, Google OAuth2 client credentials (replace `MOCK_ID` and `MOCK_SECRET`), and JWT secret before running.*
Build and run the Spring Boot application using Maven:
```bash
./mvnw spring-boot:run
```
*The backend server will typically start on `http://localhost:8080`.*
### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd SEAL-Hackathon-Management/frontend
```
Install the dependencies:
```bash
npm install
```
Create a `.env` file in the frontend root and configure your backend API URL:
```env
VITE_API_URL=http://localhost:8080/api
```
Start the Vite development server:
```bash
npm run dev
```
*The frontend will typically be accessible at `http://localhost:5173`.*
***
## 📖 API Documentation
This project uses **Swagger UI** for comprehensive API documentation and manual endpoint testing.
Once the backend server is running, you can view and interact with the RESTful APIs by navigating to:
**[`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html)**
***
## 🤝 Contributors
Contributions, issues, and feature requests are welcome!
- **Võ Thanh Tuấn** - *Competition & Mentorship Flow* - [tuan3011](https://github.com/tuan3011)
- **Nguyễn Khôi Nguyên** - *Event Initialization & Management Flow* - [NguyenNK27](https://github.com/NguyenNK27)
- **Nguyễn Lê Anh Tú** - *Registration & Team Formation Flow* - [nguyentu-2505](https://github.com/nguyentu-2505)
- **Nguyễn Quang Huy** - *Core System & Account Management Flow* - [qh-uy](https://github.com/qh-uy)
- **Trương Ngọc Bảo** - *Judging, Ranking & Reporting Flow* - [BaoTNSE203313](https://github.com/BaoTNSE203313)
***
*Made with ❤️ by the SEAL Team.*
