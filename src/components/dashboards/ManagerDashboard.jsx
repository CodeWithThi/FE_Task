import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ListTodo, Users, Clock, CheckCircle2, UserCheck, Loader2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { taskService } from '@/services/taskService';

export function ManagerDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        teamSize: 0,
        totalTasks: 0,
        pendingApprovals: 0,
        completedWeek: 0,
        overdueInDept: 0 // New metric
    });
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [teamTasks, setTeamTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, tasksRes] = await Promise.all([
                    dashboardService.getStats(),
                    taskService.getAllTasks()
                ]);

                const allTasks = tasksRes.ok ? tasksRes.data : [];
                const dashboardData = statsRes.ok ? statsRes.data : null;

                // 1. Identify Team Members from Stats (Trusted Source)
                const teamMemberIds = new Set();
                let validTeamMembers = [];

                if (dashboardData && dashboardData.members && Array.isArray(dashboardData.members.workload)) {
                    dashboardData.members.workload.forEach(m => teamMemberIds.add(m.id));
                    validTeamMembers = dashboardData.members.workload;
                }

                // 2. Filter Tasks for Department
                const scopedTasks = dashboardData ? allTasks.filter(t => t.assignee && teamMemberIds.has(t.assignee.id)) : [];

                // 3. Pending Approvals
                const pending = scopedTasks.filter(t => t.status === 'waiting-approval');
                setPendingApprovals(pending);

                // 4. Overdue Tasks in Dept
                const now = new Date();
                const overdue = scopedTasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'completed' && t.status !== 'done');
                setOverdueTasks(overdue);

                // 5. Team Tasks
                setTeamTasks(scopedTasks);

                // 6. Member Performance
                const memberMap = new Map();
                validTeamMembers.forEach(m => {
                    memberMap.set(m.id, {
                        id: m.id,
                        name: m.name,
                        tasks: m.activeTasks || 0, // From stats if available, or recalc
                        completed: 0
                    });
                });

                // Sync with actual task list for accuracy
                scopedTasks.forEach(task => {
                    if (task.assignee && memberMap.has(task.assignee.id)) {
                        const m = memberMap.get(task.assignee.id);
                        // We can recalc active tasks here to be sure
                        if (task.status === 'completed' || task.status === 'done') {
                            m.completed++;
                        }
                    }
                });
                setTeamMembers(Array.from(memberMap.values()));

                setStats({
                    teamSize: validTeamMembers.length,
                    totalTasks: scopedTasks.length,
                    pendingApprovals: pending.length,
                    completedWeek: scopedTasks.filter(t => (t.status === 'completed' || t.status === 'done')).length,
                    overdueInDept: overdue.length
                });

            } catch (error) {
                console.error('Failed to load manager dashboard', error);
                toast.error('Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const handleApprove = async (task) => {
        try {
            const finalStatus = 'completed';
            const updateRes = await taskService.updateTask(task.id, { status: finalStatus });

            if (updateRes.ok) {
                toast.success('Đã duyệt công việc');
                setPendingApprovals(prev => prev.filter(t => t.id !== task.id));
                setTeamTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: finalStatus, progress: 100 } : t));
            } else {
                toast.error('Không thể duyệt công việc');
            }
        } catch (err) {
            toast.error('Lỗi hệ thống');
        }
    };

    const handleReject = async (task) => {
        try {
            const res = await taskService.updateTask(task.id, { status: 'returned' });
            if (res.ok) {
                toast.success('Đã trả lại công việc');
                setPendingApprovals(prev => prev.filter(t => t.id !== task.id));
                setTeamTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'returned' } : t));
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error('Lỗi hệ thống');
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div>
            <PageHeader title="Quản lý - Trưởng bộ phận" description="Quản lý đội nhóm, phân công và duyệt công việc" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatCard title="Nhân sự" value={stats.teamSize} icon={Users} variant="primary" />
                <StatCard title="Tổng task team" value={stats.totalTasks} icon={ListTodo} variant="default" />
                <StatCard title="Chờ duyệt" value={stats.pendingApprovals} icon={UserCheck} variant="warning" />
                <StatCard title="Trễ hạn" value={stats.overdueInDept} icon={Clock} variant="danger" />
                <StatCard title="Hoàn thành tuần" value={stats.completedWeek} icon={CheckCircle2} variant="success" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Pending Approvals */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-status-waiting" />
                            Công việc chờ duyệt ({pendingApprovals.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingApprovals.length === 0 ? <p className="text-sm text-muted">Không có công việc chờ duyệt</p> :
                                pendingApprovals.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-status-waiting-bg/30">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{item.title}</span>
                                                <PriorityBadge priority={item.priority} />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {item.assignee?.name} • Deadline: {item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleReject(item)}>Trả lại</Button>
                                            <Button size="sm" onClick={() => handleApprove(item)}>Duyệt</Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Member Operations / Workload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Workload Nhân sự
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {teamMembers.map(m => (
                                <div key={m.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{m.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">
                                            <p className="font-medium">{m.name}</p>
                                            <p className="text-xs text-muted-foreground">{m.completed} xong</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs">
                                        <span className="block font-bold">{m.tasks} tasks</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dept Tasks List */}
            <Card>
                <CardHeader>
                    <CardTitle>Công việc phòng ban</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {teamTasks.slice(0, 5).map(t => (
                            <div key={t.id} className="flex justify-between items-center p-2 border rounded hover:bg-muted/50">
                                <div className="flex gap-2 items-center">
                                    <StatusBadge status={t.status} />
                                    <span className="text-sm font-medium">{t.title}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t.assignee?.name}
                                </div>
                            </div>
                        ))}
                        {teamTasks.length > 5 && <Button variant="ghost" className="w-full text-xs">Xem tất cả</Button>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
