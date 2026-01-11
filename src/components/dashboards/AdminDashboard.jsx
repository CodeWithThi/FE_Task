import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Settings, Shield, Activity, Database, ArrowRight, } from 'lucide-react';
const recentLogs = [
  { id: '1', user: 'Nguyễn Văn A', action: 'Đăng nhập hệ thống', time: '5 phút trước' },
  { id: '2', user: 'Trần Thị B', action: 'Tạo dự án mới "Kế hoạch Q2"', time: '15 phút trước' },
  { id: '3', user: 'Admin', action: 'Thêm người dùng mới', time: '30 phút trước' },
  { id: '4', user: 'Lê Văn C', action: 'Cập nhật tiến độ công việc', time: '1 giờ trước' },
  { id: '5', user: 'Phạm Thị D', action: 'Gửi duyệt công việc', time: '2 giờ trước' },
];
const quickActions = [
  { icon: Users, label: 'Quản lý người dùng', path: '/users', color: 'text-primary' },
  { icon: Building2, label: 'Quản lý phòng ban', path: '/departments', color: 'text-status-completed' },
  { icon: Settings, label: 'Cấu hình hệ thống', path: '/settings', color: 'text-status-pending' },
  { icon: Shield, label: 'Phân quyền', path: '/permissions', color: 'text-status-waiting' },
];
export function AdminDashboard() {
  return (<div>
    <PageHeader title="Tổng quan - Quản trị hệ thống" description="Quản lý người dùng, phòng ban và cấu hình hệ thống" />

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Tổng người dùng" value={45} icon={Users} variant="primary" />
      <StatCard title="Phòng ban" value={8} icon={Building2} variant="default" />
      <StatCard title="Người dùng hoạt động" value={38} icon={Activity} variant="success" />
      <StatCard title="Dung lượng hệ thống" value="2.4 GB" icon={Database} variant="warning" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (<Button key={action.path} variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted">
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
          <Button variant="ghost" size="sm" className="text-primary">
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
