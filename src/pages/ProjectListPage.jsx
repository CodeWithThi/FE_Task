import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable } from '@/components/common/DataTable';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { usePermissions } from '@/contexts/AuthContext';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';
import { toast } from 'sonner';
// Project status labels (different from TaskStatus)
import { projectService } from '@/services/projectService';

// ... (imports remain)

// Remove projectStatusLabels definition here if it duplicates with what's below or reuse.
// Keeping mockProjects var name but setting it to empty initial state or removing it.
// We will replace the component body to use state.

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

// ... options ...

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
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectService.getProjects();
            if (response.ok) {
                const data = response.data.map(p => ({
                    ...p,
                    departments: p.departments || []
                }));
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
            toast.error('Không thể tải danh sách dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (data) => {
        try {
            const response = await projectService.createProject(data);
            if (response.ok) {
                toast.success('Tạo dự án thành công!');
                setIsProjectModalOpen(false);
                fetchProjects();
            }
        } catch (error) {
            toast.error('Lỗi khi tạo dự án');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Tên dự án',
            render: (project) => (<div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-muted-foreground truncate max-w-xs">
                    {project.description}
                </p>
            </div>),
        },
        {
            key: 'manager',
            header: 'Người quản lý',
            render: (project) => (<div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                    {project.manager?.name?.charAt(0) || '?'}
                </div>
                <span className="text-sm">{project.manager?.name || 'N/A'}</span>
            </div>),
        },
        {
            key: 'departments',
            header: 'Phòng ban',
            render: (project) => (<span className="text-sm">{project.departments.join(', ')}</span>),
        },
        {
            key: 'timeline',
            header: 'Thời gian',
            render: (project) => (<span className="text-sm">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'N/A'} -{' '}
                {project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'N/A'}
            </span>),
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
            render: (project) => (<Badge className={projectStatusStyles[project.status]}>
                {projectStatusLabels[project.status]}
            </Badge>),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-20',
            render: (project) => (<Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${project.id}`)}>
                <Eye className="w-4 h-4" />
            </Button>),
        },
    ];

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (<div>
        <PageHeader title="Danh sách Dự án" description="Quản lý và theo dõi tất cả dự án của trung tâm" actions={permissions?.canCreateProject && (<Button onClick={() => setIsProjectModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo dự án mới
        </Button>)} />

        <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Tìm kiếm dự án..." filters={[
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
        ]} onClearFilters={() => {
            setStatusFilter('all');
            setDepartmentFilter('all');
        }} />

        <DataTable data={filteredProjects} columns={columns} keyExtractor={(project) => project.id} onRowClick={(project) => navigate(`/projects/${project.id}`)} emptyMessage="Không có dự án nào" />

        <ProjectFormModal open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen} onSubmit={handleCreateProject} />
    </div>);
}
