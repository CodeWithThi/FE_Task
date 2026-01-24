import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@core/components/common/PageHeader';
import { StatCard } from '@core/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { Users, Building2, Settings, Shield, Activity, Database, ArrowRight, } from 'lucide-react';
import { dashboardService } from '@core/services/dashboardService';
import { logService } from '@core/services/logService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/avatar';

const quickActions = [
  { icon: Users, label: 'Quản lý người dùng', path: '/users', color: 'text-primary' },
  { icon: Building2, label: 'Quản lý phòng ban', path: '/departments', color: 'text-status-completed' },
  { icon: Settings, label: 'Cấu hình hệ thống', path: '/settings', color: 'text-status-pending' },
];

// Mock logs for now (or TODO: Fetch from API)


export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    departmentCount: 0,
    activeUsers: 0,
    totalTasks: 0
  });

  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchLogs();

    // Auto-refresh every 30 seconds to update online users count
    const interval = setInterval(() => {
      fetchStats();
      fetchLogs();
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

  const fetchLogs = async () => {
    try {
      const res = await logService.getLogs(1, 5); // Get top 5 recent logs
      if (res.ok) {
        setRecentLogs(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch recent logs", error);
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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Nhật ký hoạt động gần đây
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800" onClick={() => navigate('/logs')}>
            Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Chưa có hoạt động nào</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.LogID} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={log.Actor?.Member?.Avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{(log.Actor?.UserName || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {log.Actor?.Member?.FullName || log.Actor?.UserName}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.CreatedAt), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {log.Message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  </div>);
}

