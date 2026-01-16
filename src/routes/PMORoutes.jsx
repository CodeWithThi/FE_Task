import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@core/middlewares/ProtectedRoute';

// Lazy load PMO pages
const ProjectListPage = lazy(() => import('@/pages/ProjectListPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const TaskBoardPage = lazy(() => import('@/pages/TaskBoardPage'));

export function PMORoutes() {
    return (
        <Routes>
            <Route path="projects" element={
                <ProtectedRoute allowedRoles={['pmo', 'director']}>
                    <ProjectListPage />
                </ProtectedRoute>
            } />
            <Route path="reports" element={
                <ProtectedRoute allowedRoles={['pmo', 'director', 'admin']}>
                    <ReportsPage />
                </ProtectedRoute>
            } />
            <Route path="tasks-board" element={
                <ProtectedRoute allowedRoles={['pmo', 'leader', 'staff']}>
                    <TaskBoardPage />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

