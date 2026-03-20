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
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import ContactPage from "@/pages/ContactPage";

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
                <Route path="/forgotPassword" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <ForgotPasswordPage />} />
                <Route path="/resetPassword" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <ResetPasswordPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Dashboard - Director, PMO, Admin */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={routePermissions['/dashboard']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />

                {/* Workload - Personal task overview for Leader/Staff */}
                <Route path="/workload" element={
                    <ProtectedRoute allowedRoles={routePermissions['/workload']}>
                        <MyOverviewPage />
                    </ProtectedRoute>
                } />

                {/* Projects */}
                <Route path="/projects" element={
                    <ProtectedRoute allowedRoles={routePermissions['/projects']}>
                        <ProjectListPage />
                    </ProtectedRoute>
                } />

                {/* Project Detail */}
                <Route path="/projects/:id" element={
                    <ProtectedRoute allowedRoles={routePermissions['/projects/:id']}>
                        <ProjectDetailPage />
                    </ProtectedRoute>
                } />

                {/* Project Workspace */}
                <Route path="/projects/:id/workspace" element={
                    <ProtectedRoute allowedRoles={routePermissions['/projects/:id/workspace']}>
                        <WorkspacePage />
                    </ProtectedRoute>
                } />

                {/* Project Task Board (Kanban) */}
                <Route path="/projects/:id/board" element={
                    <ProtectedRoute allowedRoles={routePermissions['/projects/:id/board']}>
                        <TaskBoardPage />
                    </ProtectedRoute>
                } />

                {/* Standalone Task Board (Kanban) */}
                <Route path="/board" element={
                    <ProtectedRoute allowedRoles={routePermissions['/board']}>
                        <TaskBoardPage />
                    </ProtectedRoute>
                } />

                {/* Tasks */}
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

                {/* Reminders */}
                <Route path="/reminders" element={
                    <ProtectedRoute allowedRoles={routePermissions['/reminders']}>
                        <RemindersPage />
                    </ProtectedRoute>
                } />

                {/* Reports */}
                <Route path="/reports" element={
                    <ProtectedRoute allowedRoles={routePermissions['/reports']}>
                        <ReportsPage />
                    </ProtectedRoute>
                } />

                {/* Members */}
                <Route path="/members" element={
                    <ProtectedRoute allowedRoles={routePermissions['/members']}>
                        <UsersPage />
                    </ProtectedRoute>
                } />

                {/* Departments */}
                <Route path="/departments" element={
                    <ProtectedRoute allowedRoles={routePermissions['/departments']}>
                        <DepartmentsPage />
                    </ProtectedRoute>
                } />

                {/* System - Admin only */}
                <Route path="/system/settings" element={
                    <ProtectedRoute allowedRoles={routePermissions['/system/settings']}>
                        <SettingsPage />
                    </ProtectedRoute>
                } />

                <Route path="/system/logs" element={
                    <ProtectedRoute allowedRoles={routePermissions['/system/logs']}>
                        <LogsPage />
                    </ProtectedRoute>
                } />

                {/* Account - accessible by all authenticated users */}
                <Route path="/members/:username" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/account/changePassword" element={
                    <ProtectedRoute>
                        <ChangePasswordPage />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
