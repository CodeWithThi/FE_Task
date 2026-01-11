import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ListTodo, Clock, Calendar, CheckCircle2, History, AlertCircle, Loader2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { taskService } from '@/services/taskService';

export function UserDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        myTasks: 0,
        dueSoon: 0,
        overdue: 0,
        completed: 0
    });
    const [myTasks, setMyTasks] = useState([]);
    const [dueSoonTasks, setDueSoonTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // User is Staff -> dashboardService already scopes to Personal
                const [statsRes, tasksRes] = await Promise.all([
                    dashboardService.getStats(),
                    taskService.getAllTasks({ assignedTo: user.m_id || user.id }) // specific filter to be safe
                ]);

                const allTasks = tasksRes.ok ? tasksRes.data : [];
                const dashboardData = statsRes.ok ? statsRes.data : null;

                // Filter Due Soon (next 3 days)
                const now = new Date();
                const threeDaysLater = new Date();
                threeDaysLater.setDate(now.getDate() + 3);

                const activeTasks = allTasks.filter(t => t.status !== 'completed' && t.status !== 'done' && t.status !== 'cancelled');

                const dueSoon = activeTasks.filter(t => {
                    if (!t.deadline) return false;
                    const d = new Date(t.deadline);
                    return d >= now && d <= threeDaysLater;
                });

                const overdue = activeTasks.filter(t => t.deadline && new Date(t.deadline) < now);

                setMyTasks(allTasks);
                setDueSoonTasks(dueSoon);

                setStats({
                    myTasks: activeTasks.length,
                    dueSoon: dueSoon.length,
                    overdue: overdue.length, // or dashboardData.tasks?.overdue
                    completed: allTasks.filter(t => t.status === 'completed' || t.status === 'done').length
                });

            } catch (error) {
                console.error('Failed to load user dashboard', error);
                toast.error('Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div>
            <PageHeader title="Bàn làm việc - Nhân viên" description="Theo dõi công việc, lịch trình và báo cáo tiến độ" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Công việc của tôi" value={stats.myTasks} icon={ListTodo} variant="primary" />
                <StatCard title="Sắp tới hạn" value={stats.dueSoon} icon={Clock} variant="warning" />
                <StatCard title="Quá hạn" value={stats.overdue} icon={AlertCircle} variant="danger" />
                <StatCard title="Đã hoàn thành" value={stats.completed} icon={CheckCircle2} variant="success" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Urgent Tasks */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-warning" />
                            Cần xử lý gấp / Sắp tới hạn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {dueSoonTasks.length === 0 ? <p className="text-sm text-muted">Không có công việc sắp tới hạn</p> :
                                dueSoonTasks.map(t => (
                                    <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg bg-warning/5 border-warning/20">
                                        <div>
                                            <p className="font-medium text-sm">{t.title}</p>
                                            <p className="text-xs text-muted-foreground">Hạn: {new Date(t.deadline).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                        <StatusBadge status={t.status} />
                                    </div>
                                ))
                            }
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Schedule / Calendar placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Lịch cá nhân
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-center py-8 text-muted-foreground">
                            Tính năng lịch đang được cập nhật...
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* All Tasks List */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách công việc</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {myTasks.slice(0, 5).map(t => (
                                <div key={t.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={t.status} />
                                        <span className="text-sm font-medium">{t.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
