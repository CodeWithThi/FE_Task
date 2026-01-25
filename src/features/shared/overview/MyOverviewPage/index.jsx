import { useAuth } from '@core/contexts/AuthContext';
import { LeaderDashboard } from '@/components/dashboards/LeaderDashboard';
import { StaffDashboard } from '@/components/dashboards/StaffDashboard';

export default function MyOverviewPage() {
  const { user } = useAuth();

  // Logic to determine if user is Leader
  // Check role name, ID, or generic 'role' field if mapped
  const isLeader =
    (user?.roleName && user.roleName.toLowerCase().includes('leader')) ||
    (user?.role && (user.role.toLowerCase() === 'manager' || user.role.toLowerCase() === 'leader')) ||
    user?.roleId === 'R_005'; // Hardcoded ID based on logs

  if (isLeader) {
    return <LeaderDashboard />;
  }

  return <StaffDashboard />;
}
