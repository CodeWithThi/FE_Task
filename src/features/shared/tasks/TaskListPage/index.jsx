import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePermissions } from '@core/contexts/AuthContext';
import { taskService } from '@core/services/taskService';
import { accountService } from '@core/services/accountService';

import { departmentService } from '@core/services/departmentService';
import { projectService } from '@core/services/projectService';
import {
    statusLabels,
    priorityLabels,
    statusOptions,
    priorityOptions,
    taskStatusStyles,
    priorityStyles
} from '@/models';

// Icons
import {
    Plus,
    Search,
    ChevronRight,
    Filter
} from 'lucide-react';

// UI Components
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Badge } from '@core/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@core/components/ui/select';
import { DataTable } from '@core/components/common/DataTable';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { toast } from 'sonner';

export default function TaskListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const permissions = usePermissions();

    // State
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'all');

    // Modal & Data
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const [accounts, setAccounts] = useState([]);
    const [projects, setProjects] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Initial Fetch
    useEffect(() => {
        fetchTasks();
        fetchCommonData();
    }, []);

    // Sync URL
    useEffect(() => {
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (priorityFilter !== 'all') params.priority = priorityFilter;
        setSearchParams(params);
    }, [statusFilter, priorityFilter, setSearchParams]);

    const fetchCommonData = async () => {
        try {

            const [accRes, projRes, deptRes] = await Promise.all([
                accountService.getAccounts(),
                projectService.getAllProjects(),
                departmentService.getDepartments()
            ]);
            if (accRes.ok) setAccounts(accRes.data);
            if (projRes.ok) setProjects(projRes.data);
            if (deptRes.ok) setDepartments(deptRes.data);
        } catch (error) {
            console.error('Failed to fetch common data', error);
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getAllTasks();
            if (response.ok) {
                setTasks(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error);
            toast.error('Không thể tải danh sách công việc');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (data) => {
        try {
            const response = await taskService.createTask(data);
            if (response.ok) {
                toast.success('Tạo Main Task thành công!');
                setIsTaskModalOpen(false);
                fetchTasks();
            }
        } catch (error) {
            toast.error('Lỗi khi tạo task');
        }
    };

    // Columns Configuration
    const columns = [
        {
            key: 'name',
            header: 'Công việc',
            className: 'w-[350px]',
            render: (task) => (
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">{task.title}</span>
                        {/* Mock subtask count for visual parity with design since backend returns 0 */}
                        <Badge variant="secondary" className="px-1.5 py-0 h-5 text-xs bg-gray-100 text-gray-500 hover:bg-gray-100 border-0">
                            {task.completedSubtasks || 0}/{task.subtaskCount || 0}
                        </Badge>
                    </div>
                    {task.project && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.project.name}</p>
                    )}
                </div>
            )
        },
        {
            key: 'leader',
            header: 'Trưởng nhóm',
            className: 'w-[200px]',
            render: (task) => {
                if (!task.assignee) return <span className="text-muted-foreground text-sm">Chưa phân công</span>;
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                            {task.assignee.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 leading-none">{task.assignee.name}</span>
                            <span className="text-xs text-gray-500 mt-1">{task.assignee.department || 'Bộ môn Toán'}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'priority',
            header: 'Độ ưu tiên',
            className: 'w-[120px]',
            render: (task) => (
                <div className="flex justify-center">
                    <Badge className={`rounded-full px-3 py-0.5 font-normal border-0 ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                        {priorityLabels[task.priority] || 'Trung bình'}
                    </Badge>
                </div>
            )
        },
        {
            key: 'deadline',

            header: 'Hạn chót',
            className: 'w-[120px]',
            render: (task) => (
                <span className="text-sm font-medium text-gray-700">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Chưa có hạn'}
                </span>
            )
        },
        {
            key: 'progress',
            header: 'Tiến độ',
            className: 'w-[150px]',
            render: (task) => {
                const value = task.progress || 0;
                let colorClass = 'bg-blue-600';
                if (value >= 100) colorClass = 'bg-green-500';
                else if (value < 25) colorClass = 'bg-red-500';
                else if (value < 50) colorClass = 'bg-yellow-500';

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${colorClass}`}
                                style={{ width: `${value}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-8 text-right">{value}%</span>
                    </div>
                );
            }
        },
        {
            key: 'status',
            header: 'Trạng thái',
            className: 'w-[140px]',
            render: (task) => {
                const status = task.status || 'not-assigned';
                const label = statusLabels[status] || status || 'Chưa xác định';
                const style = taskStatusStyles[status] || 'bg-gray-100 text-gray-800';

                return (
                    <div className="flex justify-start">
                        <Badge className={`rounded-full px-3 py-0.5 font-normal border-0 ${style}`}>
                            {label}
                        </Badge>
                    </div>
                );
            }
        },
        {
            key: 'action',
            header: '',
            className: 'w-[40px]',
            render: () => <ChevronRight className="w-5 h-5 text-gray-400" />
        }
    ];

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = (task.title || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <div className="min-h-screen bg-white p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>

                    <h1 className="text-2xl font-bold text-gray-900">Danh sách Công việc</h1>
                    <p className="text-gray-500 mt-1">Quản lý Công việc chính và các việc nhỏ của tất cả dự án</p>
                </div>
                {permissions?.canCreateMainTask && (
                    <Button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo Công việc
                    </Button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-4 bg-white rounded-lg">
                <div className="relative w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm công việc..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Tất cả độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                        {priorityOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    data={filteredTasks}
                    columns={columns}
                    keyExtractor={(task) => task.id}
                    onRowClick={(task) => navigate(`/tasks/${task.id}`)}
                    emptyMessage="Chưa có công việc nào"
                    className="border-0"
                    headerClassName="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider h-12"
                    rowClassName={() => "hover:bg-gray-50/50 cursor-pointer border-b border-gray-100 last:border-0"}
                />
            </div>

            {/* Modals */}
            <TaskFormModal
                open={isTaskModalOpen}
                onOpenChange={setIsTaskModalOpen}
                onSubmit={handleCreateTask}
                accounts={accounts}
                projects={projects}
                departments={departments}
                type="main-task"
            />
        </div>
    );
}

