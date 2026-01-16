import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@core/middlewares/ProtectedRoute';

// Lazy load admin pages
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const DepartmentsPage = lazy(() => import('@/pages/DepartmentsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const LogsPage = lazy(() => import('@/pages/LogsPage'));

export function AdminRoutes() {
    return (
        <Routes>
            <Route path="users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <UsersPage />
                </ProtectedRoute>
            } />
            <Route path="departments" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <DepartmentsPage />
                </ProtectedRoute>
            } />
            <Route path="settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <SettingsPage />
                </ProtectedRoute>
            } />
            <Route path="logs" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <LogsPage />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

