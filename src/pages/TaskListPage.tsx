import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { MainTask, statusLabels, priorityLabels } from '@/types';
import { Plus, Eye, ChevronRight } from 'lucide-react';

const mockTasks: MainTask[] = [
  {
    id: '1',
    title: 'Chuẩn bị giáo án môn Toán chương 1-5',
    description: 'Soạn giáo án chi tiết cho 5 chương đầu tiên',
    projectId: '1',
    projectName: 'Chương trình Hè 2024',
    department: 'Bộ môn Toán',
    assignee: { id: '1', name: 'Nguyễn Văn A', email: '', role: 'staff', department: 'Bộ môn Toán', status: 'active' },
    priority: 'high',
    status: 'in-progress',
    startDate: '2024-05-01',
    deadline: '2024-05-15',
    progress: 80,
    subtaskCount: 5,
    completedSubtasks: 4,
  },
  {
    id: '2',
    title: 'Chuẩn bị giáo án môn Lý',
    description: 'Soạn giáo án cho chương trình học hè',
    projectId: '1',
    projectName: 'Chương trình Hè 2024',
    department: 'Bộ môn Lý',
    assignee: { id: '2', name: 'Trần Thị B', email: '', role: 'staff', department: 'Bộ môn Lý', status: 'active' },
    priority: 'high',
    status: 'completed',
    startDate: '2024-05-01',
    deadline: '2024-05-10',
    progress: 100,
    subtaskCount: 4,
    completedSubtasks: 4,
  },
  {
    id: '3',
    title: 'Thiết kế bài tập thực hành Hóa học',
    description: 'Tạo bài tập thực hành cho học sinh',
    projectId: '1',
    projectName: 'Chương trình Hè 2024',
    department: 'Bộ môn Hóa',
    assignee: { id: '3', name: 'Lê Văn C', email: '', role: 'staff', department: 'Bộ môn Hóa', status: 'active' },
    priority: 'medium',
    status: 'waiting-approval',
    startDate: '2024-05-10',
    deadline: '2024-05-20',
    progress: 100,
    subtaskCount: 3,
    completedSubtasks: 3,
  },
  {
    id: '4',
    title: 'Lên lịch giảng dạy tháng 6',
    description: 'Xây dựng thời khóa biểu cho tháng 6',
    projectId: '1',
    projectName: 'Chương trình Hè 2024',
    department: 'Ban điều hành',
    assignee: { id: '4', name: 'Phạm Thị D', email: '', role: 'pmo', department: 'Ban điều hành', status: 'active' },
    priority: 'low',
    status: 'pending',
    startDate: '2024-05-20',
    deadline: '2024-05-25',
    progress: 0,
    subtaskCount: 2,
    completedSubtasks: 0,
  },
  {
    id: '5',
    title: 'Đào tạo sử dụng phần mềm mới',
    description: 'Hướng dẫn giáo viên sử dụng hệ thống quản lý mới',
    projectId: '2',
    projectName: 'Đào tạo giáo viên mới',
    department: 'Phòng CNTT',
    assignee: { id: '5', name: 'Hoàng Văn E', email: '', role: 'leader', department: 'Phòng CNTT', status: 'active' },
    priority: 'high',
    status: 'overdue',
    startDate: '2024-01-01',
    deadline: '2024-01-08',
    progress: 30,
    subtaskCount: 6,
    completedSubtasks: 2,
  },
];

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const columns: Column<MainTask>[] = [
    {
      key: 'title',
      header: 'Công việc',
      render: (task) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{task.title}</span>
            {task.subtaskCount > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {task.completedSubtasks}/{task.subtaskCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{task.projectName}</p>
        </div>
      ),
    },
    {
      key: 'assignee',
      header: 'Người phụ trách',
      render: (task) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
            {task.assignee.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm">{task.assignee.name}</p>
            <p className="text-xs text-muted-foreground">{task.department}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Độ ưu tiên',
      render: (task) => <PriorityBadge priority={task.priority} />,
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (task) => (
        <span className="text-sm">
          {new Date(task.deadline).toLocaleDateString('vi-VN')}
        </span>
      ),
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
      render: (task) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/tasks/${task.id}`);
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <PageHeader
        title="Danh sách Công việc"
        description="Quản lý Main Task và Subtask của tất cả dự án"
        actions={
          <Button onClick={() => navigate('/tasks/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Main Task
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm công việc..."
        filters={[
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
        ]}
        onClearFilters={() => {
          setStatusFilter('all');
          setPriorityFilter('all');
        }}
      />

      <DataTable
        data={filteredTasks}
        columns={columns}
        keyExtractor={(task) => task.id}
        onRowClick={(task) => navigate(`/tasks/${task.id}`)}
        emptyMessage="Không có công việc nào"
      />
    </div>
  );
}
