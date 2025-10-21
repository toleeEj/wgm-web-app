import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import AuthPage from './pages/Auth';
import Unauthorized from './pages/Unauthorized';
import ProfilePage from './pages/ProfilePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MeetingList from './pages/MeetingList';
import MeetingForm from './pages/MeetingForm';
import Chat from './pages/Chat';
import MemberPayments from './pages/MemberPayments';
import MemberQnA from './pages/MemberQnA';
import AdminQnA from './pages/AdminQnA';
import Gallery from './pages/Gallery';
import RulesPage from './pages/RulesPage';
import Announcements from './pages/Announcements';

import Layout from './components/Layout'; // 👈 separate layout component

function App() {
  const session = useSession();

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* --- Protected Routes with Layout --- */}
      <Route element={<Layout />}>
        {/* Default redirect based on role */}
        <Route
          path="/"
          element={
            session ? (
              session.user.user_metadata.role === 'Admin' ||
              session.user.user_metadata.role === 'Super Admin' ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/member" />
              )
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Super Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Member route */}
        <Route
          path="/member"
          element={
            <ProtectedRoute allowedRoles={['Member', 'Admin', 'Super Admin']}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* Other authenticated pages */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/meeting-list" element={<MeetingList />} />
        <Route path="/meeting-form" element={<MeetingForm />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/member-payments" element={<MemberPayments />} />
        <Route path="/member-qna" element={<MemberQnA />} />
        <Route path="/admin-qna" element={<AdminQnA />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* --- Fallback for unmatched routes --- */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}

export default App;
