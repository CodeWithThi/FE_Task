import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ArrowLeft, LayoutGrid, Plus, Users, Calendar, Building2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { toast } from 'sonner';

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getProjectById(id),
        taskService.getTasksByProject(id)
      ]);

      if (projectRes.ok) {
        setProject(projectRes.data);
      } else {
        toast.error('Không thể tải thông tin dự án');
      }

      if (tasksRes.ok) {
        setTasks(tasksRes.data);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy dự án</p>
      </div>
    );
  }

  // Group tasks by board/category if needed
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = task.status || 'other';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div>
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/projects')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách dự án
      </Button>

      {/* Workspace Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground mb-4">{project.description || 'Không có mô tả'}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{project.departmentName || 'N/A'}</span>
              </div>
              {project.leaderName && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Leader: {project.leaderName}</span>
                </div>
              )}
              {project.startDate && project.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(project.startDate).toLocaleDateString('vi-VN')} - {new Date(project.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {project.status === 'active' ? 'Đang thực hiện' : project.status}
          </Badge>
        </div>
      </div>

      {/* Team Members */}
      {project.members && project.members.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Thành viên tham gia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {(member.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          Công việc ({totalTasks})
        </h2>
        <Button size="sm" onClick={() => navigate('/tasks-board')}>
          <Plus className="w-4 h-4 mr-1" />
          Tạo công việc
        </Button>
      </div>

      {/* Tasks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              Chưa có công việc nào trong dự án này
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tiến độ chung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hoàn thành</span>
                  <span className="font-medium">
                    {completedTasks}/{totalTasks} công việc
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
