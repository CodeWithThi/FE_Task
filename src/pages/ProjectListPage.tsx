import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable, Column } from '@/components/common/DataTable';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { Plus, Eye } from 'lucide-react';
import { usePermissions } from '@/contexts/AuthContext';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';
import { toast } from 'sonner';
// Project status labels (different from TaskStatus)
const projectStatusLabels = {
  'active': 'Đang thực hiện',
  'completed': 'Hoàn thành',
  'on-hold': 'Tạm dừng',
};

const projectStatusStyles = {
  'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Chương trình Hè 2024',
    description: 'Tổ chức các lớp học hè cho học sinh các cấp',
    startDate: '2024-05-01',
    endDate: '2024-08-31',
    manager: { id: '1', name: 'Lê Văn PMO', email: 'pmo@trungtam.edu.vn', role: 'pmo', department: 'Phòng Điều phối', status: 'active' },
    departments: ['Bộ môn Toán', 'Bộ môn Lý', 'Bộ môn Hóa'],
    status: 'active',
    progress: 75,
    mainTaskCount: 24,
    createdBy: 'pmo@trungtam.edu.vn',
    createdAt: '2024-04-15',
  },
  {
    id: '2',
    name: 'Đào tạo giáo viên mới',
    description: 'Chương trình đào tạo và hướng dẫn cho giáo viên mới',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    manager: { id: '1', name: 'Lê Văn PMO', email: 'pmo@trungtam.edu.vn', role: 'pmo', department: 'Phòng Điều phối', status: 'active' },
    departments: ['Phòng đào tạo'],
    status: 'completed',
    progress: 100,
    mainTaskCount: 12,
    createdBy: 'pmo@trungtam.edu.vn',
    createdAt: '2023-12-01',
  },
  {
    id: '3',
    name: 'Nâng cấp hệ thống CNTT',
    description: 'Nâng cấp phòng máy và hệ thống mạng',
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    manager: { id: '1', name: 'Lê Văn PMO', email: 'pmo@trungtam.edu.vn', role: 'pmo', department: 'Phòng Điều phối', status: 'active' },
    departments: ['Phòng CNTT'],
    status: 'active',
    progress: 45,
    mainTaskCount: 18,
    createdBy: 'pmo@trungtam.edu.vn',
    createdAt: '2024-01-15',
  },
  {
    id: '4',
    name: 'Chuẩn bị năm học mới 2024-2025',
    description: 'Các công việc chuẩn bị cho năm học mới',
    startDate: '2024-07-01',
    endDate: '2024-09-01',
    manager: { id: '1', name: 'Lê Văn PMO', email: 'pmo@trungtam.edu.vn', role: 'pmo', department: 'Phòng Điều phối', status: 'active' },
    departments: ['Tất cả bộ môn'],
    status: 'on-hold',
    progress: 20,
    mainTaskCount: 32,
    createdBy: 'pmo@trungtam.edu.vn',
    createdAt: '2024-06-01',
  },
];

const statusOptions = Object.entries(projectStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

const departmentOptions = [
  { value: 'toan', label: 'Bộ môn Toán' },
  { value: 'ly', label: 'Bộ môn Lý' },
  { value: 'hoa', label: 'Bộ môn Hóa' },
  { value: 'cntt', label: 'Phòng CNTT' },
  { value: 'daotao', label: 'Phòng đào tạo' },
];

export default function ProjectListPage() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleCreateProject = (data: any) => {
    console.log('Tạo dự án mới:', data);
    toast.success('Tạo dự án thành công!');
    setIsProjectModalOpen(false);
  };

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Tên dự án',
      render: (project) => (
        <div>
          <p className="font-medium">{project.name}</p>
          <p className="text-sm text-muted-foreground truncate max-w-xs">
            {project.description}
          </p>
        </div>
      ),
    },
    {
      key: 'manager',
      header: 'Người quản lý',
      render: (project) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
            {project.manager.name.charAt(0)}
          </div>
          <span className="text-sm">{project.manager.name}</span>
        </div>
      ),
    },
    {
      key: 'departments',
      header: 'Phòng ban',
      render: (project) => (
        <span className="text-sm">{project.departments.join(', ')}</span>
      ),
    },
    {
      key: 'timeline',
      header: 'Thời gian',
      render: (project) => (
        <span className="text-sm">
          {new Date(project.startDate).toLocaleDateString('vi-VN')} -{' '}
          {new Date(project.endDate).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'progress',
      header: 'Tiến độ',
      className: 'w-40',
      render: (project) => <ProgressBar value={project.progress} size="sm" />,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (project) => (
        <Badge className={projectStatusStyles[project.status]}>
          {projectStatusLabels[project.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (project) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        title="Danh sách Dự án"
        description="Quản lý và theo dõi tất cả dự án của trung tâm"
        actions={
          permissions?.canCreateProject && (
            <Button onClick={() => setIsProjectModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo dự án mới
            </Button>
          )
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm dự án..."
        filters={[
          {
            key: 'status',
            label: 'Trạng thái',
            options: statusOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            key: 'department',
            label: 'Phòng ban',
            options: departmentOptions,
            value: departmentFilter,
            onChange: setDepartmentFilter,
          },
        ]}
        onClearFilters={() => {
          setStatusFilter('all');
          setDepartmentFilter('all');
        }}
      />

      <DataTable
        data={filteredProjects}
        columns={columns}
        keyExtractor={(project) => project.id}
        onRowClick={(project) => navigate(`/projects/${project.id}`)}
        emptyMessage="Không có dự án nào"
      />

      <ProjectFormModal
        open={isProjectModalOpen}
        onOpenChange={setIsProjectModalOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
