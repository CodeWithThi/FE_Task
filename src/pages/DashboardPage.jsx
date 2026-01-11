import { useAuth } from '@/contexts/AuthContext';
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary';
import { SystemDashboard } from '@/components/dashboards/SystemDashboard';
import { PMODashboard } from '@/components/dashboards/PMODashboard';
import { DirectorDashboard } from '@/components/dashboards/DirectorDashboard';

export default function DashboardPage() {
    const { user } = useAuth();

    if (!user) return null;

    // Only 3 roles access /dashboard: admin, pmo, director
    const role = (user.role || '').toLowerCase();

    switch (role) {
        case 'admin':
            return (
                <GlobalErrorBoundary>
                    <SystemDashboard />
                </GlobalErrorBoundary>
            );

        case 'pmo':
            return (
                <GlobalErrorBoundary>
                    <PMODashboard />
                </GlobalErrorBoundary>
            );

        case 'director':
            return (
                <GlobalErrorBoundary>
                    <DirectorDashboard />
                </GlobalErrorBoundary>
            );

        default:
            // Should never reach here due to ProtectedRoute
            return (
                <div className="p-6">
                    <h1 className="text-xl text-destructive">Không có quyền truy cập Dashboard</h1>
                    <p className="text-muted-foreground">Vai trò: {user.role}</p>
                </div>
            );
    }
}
