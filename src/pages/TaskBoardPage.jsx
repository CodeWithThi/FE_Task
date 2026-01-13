import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { SubtaskDetailModal } from '@/components/tasks/SubtaskDetailModal';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useAuth, usePermissions } from '@/contexts/AuthContext';
import { Search, Plus, ListTodo } from 'lucide-react';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { departmentService } from '@/services/departmentService';
import { userService } from '@/services/userService';

export default function TaskBoardPage() {
    const { user } = useAuth();
    const permissions = usePermissions();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Data State
    const [projects, setProjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [tasks, setTasks] = useState([]);

    // Modal State
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showCreateMainTask, setShowCreateMainTask] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Parallel fetch for dependencies
                const [projRes, deptRes, userRes] = await Promise.all([
                    permissions.canViewProjects ? projectService.getAllProjects() : { ok: true, data: [] },
                    departmentService.getDepartments(),
                    userService.getUsers({ limit: 100 }) // Fetch reasonable amount of users
                ]);

                if (projRes.ok) {
                    setProjects(projRes.data);
                    if (projRes.data.length > 0 && !selectedProjectId) {
                        setSelectedProjectId(projRes.data[0].id);
                    }
                }

                if (deptRes.ok) setDepartments(deptRes.data);
                if (userRes.ok && Array.isArray(userRes.data)) {
                    // Normalize and Map Users for the Modal
                    // Crucial: Use M_ID as 'id' because Tasks are assigned to Members, not Accounts
                    const mappedUsers = userRes.data.map(u => ({
                        id: u.M_ID || u.Member?.M_ID, // Use Member ID for assignment
                        accountId: u.A_ID,            // Keep Account ID reference
                        name: u.Member?.FullName || u.UserName,
                        role: u.Role?.Role_Name ? u.Role.Role_Name.toLowerCase() : 'user',
                        status: u.Status,
                        departmentId: u.Member?.D_ID,
                        // Find department name from fetched departments if possible, else raw D_ID
                        department: deptRes.ok ? deptRes.data.find(d => (d.D_ID || d.id) === u.Member?.D_ID)?.D_Name : ''
                    }));
                    setAccounts(mappedUsers);
                }

            } catch (error) {
                console.error("Error loading board data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [permissions.canViewProjects]);

    // Load Tasks when Project Changes
    useEffect(() => {
        if (selectedProjectId) {
            fetchTasksByProject(selectedProjectId);
        }
    }, [selectedProjectId]);

    const fetchTasksByProject = async (projectId) => {
        setLoading(true);
        try {
            const res = await taskService.getTasksByProject(projectId);
            if (res.ok) {
                let fetchedTasks = res.data;
                // Filter for Staff: Only see tasks where they are Assignee
                if (user?.role === 'staff') {
                    fetchedTasks = fetchedTasks.filter(t => t.assignee?.id === user.id || t.assigneeId === user.id);
                }
                setTasks(fetchedTasks);
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi tải danh sách công việc');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = async (title, status) => {
        const newTask = {
            title,
            status,
            priority: 'medium',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            projectId: selectedProjectId,
            type: 'task'
        };

        try {
            const res = await taskService.createTask(newTask);
            if (res.ok) {
                setTasks([...tasks, res.data]);
                toast.success('Tạo công việc thành công');
            } else {
                toast.error('Không thể tạo công việc');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error('Lỗi kết nối server');
        }
    };

    const handleCreateMainTask = async (data) => {
        try {
            // Prepare payload
            const newTask = {
                title: data.title,
                description: data.description,
                priority: data.priority,
                deadline: data.deadline,
                projectId: selectedProjectId || data.projectId,
                assigneeId: data.assigneeId,
                departmentId: data.departmentId,
                type: 'main-task' // crucial tag
            };
            const res = await taskService.createTask(newTask);
            if (res.ok) {
                toast.success('Tạo Main Task thành công');
                fetchTasksByProject(selectedProjectId); // Refresh
                setShowCreateMainTask(false);
            } else {
                toast.error('Không thể tạo Main Task');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi hệ thống');
        }
    };

    const handleCardClick = (task) => {
        setSelectedTask(task);
        setShowDetail(true);
    };

    // Client-side search filter
    const filteredTasks = tasks.filter((task) =>
        (task.title || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading && projects.length === 0) return <LoadingScreen />;

    // Logic to determine if we block the view
    // Block if: User is PMO/Admin, Project Selected, but NO TASKS exist (Need Main Task)
    const isBlockingEmptyState =
        (user?.role === 'pmo' || user?.role === 'admin') &&
        selectedProjectId &&
        tasks.length === 0 &&
        !search; // Only block if not searching

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Bảng công việc</h1>
                    <p className="text-muted-foreground text-sm">
                        {user.role === 'staff' ? 'Danh sách công việc của tôi' : 'Quản lý tiến độ dự án'}
                    </p>
                </div>

                {/* Project Selector - Hide for Staff if we want forcing "My Tasks" only, 
                    but allow selector if Staff works on multiple projects */}
                <div className="flex items-center gap-3">
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Chọn dự án..." />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* PMO can Create Main Task directly from here too? Optional. 
                    Requirement says "Khi nhấn Thêm Main Task trong dự án". 
                    We'll keep the Empty State button primarily. */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-muted/10 rounded-lg border border-dashed relative">
                {isBlockingEmptyState ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-background/80 backdrop-blur-sm z-10">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <ListTodo className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Dự án chưa có Main Task</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Để bắt đầu quy trình làm việc, một Main Task (Công việc chính) cần được khởi tạo trước. Leader và Staff sẽ làm việc dựa trên Main Task này.
                        </p>
                        {permissions.canCreateMainTask && (
                            <Button onClick={() => setShowCreateMainTask(true)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Tạo Main Task đầu tiên
                            </Button>
                        )}
                    </div>
                ) : (
                    tasks.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <p>Không có công việc nào được tìm thấy.</p>
                        </div>
                    ) : (
                        <KanbanBoard
                            tasks={filteredTasks}
                            onCardClick={handleCardClick}
                            onAddCard={permissions.canCreateSubtask ? handleAddCard : undefined}

                            onTaskUpdate={async (task, newStatus) => {
                                // Optimistic Update
                                const originalTasks = [...tasks];
                                const updatedTasks = tasks.map(t =>
                                    t.id === task.id ? { ...t, status: newStatus } : t
                                );
                                setTasks(updatedTasks);

                                try {
                                    const res = await taskService.updateTask(task.id, { status: newStatus });
                                    if (!res.ok) {
                                        throw new Error('Update failed');
                                    }
                                    toast.success('Cập nhật trạng thái thành công');
                                } catch (error) {
                                    console.error(error);
                                    toast.error('Cập nhật thất bại');
                                    setTasks(originalTasks); // Rollback
                                }
                            }}
                        />
                    )
                )}
            </div>

            {/* Modals */}
            <SubtaskDetailModal
                open={showDetail}
                onOpenChange={setShowDetail}
                task={selectedTask}
                accounts={accounts}
                onTaskUpdate={fetchTasksByProject}
            />

            <TaskFormModal
                open={showCreateMainTask}
                onOpenChange={setShowCreateMainTask}
                type="main-task"
                onSubmit={handleCreateMainTask}
                projects={projects}
                accounts={accounts}
                departments={departments}
                initialData={{ projectId: selectedProjectId }}
            />
        </div>
    );
}
