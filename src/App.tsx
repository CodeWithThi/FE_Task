import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

import HomePage from "./pages/HomePage";
import SitemapPage from "./pages/SitemapPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectListPage from "./pages/ProjectListPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import WorkspacePage from "./pages/WorkspacePage";
import TaskListPage from "./pages/TaskListPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import TaskBoardPage from "./pages/TaskBoardPage";
import RemindersPage from "./pages/RemindersPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import SettingsPage from "./pages/SettingsPage";
import LogsPage from "./pages/LogsPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Define route permissions based on role requirements
// ADMIN: Quản lý user, phân quyền, cấu hình hệ thống, xem log. KHÔNG tham gia nghiệp vụ dự án
// DIRECTOR: Xem Dashboard tổng hợp, xem báo cáo. KHÔNG chỉnh sửa dữ liệu, KHÔNG giao task
// PMO: Tạo/quản lý Dự án, tạo Main Task, gán Leader, theo dõi tiến độ, cảnh báo trễ hạn, tổng hợp báo cáo
// LEADER: Nhận Main Task, tạo Subtask, phân công Nhân viên, duyệt/trả lại Subtask, đánh giá tiến độ
// STAFF: Nhận/từ chối Subtask, cập nhật tiến độ, upload tài liệu, gửi trình duyệt

const routePermissions: Record<string, UserRole[]> = {
  '/dashboard': ['admin', 'director', 'pmo', 'leader', 'staff'],
  '/projects': ['director', 'pmo', 'leader', 'staff'],      // Admin không tham gia dự án
  '/tasks': ['director', 'pmo', 'leader', 'staff'],         // Admin không tham gia công việc
  '/reminders': ['pmo', 'leader', 'staff'],                 // Director chỉ xem báo cáo
  '/reports': ['director', 'pmo', 'leader'],                // Staff không xem báo cáo
  '/users': ['admin', 'pmo'],                               // Admin và PMO quản lý user
  '/departments': ['admin', 'pmo'],                         // Admin và PMO quản lý phòng ban
  '/settings': ['admin'],                                   // Chỉ Admin cấu hình hệ thống
  '/logs': ['admin'],                                       // Chỉ Admin xem nhật ký
};

// Helper function to get default route based on role
function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'director':
      return '/dashboard';
    case 'pmo':
      return '/projects';
    case 'leader':
    case 'staff':
      return '/tasks-board';
    case 'admin':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Get default route based on user role
  const defaultRoute = user ? getDefaultRouteForRole(user.role) : '/dashboard';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <HomePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <LoginPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <ResetPasswordPage />} />
      {/* Sitemap - chỉ dành cho team thiết kế, ẩn khỏi user thường */}
      <Route path="/sitemap" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <SitemapPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={routePermissions['/dashboard']}>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute allowedRoles={routePermissions['/projects']}>
          <ProjectListPage />
        </ProtectedRoute>
      } />
      <Route path="/projects/:id" element={
        <ProtectedRoute allowedRoles={routePermissions['/projects']}>
          <ProjectDetailPage />
        </ProtectedRoute>
      } />
      {/* Workspace - when clicking on a project */}
      <Route path="/workspace/:id" element={
        <ProtectedRoute allowedRoles={routePermissions['/projects']}>
          <WorkspacePage />
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute allowedRoles={routePermissions['/tasks']}>
          <TaskListPage />
        </ProtectedRoute>
      } />
      <Route path="/tasks/:id" element={
        <ProtectedRoute allowedRoles={routePermissions['/tasks']}>
          <TaskDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/tasks-board" element={
        <ProtectedRoute allowedRoles={routePermissions['/tasks']}>
          <TaskBoardPage />
        </ProtectedRoute>
      } />
      <Route path="/reminders" element={
        <ProtectedRoute allowedRoles={routePermissions['/reminders']}>
          <RemindersPage />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={routePermissions['/reports']}>
          <ReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={routePermissions['/users']}>
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="/departments" element={
        <ProtectedRoute allowedRoles={routePermissions['/departments']}>
          <DepartmentsPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={routePermissions['/settings']}>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/logs" element={
        <ProtectedRoute allowedRoles={routePermissions['/logs']}>
          <LogsPage />
        </ProtectedRoute>
      } />
      {/* Profile routes - accessible by all authenticated users */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/change-password" element={
        <ProtectedRoute>
          <ChangePasswordPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
