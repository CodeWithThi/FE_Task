// Admin Module Entry Point - Lazy Loaded
import { lazy } from 'react';

// Lazy load admin pages
export const UsersPage = lazy(() => import('./pages/UsersPage'));
export const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'));
export const SettingsPage = lazy(() => import('./pages/SettingsPage'));
export const LogsPage = lazy(() => import('./pages/LogsPage'));

// Lazy load admin components
export { AdminDashboard } from './components/AdminDashboard';

