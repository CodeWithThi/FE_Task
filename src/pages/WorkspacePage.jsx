import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ArrowLeft, Calendar, Users, SquareCheckBig, Plus, Edit, Clock, AlarmClock, MoreHorizontal } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { toast } from 'sonner';
import { ProgressBar } from '@/components/common/ProgressBar';
import { usePermissions } from '@/contexts/AuthContext';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';

const activeTabStyle = "border-b-2 border-primary text-primary font-semibold";
const inactiveTabStyle = "text-muted-foreground hover:text-foreground";

const statusColors = {
  'running': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'completed': 'bg-green-100 text-green-700',
  'waiting-approval': 'bg-purple-100 text-purple-700',
  'not-assigned': 'bg-yellow-100 text-yellow-700',
  'overdue': 'bg-red-100 text-red-700',
};

const priorityColors = {
  'high': 'bg-red-100 text-red-700 border-red-200',
  'medium': 'bg-orange-100 text-orange-700 border-orange-200',
  'low': 'bg-green-100 text-green-700 border-green-200',
};

const statusLabels = {
  'running': 'Đang làm',
  'in-progress': 'Đang làm',
  'completed': 'Hoàn thành',
  'waiting-approval': 'Chờ duyệt',
  'not-assigned': 'Chưa nhận',
  'overdue': 'Trễ hạn',
};

const priorityLabels = {
  'high': 'Cao',
  'medium': 'Trung bình',
  'low': 'Thấp',
};

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = usePermissions();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'members'

  // Edit Project State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleUpdateProject = async (data) => {
    try {
      const response = await projectService.updateProject(id, data);
      if (response.ok) {
        toast.success('Cập nhật dự án thành công!');
        setIsEditModalOpen(false);
        fetchProjectData();
      } else {
        toast.error(response.message || 'Lỗi cập nhật');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi cập nhật dự án');
    }
  };

  if (loading) return <LoadingScreen />;
  if (!project) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy dự án</div>;

  const mainTasks = tasks; // Assuming all tasks here are main tasks for now
  const totalProgress = project.progress || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer w-fit" onClick={() => navigate('/projects')}>
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Quay lại danh sách</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground max-w-3xl">{project.description || 'Không có mô tả'}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {permissions?.canEditProject && (
            <Button variant="outline" className="gap-2" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          )}
          {permissions?.canCreateMainTask && (
            <Button className="gap-2" onClick={() => navigate('/tasks-board')}>
              <Plus className="w-4 h-4" />
              Thêm Main Task
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Time Card */}
        <Card>
          <CardContent className="p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Thời gian</p>
              <p className="font-semibold text-sm">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '...'} - {' '}
                {project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : '...'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardContent className="p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <SquareCheckBig className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Trạng thái</p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-medium">
                {project.status === 'active' ? 'Đang thực hiện' : project.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card>
          <CardContent className="p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Thành viên</p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{project.members?.length || 0}</span>
                <span className="text-sm text-muted-foreground">người</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">Tiến độ tổng quan</p>
              <span className="text-sm font-bold">{Math.round(totalProgress)}%</span>
            </div>
            <ProgressBar value={totalProgress} className="h-2" showLabel={false} />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 text-sm transition-colors ${activeTab === 'tasks' ? activeTabStyle : inactiveTabStyle}`}
          >
            Main Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm transition-colors ${activeTab === 'members' ? activeTabStyle : inactiveTabStyle}`}
          >
            Thành viên ({project.members?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'tasks' ? (
          tasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
              <p className="text-muted-foreground">Chưa có Main Task nào. Hãy tạo mới!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4">
                    {/* Row 1: Title & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-base text-foreground cursor-pointer hover:underline" onClick={() => navigate(`/tasks/${task.id}`)}>
                          {task.title}
                        </h3>
                        <Badge variant="outline" className={`font-normal ${priorityColors[task.priority?.toLowerCase()] || 'bg-gray-100'}`}>
                          {priorityLabels[task.priority?.toLowerCase()] || task.priority}
                        </Badge>
                        <Badge variant="secondary" className={`font-normal border-none ${statusColors[task.status?.toLowerCase()] || 'bg-gray-100'}`}>
                          {statusLabels[task.status?.toLowerCase()] || task.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                        <Clock className="w-4 h-4" />
                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'No deadline'}</span>
                      </div>
                    </div>

                    {/* Row 2: Progress & Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-col gap-2 w-full max-w-2xl">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{project.departmentName || 'Phòng ban'}</span>
                          <span>•</span>
                          <span>{task.assignee?.name || 'Chưa gán'}</span>
                          <span>•</span>
                          <span>{task.subtaskCount || 0} subtasks</span>
                        </div>
                        <ProgressBar value={task.progress || 0} className="h-1.5 w-full" showLabel={false} />
                      </div>
                      <div className="text-right text-sm font-medium text-muted-foreground min-w-[3rem]">
                        {task.progress || 0}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : (
          // Members Tab
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members && project.members.map(member => (
              <Card key={member.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">Thành viên</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Edit Project */}
      <ProjectFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateProject}
        initialData={project}
        isEditing={true}
      />
    </div>
  );
}
