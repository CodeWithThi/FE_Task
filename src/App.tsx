import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectListPage from "./pages/ProjectListPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import TaskListPage from "./pages/TaskListPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import RemindersPage from "./pages/RemindersPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import SettingsPage from "./pages/SettingsPage";
import LogsPage from "./pages/LogsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Define which roles can access each route
const routePermissions: Record<string, UserRole[]> = {
  '/dashboard': ['admin', 'director', 'pmo', 'leader', 'staff'],
  '/projects': ['admin', 'director', 'pmo', 'leader', 'staff'],
  '/tasks': ['admin', 'director', 'pmo', 'leader', 'staff'],
  '/reminders': ['admin', 'director', 'pmo', 'leader', 'staff'],
  '/reports': ['admin', 'director', 'pmo', 'leader'],
  '/users': ['admin', 'director', 'pmo'],
  '/departments': ['admin', 'director', 'pmo'],
  '/settings': ['admin'],
  '/logs': ['admin'],
};

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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
