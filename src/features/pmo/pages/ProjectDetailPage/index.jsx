import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@core/components/common/PageHeader';
import { ProgressBar } from '@core/components/common/ProgressBar';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { StatusBadge } from '@core/components/common/StatusBadge';
import { Card, CardContent } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@core/components/ui/tabs';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { Badge } from '@core/components/ui/badge';
import { usePermissions } from '@core/contexts/AuthContext';
import { ArrowLeft, Calendar, Users, ListTodo, Edit, Plus, Clock, Trash2 } from 'lucide-react';
import { projectStatusLabels, projectStatusStyles } from '@/models';
import { projectService } from '@core/services/projectService';
import { userService } from '@core/services/userService';
import { departmentService } from '@core/services/departmentService';
import { taskService } from '@core/services/taskService';
import { useState, useEffect } from 'react';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { ConfirmActionModal } from '@/components/modals/ConfirmActionModal';
import { toast } from 'sonner';
// Mock data removed
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getProjectById(id),
        taskService.getTasksByProject(id)
      ]);

      let loadedProject = null;
      if (projectRes.ok) {
        setProject(projectRes.data);
        loadedProject = projectRes.data;
      } else {
        // toast.error(projectRes.message);
      }

      let currentTasks = [];
      if (tasksRes.ok) {
        setTasks(tasksRes.data);
        currentTasks = tasksRes.data;
      }

      // Fetch Members: Prioritize Department Members -> Then Task Assignees
      let memberList = [];

      if (loadedProject?.departmentId) {
        try {
          const usersRes = await userService.getUsers({ departmentId: loadedProject.departmentId, limit: 100 });
          if (usersRes.ok && usersRes.data.length > 0) {
            memberList = usersRes.data.map(u => ({
              id: u.member?.id || u.aid,
              name: u.member?.fullName || u.userName,
              role: u.role?.name || 'Thành viên',
              status: u.status || 'active',
              department: u.member?.departmentName,
              taskCount: currentTasks.filter(t => t.assignee?.id === (u.member?.id || u.aid)).length
            }));
          }
        } catch (err) {
          console.error("Failed to fetch department members", err);
        }
      }

      // Fallback or merge: If no department members found, use task assignees
      if (memberList.length === 0) {
        const uniqueMemberIds = new Set();
        currentTasks.forEach(t => {
          if (t.assignee && !uniqueMemberIds.has(t.assignee.id)) {
            uniqueMemberIds.add(t.assignee.id);
            memberList.push({
              id: t.assignee.id,
              name: t.assignee.name,
              role: 'Thành viên',
              // department: t.assignee.department, 
              taskCount: currentTasks.filter(subT => subT.assignee?.id === t.assignee.id).length
            });
          }
        });
      }

      setMembers(memberList);

      // Fetch Departments for Task Modal
      const deptRes = await departmentService.getDepartments();
      if (deptRes.ok) {
        setDepartments(deptRes.data);
      }

    } catch (error) {
      console.error("Failed to fetch project details", error);
    } finally {
      setLoading(false);
    }
  };

  const [isMainTaskModalOpen, setIsMainTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New State for Edit Task
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleUpdateProject = async (data) => {
    try {
      const response = await projectService.updateProject(id, data);
      if (response.ok) {
        toast.success('Cập nhật dự án thành công!');
        setIsEditModalOpen(false);
        fetchProjectDetails();
      } else {
        toast.error(response.message || 'Lỗi cập nhật');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật dự án');
    }
  };

  const handleCreateMainTask = async (data) => {
    try {
      const response = await taskService.createTask(data);
      if (response.ok) {
        toast.success('Tạo Main Task thành công!');
        setIsMainTaskModalOpen(false);
        fetchProjectDetails(); // Refresh
      }
    } catch (error) {
      toast.error('Lỗi khi tạo công việc');
    }
  };

  const handleEditTask = (task) => {
    // Map task to format expected by Form (ids needed)
    // Task data usually comes with names, we might need IDs if possible or Form handles it
    setEditingTask({
      ...task,
      // Ensure mapped fields if needed
      assigneeId: task.assignee?.id,
      projectId: project.id
    });
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = async (data) => {
    try {
      const res = await taskService.updateTask(editingTask.id, data);
      if (res.ok) {
        toast.success('Cập nhật công việc thành công');
        setIsEditTaskModalOpen(false);
        fetchProjectDetails();
      } else {
        toast.error(res.message || 'Lỗi cập nhật');
      }
    } catch (error) {
      toast.error('Lỗi hệ thống');
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const res = await taskService.deleteTask(taskToDelete.id);
      if (res.ok) {
        toast.success('Xóa công việc thành công');
        fetchProjectDetails();
      } else {
        toast.error(res.message || 'Lỗi xóa công việc');
      }
    } catch (error) {
      toast.error('Lỗi hệ thống');
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (!project) return <div className="p-8 text-center">Không tìm thấy dự án</div>;

  return (<div>
    <Button variant="ghost" className="mb-4" onClick={() => navigate('/projects')}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Quay lại danh sách
    </Button>

    <PageHeader title={project.name} description={project.description || 'Không có mô tả'} actions={<div className="flex gap-2">
      {permissions?.canEditProject && (<Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
        <Edit className="w-4 h-4 mr-2" />
        Chỉnh sửa
      </Button>)}
      {permissions?.canCreateMainTask && (<Button onClick={() => setIsMainTaskModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Thêm Công việc
      </Button>)}
    </div>} />

    {/* Project Overview Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thời gian</p>
              <p className="text-sm font-medium">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'N/A'} -{' '}
                {project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái</p>
              <Badge className={projectStatusStyles[project.status] || projectStatusStyles['active']}>
                {projectStatusLabels[project.status] || project.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phòng ban</p>
              <p className="text-sm font-medium">{project.department || 'Chưa gán'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thành viên</p>
              <p className="text-sm font-medium">{members.length} người</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {/* Same as before */}
          <p className="text-sm text-muted-foreground mb-2">Tiến độ tổng quan</p>
          <ProgressBar value={project.progress || 0} />
        </CardContent>
      </Card>
    </div>

    {/* Tabs */}
    <Tabs defaultValue="tasks" className="space-y-4">
      <TabsList>
        <TabsTrigger value="tasks">
          <ListTodo className="w-4 h-4 mr-2" />
          Công việc chính ({tasks.length})
        </TabsTrigger>
        <TabsTrigger value="members">
          <Users className="w-4 h-4 mr-2" />
          Thành viên ({members.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tasks">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Chưa có công việc nào</div>
              ) : (
                tasks.map((task) => (<div key={task.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group" onClick={() => navigate(`/tasks/${task.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{task.title}</span>
                        <PriorityBadge priority={task.priority?.toLowerCase()} />
                        <StatusBadge status={task.status} />
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {project.department || 'Chưa gán phòng ban'}
                        </span>
                        <span>•</span>
                        <span>{task.assignee ? task.assignee.name : 'Chưa gán người làm'}</span>
                        <span>•</span>
                        <span>{task.subtaskCount || 0} việc nhỏ</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Chưa có hạn'}
                      </div>

                      {/* Action Buttons - Visible on Hover or Always if mobile? Group hover works */}
                      <div className="flex items-center gap-1 opacity-100 transition-opacity">
                        {permissions?.canEditTask && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {permissions?.canDeleteTask && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* <ProgressBar value={task.progress} size="sm"/> */}
                </div>))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="members">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {members.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Chưa có thành viên nào tham gia</div>
              ) : (
                members.map((member) => (<div key={member.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.role} {member.department ? `• ${member.department}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{member.taskCount} công việc</p>
                  </div>
                </div>))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <TaskFormModal
      open={isMainTaskModalOpen}
      onOpenChange={setIsMainTaskModalOpen}
      onSubmit={handleCreateMainTask}
      type="main-task"
      accounts={members}
      departments={departments}
      projects={[{ id: project.id, name: project.name }]} // Lock to current project
      initialData={{ projectId: project.id, departmentId: project.departmentId }}
      mode="create"
    />

    <TaskFormModal
      open={isEditTaskModalOpen}
      onOpenChange={setIsEditTaskModalOpen}
      onSubmit={handleUpdateTask}
      type="main-task"
      accounts={members}
      departments={departments}
      projects={[{ id: project.id, name: project.name }]}
      initialData={editingTask}
      mode="edit"
    />

    <ProjectFormModal
      open={isEditModalOpen}
      onOpenChange={setIsEditModalOpen}
      onSubmit={handleUpdateProject}
      initialData={project}

      mode="edit"
    />

    <ConfirmActionModal
      open={isDeleteModalOpen}
      onOpenChange={setIsDeleteModalOpen}
      actionType="delete"
      taskTitle={taskToDelete?.title}
      onConfirm={confirmDeleteTask}
    />
  </div >);
}

