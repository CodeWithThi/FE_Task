import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Settings, Shield, Activity, Database, ArrowRight, } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';

const quickActions = [
  { icon: Users, label: 'Quản lý người dùng', path: '/users', color: 'text-primary' },
  { icon: Building2, label: 'Quản lý phòng ban', path: '/departments', color: 'text-status-completed' },
  { icon: Settings, label: 'Cấu hình hệ thống', path: '/settings', color: 'text-status-pending' },
];

// Mock logs for now (or TODO: Fetch from API)
const recentLogs = [
  { id: '1', user: 'System', action: 'Hệ thống khởi động', time: 'Vừa xong' },
  { id: '2', user: 'Admin', action: 'Đồng bộ dữ liệu', time: '5 phút trước' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    departmentCount: 0,
    activeUsers: 0,
    totalTasks: 0
  });

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds to update online users count
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getStats();
      if (res.ok && res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    }
  };

  return (<div>
    <PageHeader title="Tổng quan - Quản trị hệ thống" description="Quản lý người dùng, phòng ban và cấu hình hệ thống" />

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Tổng người dùng"
        value={stats.totalUsers}
        icon={Users}
        variant="primary"
        onClick={() => navigate('/users')}
      />
      <StatCard
        title="Phòng ban"
        value={stats.departmentCount}
        icon={Building2}
        variant="default"
        onClick={() => navigate('/departments')}
      />
      <StatCard
        title="Đang hoạt động"
        value={stats.activeUsers}
        icon={Activity}
        variant="success"
        onClick={() => navigate('/logs')}
      />
      <StatCard
        title="Cấu hình hệ thống"
        value="Cấu hình"
        icon={Settings}
        variant="warning"
        onClick={() => navigate('/settings')}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (<Button key={action.path} variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted" onClick={() => navigate(action.path)}>
              <action.icon className={`w-6 h-6 ${action.color}`} />
              <span className="text-sm">{action.label}</span>
            </Button>))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Logs */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Nhật ký hoạt động gần đây
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/logs')}>
            Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.map((log) => (<div key={log.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                  {log.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{log.user}</p>
                  <p className="text-sm text-muted-foreground">{log.action}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{log.time}</span>
            </div>))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>);
}
