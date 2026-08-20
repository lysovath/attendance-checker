// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { GroupManagement } from './pages/admin/GroupManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { GroupDetail } from './pages/admin/GroupDetail';
import { SessionManagement } from './pages/admin/SessionManagement';
import { AdminSessionAttendancePage } from './pages/admin/AdminSessionAttendancePage';
import { UserManagement } from './pages/admin/UserManagement';
import { ReportsPage } from './pages/admin/ReportsPage';
import { BulkEnrollPage } from './pages/admin/BulkEnrollPage';
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { TrainerCourseDetailPage } from './pages/trainer/TrainerCourseDetail';
import { TrainerSessionAttendancePage } from './pages/trainer/TrainerSessionAttendancePage';
import { DashboardPage } from './pages/DashboardPage';

// Guard for routes accessible only to unauthenticated users (SignIn / SignUp)
const GuestLayout = ({ children }) => {
  const { userData, loading } = useAppAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (userData) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Guard for protected routes requiring authentication & optional role checks
const ProtectedLayout = ({ role, children }) => {
  const { userData, loading } = useAppAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!userData) return <Navigate to="/signin" replace />;

  if (role && userData.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      {/* Guest Only Routes */}
      <Route 
        path="/signin" 
        element={
          <GuestLayout>
            <SignInPage />
          </GuestLayout>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <GuestLayout>
            <SignUpPage />
          </GuestLayout>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        } 
      />

      <Route
        path="/trainer/groups/:groupId/courses"
        element={
          <ProtectedLayout role="TRAINER">
            <TrainerDashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/trainer/groups/:groupId/courses/:courseId"
        element={
          <ProtectedLayout role="TRAINER">
            <TrainerCourseDetailPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/trainer/groups/:groupId/courses/:courseId/sessions/:sessionId"
        element={
          <ProtectedLayout role="TRAINER">
            <TrainerSessionAttendancePage />
          </ProtectedLayout>
        }
      />

      <Route 
        path="/admin/groups" 
        element={
          <ProtectedLayout role="ADMIN">
            <GroupManagement />
          </ProtectedLayout>
        } 
      />

      <Route 
        path="/admin/courses" 
        element={
          <ProtectedLayout role="ADMIN">
            <CourseManagement />
          </ProtectedLayout>
        } 
      />

      <Route 
        path="/admin/groups/:groupId" 
        element={
          <ProtectedLayout role="ADMIN">
            <GroupDetail />
          </ProtectedLayout>
        } 
      />

      <Route
        path="/admin/groups/:groupId/courses/:courseId"
        element={
          <ProtectedLayout role="ADMIN">
            <SessionManagement />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/groups/:groupId/courses/:courseId/sessions/:sessionId"
        element={
          <ProtectedLayout role="ADMIN">
            <AdminSessionAttendancePage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedLayout role="ADMIN">
            <UserManagement />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedLayout role="ADMIN">
            <ReportsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/enroll"
        element={
          <ProtectedLayout role="ADMIN">
            <BulkEnrollPage />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}