# 🦭 SEAL Hackathon Management System

> **A full-stack, comprehensive platform designed to organize, manage, and scale hackathon events seamlessly.**

SEAL Hackathon Management System handles everything from participant registration and team formation to mentor matchmaking, judge scoring, and dynamic round advancements. Built with modern web technologies, it provides a robust and scalable solution for hackathon organizers, participants, mentors, and judges.

---

## ✨ Key Features
- **🔐 Role-Based Access Control**: Secure login, routing, and specialized dashboards tailored for Admins, Organizers, Judges, Mentors, and Participants.
- **👥 Team Management & Invitations**: Seamlessly create teams, invite members, and manage team profiles and submissions.
- **🤝 Mentorship System**: Request mentors based on specific technical expertise and facilitate automatic or manual matching for guidance.
- **⚖️ Judge Assignment & Multi-Criteria Scoring**: Assign judges to specific tracks or teams, and evaluate projects across customizable scoring criteria.
- **🏆 Dynamic Leaderboard & Round Advancements**: Real-time tracking of scores, automatic rankings, and dynamic advancement of teams to subsequent hackathon rounds.
- **🔔 Real-Time Notifications & Emails**: Stay updated with Server-Sent Events (SSE) and integrated email alerts for important milestones, invitations, and announcements.

---

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

---

## ⚙️ Local Setup / Installation Instructions

### Prerequisites
- Java 17 (or higher)
- Node.js (v18+)
- MySQL Server

### 1. Database Setup
Start your MySQL server and create a database named `seal_hackathon`:
```sql
CREATE DATABASE seal_hackathon;
2. Backend Setup
Clone the repository and navigate to the backend directory:

bash


git clone https://github.com/tuan3011/SEAL-Hackathon-Management.git
cd SEAL-Hackathon-Management/backend
Note: Update src/main/resources/application.properties with your MySQL credentials, Google OAuth2 client credentials (replace MOCK_ID and MOCK_SECRET), and JWT secret before running.

Build and run the Spring Boot application using Maven:

bash


./mvnw spring-boot:run
The backend server will typically start on http://localhost:8080.

3. Frontend Setup
Open a new terminal and navigate to the frontend directory:

bash


cd SEAL-Hackathon-Management/frontend
Install the dependencies:

bash


npm install
Create a .env file in the frontend root and configure your backend API URL:

env


VITE_API_URL=http://localhost:8080/api
Start the Vite development server:

bash


npm run dev
The frontend will typically be accessible at http://localhost:5173.

📖 API Documentation
This project uses Swagger UI for comprehensive API documentation and manual endpoint testing.

Once the backend server is running, you can view and interact with the RESTful APIs by navigating to: http://localhost:8080/swagger-ui.html

🤝 Contributors
Contributions, issues, and feature requests are welcome!

Vo Thanh Tuan - Initial work & Core Development - tuan3011
Made with ❤️ by the SEAL Team.
