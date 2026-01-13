import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable } from '@/components/common/DataTable';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';

import { usePermissions } from '@/contexts/AuthContext';
import { projectService } from '@/services/projectService';
import { departmentService } from '@/services/departmentService';
import { projectStatusLabels, projectStatusStyles } from '@/models';

const statusOptions = Object.entries(projectStatusLabels).map(([value, label]) => ({
    value,
    label,
}));

export default function ProjectListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const permissions = usePermissions();

    // State
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('department') || 'all');

    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [hiddenProjects, setHiddenProjectIds] = useState(new Set());

    const toggleProjectVisibility = (id) => {
        const newHidden = new Set(hiddenProjects);
        if (newHidden.has(id)) {
            newHidden.delete(id);
        } else {
            newHidden.add(id);
        }
        setHiddenProjectIds(newHidden);
    };

    // Modal State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [projectToEdit, setProjectToEdit] = useState(null);

    useEffect(() => {
        fetchProjects();
        fetchDepartments();
    }, []);

    useEffect(() => {
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (departmentFilter !== 'all') params.department = departmentFilter;
        setSearchParams(params);
    }, [statusFilter, departmentFilter, setSearchParams]);

    const fetchDepartments = async () => {
        try {
            const res = await departmentService.getDepartments();
            if (res.ok) {
                const options = res.data.map(d => ({
                    value: d.D_ID || d.id,
                    label: d.D_Name || d.name
                }));
                setDepartmentOptions(options);
            }
        } catch (error) {
            console.error('Failed to fetch departments', error);
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectService.getAllProjects();
            if (response.ok) {
                setProjects(response.data);
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

    const handleUpdateProject = async (data) => {
        if (!projectToEdit) return;
        try {
            const response = await projectService.updateProject(projectToEdit.id, data);
            if (response.ok) {
                toast.success('Cập nhật dự án thành công!');
                setIsProjectModalOpen(false);
                setProjectToEdit(null);
                fetchProjects();
            } else {
                toast.error(response.message || 'Lỗi cập nhật');
            }
        } catch (error) {
            toast.error('Lỗi khi cập nhật dự án');
        }
    };

    const handleEditProject = (project) => {
        setProjectToEdit(project);
        // Use setTimeout to ensure state updates before modal opens
        setTimeout(() => {
            setIsProjectModalOpen(true);
        }, 0);
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            const res = await projectService.deleteProject(projectToDelete.id);
            if (res.ok) {
                toast.success('Xóa dự án thành công');
                fetchProjects();
            } else {
                toast.error(res.message || 'Lỗi khi xóa dự án');
            }
        } catch (error) {
            toast.error('Lỗi hệ thống');
        } finally {
            setIsConfirmDeleteOpen(false);
            setProjectToDelete(null);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Dự án',
            className: 'w-[300px] pl-6',
            render: (project) => {
                const isHidden = hiddenProjects.has(project.id);
                return (
                    <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1 mt-0.5 bg-secondary/30 p-1 rounded-md border border-border/50 shadow-sm mr-1">
                            {/* Visibility Toggle */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleProjectVisibility(project.id);
                                }}
                                className="text-muted-foreground hover:text-green-600 p-1.5 rounded-sm hover:bg-green-50 transition-colors"
                                title={isHidden ? "Hiện dự án" : "Ẩn dự án"}
                            >
                                {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            {!isHidden && permissions?.canEditProject && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditProject(project);
                                        }}
                                        className="text-muted-foreground hover:text-orange-600 p-1.5 rounded-sm hover:bg-orange-50 transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(project);
                                        }}
                                        className="text-muted-foreground hover:text-red-600 p-1.5 rounded-sm hover:bg-red-50 transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Completely hide content if isHidden is true */}
                        {!isHidden && (
                            <div className="transition-all flex-1 min-w-0">
                                <p className="font-medium truncate">{project.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {project.description}
                                </p>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'manager',
            header: 'Người quản lý',
            className: 'w-[140px]',
            render: (project) => {
                if (hiddenProjects.has(project.id)) return null;
                return (<div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                        {project.manager?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm truncate">{project.manager?.name || 'Chưa gán'}</span>
                </div>);
            },
        },
        {
            key: 'department',
            header: 'Phòng ban',
            className: 'w-[120px]',
            render: (project) => {
                if (hiddenProjects.has(project.id)) return null;
                return (<span className="text-sm truncate block">{project.department || 'Chưa gán'}</span>);
            },
        },
        {
            key: 'timeline',
            header: 'Thời gian',
            className: 'w-[160px]',
            render: (project) => {
                if (hiddenProjects.has(project.id)) return null;
                return (<span className="text-sm whitespace-nowrap">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'Chưa xác định'} -{' '}
                    {project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                </span>);
            },
        },
        {
            key: 'progress',
            header: 'Tiến độ',
            className: 'w-[180px]', // Increased width for bar + text
            render: (project) => {
                if (hiddenProjects.has(project.id)) return null;
                const value = project.progress || 0;
                let colorClass = 'bg-blue-600';
                if (value >= 100) colorClass = 'bg-green-500';
                else if (value < 25) colorClass = 'bg-red-500';
                else if (value < 50) colorClass = 'bg-yellow-500';

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${colorClass}`}
                                style={{ width: `${value}%` }}
                            />
                        </div>
                        <span className="text-sm text-muted-foreground w-10 text-right">{value}%</span>
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: 'Trạng thái',
            className: 'w-[140px]',
            render: (project) => {
                if (hiddenProjects.has(project.id)) return null;

                const status = project.status || 'Pending';
                // Try to find label directly or case-insensitive match
                let label = projectStatusLabels[status] || projectStatusLabels[status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()] || status;

                // Try to find style directly or case-insensitive match
                let badgeStyle = projectStatusStyles[status] || projectStatusStyles[status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()] || 'bg-gray-100 text-gray-700';

                return (
                    <div className="flex justify-start">
                        <Badge className={`rounded-full px-3 py-1 font-normal border-0 ${badgeStyle}`}>
                            {label}
                        </Badge>
                    </div>
                );
            },
        },
    ];

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        const aHidden = hiddenProjects.has(a.id);
        const bHidden = hiddenProjects.has(b.id);
        if (aHidden && !bHidden) return 1;
        if (!aHidden && bHidden) return -1;
        return 0;
    });

    return (<div>
        <PageHeader
            title="Danh sách Dự án"
            description="Quản lý và theo dõi tất cả dự án của trung tâm"
            actions={permissions?.canCreateProject && (<Button onClick={() => setIsProjectModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo dự án mới
            </Button>)}
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
            onRowClick={(project) => {
                if (hiddenProjects.has(project.id)) return;
                navigate(`/projects/${project.id}`);
            }}
            rowClassName={(project) => hiddenProjects.has(project.id) ? 'bg-muted/30 !cursor-default' : ''}
            emptyMessage="Không có dự án nào"
        />

        <ProjectFormModal
            open={isProjectModalOpen}
            onOpenChange={(open) => {
                setIsProjectModalOpen(open);
                if (!open) setProjectToEdit(null);
            }}
            onSubmit={projectToEdit ? handleUpdateProject : handleCreateProject}
            initialData={projectToEdit}
            mode={projectToEdit ? 'edit' : 'create'}
        />

        <ConfirmDialog
            open={isConfirmDeleteOpen}
            onOpenChange={setIsConfirmDeleteOpen}
            title="Xác nhận xóa dự án"
            description="Bạn có chắc chắn muốn xóa dự án này không? Hành động này sẽ xóa dự án khỏi danh sách."
            onConfirm={handleConfirmDelete}
            confirmText="Xóa dự án"
            variant="destructive"
        />
    </div>);
}
