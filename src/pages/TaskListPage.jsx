import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { statusLabels, priorityLabels } from '@/types';
import { Plus, ChevronRight } from 'lucide-react';
import { usePermissions } from '@/contexts/AuthContext';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { toast } from 'sonner';
import { taskService } from '@/services/taskService';
import { accountService } from '@/services/accountService';
import { departmentService } from '@/services/departmentService';

// ... (imports remain)

// Remove mockTasks array.

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
    value,
    label,
}));
const priorityOptions = Object.entries(priorityLabels).map(([value, label]) => ({
    value,
    label,
}));
export default function TaskListPage() {
    const navigate = useNavigate();
    const permissions = usePermissions();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchTasks();
        fetchCommonData();
    }, []);

    const fetchCommonData = async () => {
        try {
            const [accRes, deptRes] = await Promise.all([
                accountService.getAccounts(),
                departmentService.getDepartments()
            ]);
            if (accRes.ok) setAccounts(accRes.data);
            if (deptRes.ok) setDepartments(deptRes.data);
        } catch (error) {
            console.error('Failed to fetch common data', error);
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getTasks();
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

    const columns = [
        {
            key: 'title',
            header: 'Công việc',
            render: (task) => (<div>
                <div className="flex items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    {task.subtaskCount > 0 && (<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {task.completedSubtasks}/{task.subtaskCount}
                    </span>)}
                </div>
                <p className="text-sm text-muted-foreground">{task.projectName}</p>
            </div>),
        },
        {
            key: 'leader',
            header: 'Trưởng nhóm',
            render: (task) => (<div className="flex items-center gap-2">
                {task.leader ? (
                    <>
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                            {task.leader.name ? task.leader.name.charAt(0) : '?'}
                        </div>
                        <div>
                            <p className="text-sm">{task.leader.name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{task.leader.department || ''}</p>
                        </div>
                    </>
                ) : <span className="text-sm text-muted-foreground">Unassigned</span>}
            </div>),
        },
        {
            key: 'priority',
            header: 'Độ ưu tiên',
            render: (task) => <PriorityBadge priority={task.priority} />,
        },
        {
            key: 'deadline',
            header: 'Deadline',
            render: (task) => (<span className="text-sm">
                {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'N/A'}
            </span>),
        },
        {
            key: 'progress',
            header: 'Tiến độ',
            className: 'w-36',
            render: (task) => <ProgressBar value={task.progress} size="sm" />,
        },
        {
            key: 'status',
            header: 'Trạng thái',
            render: (task) => <StatusBadge status={task.status} />,
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12',
            render: (task) => (<Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                navigate(`/tasks/${task.id}`);
            }}>
                <ChevronRight className="w-4 h-4" />
            </Button>),
        },
    ];

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (<div>
        <PageHeader title="Danh sách Công việc" description="Quản lý Main Task và Subtask của tất cả dự án" actions={permissions?.canCreateMainTask && (<Button onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Main Task
        </Button>)} />

        <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Tìm kiếm công việc..." filters={[
            {
                key: 'status',
                label: 'Trạng thái',
                options: statusOptions,
                value: statusFilter,
                onChange: setStatusFilter,
            },
            {
                key: 'priority',
                label: 'Độ ưu tiên',
                options: priorityOptions,
                value: priorityFilter,
                onChange: setPriorityFilter,
            },
        ]} onClearFilters={() => {
            setStatusFilter('all');
            setPriorityFilter('all');
        }} />

        <DataTable data={filteredTasks} columns={columns} keyExtractor={(task) => task.id} onRowClick={(task) => navigate(`/tasks/${task.id}`)} emptyMessage="Không có công việc nào" />

        <TaskFormModal open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen} onSubmit={handleCreateTask} type="main-task" accounts={accounts} departments={departments} />
    </div>);
}
