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
import { ListTodo, Users, Clock, CheckCircle2, UserCheck, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { taskService } from '@/services/taskService';

export function LeaderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    teamSize: 0,
    totalTasks: 0,
    pendingApprovals: 0,
    completedWeek: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

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

        // 0. Get Trusted Team Members from Stats (Backend Scoped)
        // If getting stats failed, we might show nothing or all. Safety first: show all if stats fail? 
        // No, show nothing is safer for privacy. But let's assume stats works.
        const teamMemberIds = new Set();
        let validTeamMembers = [];

        if (dashboardData && dashboardData.members && Array.isArray(dashboardData.members.workload)) {
          dashboardData.members.workload.forEach(m => teamMemberIds.add(m.id));
          validTeamMembers = dashboardData.members.workload;
        }

        // Filter tasks to only those assigned to my team members
        // If teamMemberIds is empty (e.g. no members), we shouldn't show global tasks.
        // But if stats failed, we might want to fallback? 
        // Let's rely on dashboardData. If it's valid, filter. If not, fallback to all (dev mode) or empty.
        // Given the requirement to "fix" blank dashboard, let's filter carefully.

        const scopedTasks = dashboardData ? allTasks.filter(t => t.assignee && teamMemberIds.has(t.assignee.id)) : [];

        // 1. Pending Approvals
        const pending = scopedTasks.filter(t => t.status === 'waiting-approval');
        setPendingApprovals(pending);

        // 2. Team Tasks
        setTeamTasks(scopedTasks);

        // 3. Team Members (Use data from stats directly as it's cleaner, but we need task counts from task list to be sync)
        // actually stats.workload has activeTasks count. 
        // But we want 'completed' count too.
        // Let's re-calculate using scopedTasks to ensure sync.

        const memberMap = new Map();

        // Initialize with all team members (even those with 0 tasks)
        validTeamMembers.forEach(m => {
          memberMap.set(m.id, {
            id: m.id,
            name: m.name,
            tasks: 0,
            completed: 0
          });
        });

        scopedTasks.forEach(task => {
          if (task.assignee && task.assignee.id) {
            // Note: assignee.id should already be in map if we filtered correctly
            if (memberMap.has(task.assignee.id)) {
              const member = memberMap.get(task.assignee.id);
              member.tasks++;
              if (task.status === 'completed' || task.status === 'done') {
                member.completed++;
              }
            }
          }
        });
        setTeamMembers(Array.from(memberMap.values()));

        // 4. Stats
        setStats({
          teamSize: validTeamMembers.length, // Use trusted size
          totalTasks: scopedTasks.length,
          pendingApprovals: pending.length,
          completedWeek: scopedTasks.filter(t => {
            if (t.status !== 'completed' && t.status !== 'done') return false;
            return true;
          }).length
        });

      } catch (error) {
        console.error('Failed to load leader dashboard', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApprove = async (task) => {
    try {
      const res = await taskService.updateTask(task.id, { status: 'in-progress' }); // Or 'completed'? Usually waiting-approval -> done? Or leader approves subtask?
      // Let's assume 'completed' if it was waiting for approval to finish? 
      // Or 'in-progress' if it was a proposal?
      // Usually Subtask: Staff submit -> Leader approve -> Completed.
      // Let's set to 'completed' for now, or check business logic.
      // Re-reading logic: "Staff: nhận/từ chối, cập nhật tiến độ, gửi trình duyệt".
      // Leader: "Duyệt/trả lại".
      // If Leader approves, it likely becomes 'completed'.

      const finalStatus = 'completed';
      const updateRes = await taskService.updateTask(task.id, { status: finalStatus });

      if (updateRes.ok) {
        toast.success('Đã duyệt công việc');
        // Remove from pending
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
        toast.error('Không thể trả lại công việc');
      }
    } catch (err) {
      toast.error('Lỗi hệ thống');
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (<div>
    <PageHeader title="Tổng quan - Trưởng nhóm" description="Quản lý công việc và nhân sự của đội nhóm" />

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Nhân sự hoạt động" value={stats.teamSize} icon={Users} variant="primary" />
      <StatCard title="Tổng công việc" value={stats.totalTasks} icon={ListTodo} variant="default" />
      <StatCard title="Chờ duyệt" value={stats.pendingApprovals} icon={Clock} variant="warning" />
      <StatCard title="Đã hoàn thành" value={stats.completedWeek} icon={CheckCircle2} variant="success" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Team Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Hiệu suất nhân sự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.length === 0 ? <p className="text-sm text-muted">Chưa có dữ liệu nhân sự</p> :
              teamMembers.map((member) => (<div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {member.name ? member.name.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.completed}/{member.tasks} công việc hoàn thành
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-primary">
                    {member.tasks ? Math.round((member.completed / member.tasks) * 100) : 0}%
                  </span>
                </div>
              </div>))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-status-waiting" />
            Công việc chờ duyệt ({pendingApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? <p className="text-sm text-muted">Không có công việc chờ duyệt</p> :
              pendingApprovals.map((item) => (<div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-status-waiting-bg/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.title}</span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gửi bởi: {item.assignee?.name} • {item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleReject(item)}>
                    Trả lại
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(item)}>
                    Duyệt
                  </Button>
                </div>
              </div>))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Team Tasks */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary" />
          Công việc đội nhóm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamTasks.length === 0 ? <p className="text-sm text-muted">Không có công việc nào</p> :
            teamTasks.slice(0, 10).map((task) => (<div key={task.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{task.title}</span>
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {task.assignee?.name || 'Chưa gán'} • Hạn: {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div className="w-32">
                <ProgressBar value={task.progress} size="sm" />
              </div>
            </div>))}
        </div>
      </CardContent>
    </Card>
  </div>);
}
