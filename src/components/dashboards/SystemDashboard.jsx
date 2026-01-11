import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Settings, Shield, Activity, Database, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/apiClient';

// Mock system logs for now (or could fetch from a logs endpoint if exists)
const recentLogs = [
    { id: '1', user: 'System', action: 'System started', time: 'Now' },
];

const quickActions = [
    { icon: Users, label: 'Quản lý người dùng', path: '/users', color: 'text-primary' },
    { icon: Building2, label: 'Quản lý phòng ban', path: '/departments', color: 'text-status-completed' },
    { icon: Settings, label: 'Cấu hình hệ thống', path: '/settings', color: 'text-status-pending' },
    { icon: Shield, label: 'Phân quyền', path: '/permissions', color: 'text-status-waiting' },
];

export function SystemDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        departments: 0,
        roles: 5 // Default roles: Admin, PMO, Manager, User, SEP
    });

    useEffect(() => {
        // Fetch real counts if available, or just mock for "System" view if separate endpoint needed
        // Assuming we can re-use some existing list endpoints to get counts
        const fetchCounts = async () => {
            try {
                // Parallel fetch
                // Note: DashboardService might not give these raw system counts.
                // Let's rely on simple list lengths for now if endpoints allow list all.
                // departmentService.listDepartments
                // accountController.listAccounts (if admin)

                // We can add simple fetchers here using apiClient directly if no service method explicitly returns count
                const [deptRes, accRes] = await Promise.all([
                    apiClient.get('/departments'),
                    apiClient.get('/accounts')
                ]);

                setStats({
                    users: accRes.data ? accRes.data.length : 0,
                    departments: deptRes.data ? deptRes.data.length : 0,
                    roles: 5
                });

            } catch (e) {
                console.error("Failed to load system stats", e);
            }
        };
        fetchCounts();
    }, []);

    return (
        <div>
            <PageHeader title="Hệ thống - Quản trị viên" description="Trung tâm quản trị hệ thống, không tham gia nghiệp vụ dự án" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Tổng tài khoản" value={stats.users} icon={Users} variant="primary" />
                <StatCard title="Tổng phòng ban" value={stats.departments} icon={Building2} variant="default" />
                <StatCard title="Tổng vai trò" value={stats.roles} icon={Shield} variant="success" />
                <StatCard title="Trạng thái hệ thống" value="Ổn định" icon={Activity} variant="warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action) => (
                                <Button key={action.path} variant="outline" className="h-auto flex-col gap-2 py-4 hover:bg-muted" onClick={() => window.location.href = action.path}>
                                    <action.icon className={`w-6 h-6 ${action.color}`} />
                                    <span className="text-sm">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Info / Logs */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            Thông tin hệ thống
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Phiên bản</span>
                                <span className="font-medium">v1.0.0</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Database</span>
                                <span className="font-medium">MySQL (Prisma)</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Last backup</span>
                                <span className="font-medium">--</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Server Time</span>
                                <span className="font-medium">{new Date().toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
