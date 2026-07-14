import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SupportTicketsPage from './pages/SupportTicketsPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CertificatesPage from './pages/CertificatesPage';
import NotificationsPage from './pages/NotificationsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import AdminMentorProfilePage from './pages/admin/AdminMentorProfilePage';
import SystemPreferencesPage from './pages/admin/SystemPreferencesPage';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import EventListPage from './pages/EventListPage';
import LandingPage from './pages/LandingPage';
import EventDetailPage from './pages/EventDetailPage';
import PublicLeaderboardPage from './pages/PublicLeaderboardPage';
// Participant Pages
import MyTeamPage from './pages/participant/MyTeamPage';
import CreateTeamPage from './pages/participant/CreateTeamPage';
import InvitationsPage from './pages/participant/InvitationsPage';
import SubmitProjectPage from './pages/participant/SubmitProjectPage';
import MyMentorshipRequestsPage from './pages/participant/MyMentorshipRequestsPage';
// Judge Pages
import JudgeDashboardPage from './pages/judge/JudgeDashboardPage';
import AssignmentSubmissionsPage from './pages/judge/AssignmentSubmissionsPage';
import ScoringPage from './pages/judge/ScoringPage';
// Mentor Pages
import MentorDashboardPage from './pages/mentor/MentorDashboardPage';
import MentorRequestsPage from './pages/mentor/MentorRequestsPage';
// Admin Pages
import AdminPendingApprovalsPage from './pages/admin/AdminPendingApprovalsPage';
// Organizer Pages
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import EventDashboardPage from './pages/organizer/EventDashboardPage';
import SubmissionsTab from './pages/organizer/tabs/SubmissionsTab';
import JudgesTab from './pages/organizer/tabs/JudgesTab';
import RankingTab from './pages/organizer/tabs/RankingTab';
import TeamsTab from './pages/organizer/tabs/TeamsTab';
import RoundsTab from './pages/organizer/tabs/RoundsTab';
import CriteriaTab from './pages/organizer/tabs/CriteriaTab';
import TracksTab from './pages/organizer/tabs/TracksTab';
import PrizesTab from './pages/organizer/tabs/PrizesTab';
import AnalyticsTab from './pages/organizer/tabs/AnalyticsTab';
import ActivityLogTab from './pages/organizer/tabs/ActivityLogTab';
// Generic Pages
import TeamsPage from './pages/TeamsPage';
import RoundsPage from './pages/RoundsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import UsersPage from './pages/UsersPage';
import PrizesPage from './pages/PrizesPage';
import ScoresPage from './pages/ScoresPage';
import TracksPage from './pages/TracksPage';
import RankingsPage from './pages/RankingsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import HackathonEventPage from './pages/HackathonEventPage';
import CriterionPage from './pages/CriterionPage';
import TeamMemberPage from './pages/TeamMemberPage';
import { Role, isAuthenticated } from './services/authUtils';

const RootRedirect = () => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Routes that don't use any specific layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Public facing routes with PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/leaderboard/round/:roundId" element={<PublicLeaderboardPage />} />
          </Route>

          {/* Protected Routes with main app Layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />

              {/* Participant Routes */}
              <Route element={<PrivateRoute allowedRoles={[Role.PARTICIPANT]} />}>
                <Route path="/my-team" element={<MyTeamPage />} />
                <Route path="/events/:eventId/create-team" element={<CreateTeamPage />} />
                <Route path="/invitations" element={<InvitationsPage />} />
                <Route path="/events/:eventId/submissions/new" element={<SubmitProjectPage />} />
                <Route path="/my-mentorship-requests" element={<MyMentorshipRequestsPage />} />
              </Route>

              {/* Judge Routes */}
              <Route element={<PrivateRoute allowedRoles={[Role.JUDGE]} />}>
                <Route path="/judge/dashboard" element={<JudgeDashboardPage />} />
                <Route path="/judge/assignments/:assignmentId/submissions" element={<AssignmentSubmissionsPage />} />
                <Route path="/judge/score/:submissionId" element={<ScoringPage />} />
              </Route>

              {/* Mentor Routes */}
              <Route element={<PrivateRoute allowedRoles={[Role.MENTOR]} />}>
                <Route path="/mentor/dashboard" element={<MentorDashboardPage />} />
                <Route path="/mentor/requests" element={<MentorRequestsPage />} />
              </Route>

              {/* Organizer Routes */}
              <Route element={<PrivateRoute allowedRoles={[Role.ORGANIZER, Role.ADMIN]} />}>
                <Route path="/organizer/events" element={<OrganizerEventsPage />} />
                <Route path="/organizer/events/:eventId/dashboard" element={<EventDashboardPage />}>
                  <Route path="submissions" element={<SubmissionsTab />} />
                  <Route path="judges" element={<JudgesTab />} />
                  <Route path="ranking" element={<RankingTab />} />
                  <Route path="teams" element={<TeamsTab />} />
                  <Route path="rounds" element={<RoundsTab />} />
                  <Route path="criteria" element={<CriteriaTab />} />
                  <Route path="tracks" element={<TracksTab />} />
                  <Route path="prizes" element={<PrizesTab />} />
                  <Route path="analytics" element={<AnalyticsTab />} />
                  <Route path="activity-log" element={<ActivityLogTab />} />
                  {/* Add other tabs here */}
                </Route>
              </Route>

              {/* Generic/Admin Routes (for now) */}
              <Route element={<PrivateRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path="/support-tickets" element={<SupportTicketsPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/rounds" element={<RoundsPage />} />
                <Route path="/submissions" element={<SubmissionsPage />} />
                <Route path="/prizes" element={<PrizesPage />} />
                <Route path="/scores" element={<ScoresPage />} />
                <Route path="/tracks" element={<TracksPage />} />
                <Route path="/rankings" element={<RankingsPage />} />
                <Route path="/hackathon-events" element={<HackathonEventPage />} />
                <Route path="/criterion" element={<CriterionPage />} />
                <Route path="/team-members" element={<TeamMemberPage />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<PrivateRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/pending-approvals" element={<AdminPendingApprovalsPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/preferences" element={<SystemPreferencesPage />} />
                <Route path="/admin/mentors/:mentorId" element={<AdminMentorProfilePage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;