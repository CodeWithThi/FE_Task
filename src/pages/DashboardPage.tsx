import { useAuth } from '@/contexts/AuthContext';
import { DirectorDashboard } from '@/components/dashboards/DirectorDashboard';
import { PMODashboard } from '@/components/dashboards/PMODashboard';
import { LeaderDashboard } from '@/components/dashboards/LeaderDashboard';
import { StaffDashboard } from '@/components/dashboards/StaffDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'director':
      return <DirectorDashboard />;
    case 'pmo':
      return <PMODashboard />;
    case 'leader':
      return <LeaderDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <StaffDashboard />;
  }
}
