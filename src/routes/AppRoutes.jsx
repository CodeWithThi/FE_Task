import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ProtectedRoute } from "./ProtectedRoute";
import { routePermissions, getDefaultRouteForRole } from "@/config/permissions";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectListPage from "@/pages/ProjectListPage";
import WorkspacePage from "@/pages/WorkspacePage";
import MyOverviewPage from "@/pages/MyOverviewPage";
import TaskBoardPage from "@/pages/TaskBoardPage";
import RemindersPage from "@/pages/RemindersPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import SettingsPage from "@/pages/SettingsPage";
import LogsPage from "@/pages/LogsPage";
import ProfilePage from "@/pages/ProfilePage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import NotFound from "@/pages/NotFound";
export function AppRoutes() {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) {
        return <LoadingScreen />;
    }
    // Get default route based on user role
    const defaultRoute = user ? getDefaultRouteForRole(user.role) : '/dashboard';
    return (<Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <HomePage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <LoginPage />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <ForgotPasswordPage />} />
        <Route path="/reset-password" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <ResetPasswordPage />} />
        {/* Dashboard - Director, PMO, Admin */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={routePermissions['/dashboard']}>
            <DashboardPage />
        </ProtectedRoute>} />
        {/* Tổng quan công việc của tôi - Leader/Staff */}
        <Route path="/my-overview" element={<ProtectedRoute allowedRoles={['leader', 'staff']}>
            <MyOverviewPage />
        </ProtectedRoute>} />
        {/* Dự án - Director, PMO */}
        <Route path="/projects" element={<ProtectedRoute allowedRoles={routePermissions['/projects']}>
            <ProjectListPage />
        </ProtectedRoute>} />
        {/* Workspace - Khi click vào dự án */}
        <Route path="/workspace/:id" element={<ProtectedRoute allowedRoles={routePermissions['/workspace/:id']}>
            <WorkspacePage />
        </ProtectedRoute>} />
        {/* Leader/Staff: Chỉ có Bảng công việc - KHÔNG CÓ DANH SÁCH */}
        <Route path="/tasks-board" element={<ProtectedRoute allowedRoles={routePermissions['/tasks-board']}>
            <TaskBoardPage />
        </ProtectedRoute>} />
        {/* Redirect /tasks to /tasks-board for Leader/Staff */}
        <Route path="/tasks" element={<Navigate to="/tasks-board" replace />} />
        <Route path="/tasks/:id" element={<Navigate to="/tasks-board" replace />} />
        <Route path="/reminders" element={<ProtectedRoute allowedRoles={routePermissions['/reminders']}>
            <RemindersPage />
        </ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={routePermissions['/reports']}>
            <ReportsPage />
        </ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={routePermissions['/users']}>
            <UsersPage />
        </ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute allowedRoles={routePermissions['/departments']}>
            <DepartmentsPage />
        </ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={routePermissions['/settings']}>
            <SettingsPage />
        </ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute allowedRoles={routePermissions['/logs']}>
            <LogsPage />
        </ProtectedRoute>} />
        {/* Profile routes - accessible by all authenticated users */}
        <Route path="/profile" element={<ProtectedRoute>
            <ProfilePage />
        </ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute>
            <ChangePasswordPage />
        </ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
    </Routes>);
}
