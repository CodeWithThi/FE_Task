import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "@core/contexts/AuthContext";
import { LoadingScreen } from "@core/components/common/LoadingScreen";
import { ProtectedRoute } from "@core/middlewares/ProtectedRoute";
import { routePermissions, getDefaultRouteForRole } from "@core/config/permissions";

// Public pages - loaded immediately
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFound from "@/pages/NotFound";

// Shared pages - lazy loaded
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@features/shared/profile/ProfilePage"));
const ChangePasswordPage = lazy(() => import("@features/shared/profile/ChangePasswordPage"));

// Admin pages - lazy loaded (only when user is admin)
const UsersPage = lazy(() => import("@features/admin/pages/UsersPage"));
const DepartmentsPage = lazy(() => import("@features/admin/pages/DepartmentsPage"));
const SettingsPage = lazy(() => import("@features/admin/pages/SettingsPage"));
const LogsPage = lazy(() => import("@features/admin/pages/LogsPage/index"));

// PMO/Director pages - lazy loaded
const ProjectListPage = lazy(() => import("@features/pmo/pages/ProjectListPage"));
const ProjectDetailPage = lazy(() => import("@features/pmo/pages/ProjectDetailPage"));
const ReportsPage = lazy(() => import("@features/pmo/pages/ReportsPage"));

// Shared feature pages - lazy loaded (used by multiple roles)
const MyOverviewPage = lazy(() => import("@features/shared/overview/MyOverviewPage"));
const TaskBoardPage = lazy(() => import("@features/shared/tasks/TaskBoardPage"));
const TaskListPage = lazy(() => import("@features/shared/tasks/TaskListPage"));
const TaskDetailPage = lazy(() => import("@features/shared/tasks/TaskDetailPage"));
const WorkspacePage = lazy(() => import("@features/shared/projects/WorkspacePage"));
const RemindersPage = lazy(() => import("@features/shared/reminders/RemindersPage"));


export function AppRoutes() {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    // Get default route based on user role
    const defaultRoute = user ? getDefaultRouteForRole(user.role) : '/dashboard';

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <HomePage />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <LoginPage />} />
                <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <ForgotPasswordPage />} />
                <Route path="/reset-password" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <ResetPasswordPage />} />

                {/* Dashboard - Director, PMO, Admin */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={routePermissions['/dashboard']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />

                {/* Tổng quan công việc của tôi - Leader/Staff */}
                <Route path="/my-overview" element={
                    <ProtectedRoute allowedRoles={['leader', 'staff']}>
                        <MyOverviewPage />
                    </ProtectedRoute>
                } />

                {/* Dự án - Director, PMO */}
                <Route path="/projects" element={
                    <ProtectedRoute allowedRoles={routePermissions['/projects']}>
                        <ProjectListPage />
                    </ProtectedRoute>
                } />

                {/* Project Detail / Workspace */}
                <Route path="/projects/:id" element={
                    <ProtectedRoute allowedRoles={routePermissions['/projects/:id']}>
                        <ProjectDetailPage />
                    </ProtectedRoute>
                } />
                <Route path="/workspace/:id" element={
                    <ProtectedRoute allowedRoles={routePermissions['/workspace/:id']}>
                        <WorkspacePage />
                    </ProtectedRoute>
                } />

                {/* Công việc - All Authenticated Users */}
                <Route path="/tasks" element={
                    <ProtectedRoute allowedRoles={routePermissions['/tasks']}>
                        <TaskListPage />
                    </ProtectedRoute>
                } />
                <Route path="/tasks/:id" element={
                    <ProtectedRoute allowedRoles={routePermissions['/tasks/:id']}>
                        <TaskDetailPage />
                    </ProtectedRoute>
                } />

                {/* Leader/Staff: Bảng công việc (Board View) */}
                <Route path="/tasks-board" element={
                    <ProtectedRoute allowedRoles={routePermissions['/tasks-board']}>
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

                {/* ADMIN ONLY - These will only be loaded if user is admin */}
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
        </Suspense>
    );
}

