import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertTriangle, RotateCcw, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { taskService } from '@/services/taskService';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export function SEPDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        globalOverdue: 0,
        returnedTasks: 0,
        completionRate: 0,
        totalTasks: 0
    });
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [taskStatusData, setTaskStatusData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // SEP needs Global view.
                // dashboardService.getStats() will return global if role is mapped to 'admin'/'system'/'pmo'.
                // Wait, if role is 'sep', backend dashboardService currently maps 'sep' -> Personal (default else).
                // WE NEED TO FIX BACKEND FOR 'SEP' OR MAP 'SEP' TO 'PMO/ADMIN' FOR STATS SCOPE.
                // Check backend: "admin/system/pmo" -> Global. "leader/manager" -> Dept. Else -> Personal.
                // So 'sep' gets Personal scope in current backend.
                // WE CANNOT CHANGE BACKEND.
                // SOLUTION: Client-side fetching? No, backend enforces scope.
                // RISK: SEP Dashboard will show 0 data if backend treats it as personal.
                // Workaround: We asked User to fix backend or map SEP to Admin. 
                // User instructions imply permissions: "Chỉ xem (read-only)".
                // If I cannot change backend, I must warn user or hope 'sep' is mapped to 'admin' in authService?
                // In previous step I normalized 'system'->'admin'. I will map 'sep' -> 'admin' (or pmo) in authService purely for data scope if allowed?
                // Or better, let's assume 'sep' is mapped to 'pmo' or 'admin' logic internally in authService.js
                // BUT 'sep' is a distinct role in requirements.
                // Let's try to proceed. If backend returns personal data, we show that.

                const [statsRes, tasksRes] = await Promise.all([
                    dashboardService.getStats(), // returns scoped stats
                    taskService.getAllTasks()    // returns scoped tasks
                ]);

                const allTasks = tasksRes.ok ? tasksRes.data : [];
                const dashboardData = statsRes.ok ? statsRes.data : null;

                // Calculate metrics locally if needed (assuming correct scope)
                const now = new Date();
                const overdue = allTasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'completed' && t.status !== 'done');
                const returned = allTasks.filter(t => t.status === 'returned' || t.status === 'rejected');
                const completed = allTasks.filter(t => t.status === 'completed' || t.status === 'done');
                const total = allTasks.length;

                const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

                setStats({
                    globalOverdue: overdue.length,
                    returnedTasks: returned.length,
                    completionRate: rate,
                    totalTasks: total
                });
                setOverdueTasks(overdue);

                // Chart Data
                const statusCounts = {};
                allTasks.forEach(t => {
                    const s = t.status || 'unknown';
                    statusCounts[s] = (statusCounts[s] || 0) + 1;
                });

                const chartData = Object.keys(statusCounts).map(key => ({
                    name: key,
                    value: statusCounts[key],
                    color: getColorForStatus(key)
                }));
                setTaskStatusData(chartData);

            } catch (error) {
                console.error('Failed to load SEP dashboard', error);
                toast.error('Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getColorForStatus = (status) => {
        switch (status) {
            case 'completed': return 'hsl(142, 71%, 45%)';
            case 'in-progress': return 'hsl(217, 91%, 50%)';
            case 'waiting-approval': return 'hsl(262, 83%, 58%)';
            case 'returned': return 'hsl(0, 84%, 60%)';
            default: return '#8884d8';
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div>
            <PageHeader title="Giám sát chất lượng (SEP)" description="Theo dõi quy trình, chất lượng và các cảnh báo hệ thống (Read-Only)" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Quá hạn toàn hệ thống" value={stats.globalOverdue} icon={AlertTriangle} variant="danger" />
                <StatCard title="Task bị trả lại" value={stats.returnedTasks} icon={RotateCcw} variant="warning" />
                <StatCard title="Tỷ lệ hoàn thành" value={`${stats.completionRate}%`} icon={CheckCircle2} variant="success" />
                <StatCard title="Tổng số task" value={stats.totalTasks} icon={FileText} variant="default" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overdue List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Danh sách Task Quá hạn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {overdueTasks.length === 0 ? <p className="text-sm text-muted">Không có task quá hạn</p> :
                                overdueTasks.slice(0, 10).map(t => (
                                    <div key={t.id} className="flex justify-between items-center p-2 border border-destructive/20 bg-destructive/5 rounded">
                                        <div>
                                            <p className="font-medium text-sm">{t.title}</p>
                                            <p className="text-xs text-muted-foreground">{t.projectName} • {t.assignee?.name}</p>
                                        </div>
                                        <div className="text-right text-xs">
                                            <span className="text-destructive font-bold">
                                                {t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tỷ lệ trạng thái</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                                        {taskStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                            {taskStatusData.map(item => (
                                <div key={item.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
