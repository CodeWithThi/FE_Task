import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePermissions } from '@core/contexts/AuthContext';
import { PageHeader } from '@core/components/common/PageHeader';
import { FilterBar } from '@core/components/common/FilterBar';
import { DataTable } from '@core/components/common/DataTable';
import { LoadingScreen } from '@core/components/common/LoadingScreen';
import { Button } from '@core/components/ui/button';
import { Badge } from '@core/components/ui/badge';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@core/components/ui/dialog';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@core/components/ui/alert-dialog';
import { Plus, Edit, Trash2, RotateCcw, Building2 } from 'lucide-react';
import { userService } from '@core/services/userService';
import { departmentService } from '@core/services/departmentService';
import { toast } from 'sonner';
import { ROLES } from '@core/config/permissions';

// Role options for standard roles
const roleOptions = [
  { value: 'R_001', label: 'Quản trị hệ thống' },
  { value: 'R_004', label: 'Ban giám đốc' },
  { value: 'R_003', label: 'Ban quản lý (PMO)' },
  { value: 'R_005', label: 'Trưởng nhóm' },
  { value: 'R_006', label: 'Nhân viên' },
];

const roleLabels = {
  R_001: 'Quản trị hệ thống',
  R_002: 'Hệ thống', // Internal
  R_004: 'Ban giám đốc',
  R_003: 'Ban quản lý (PMO)',
  R_005: 'Trưởng nhóm',
  R_006: 'Nhân viên',
  // Backward compatibility just in case
  admin: 'Quản trị hệ thống',
  director: 'Ban giám đốc',
  pmo: 'Ban quản lý (PMO)',
  leader: 'Trưởng nhóm',
  staff: 'Nhân viên',
};

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = usePermissions();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Initialize from URL
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Modals state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, debouncedSearch, roleFilter, statusFilter]);

  // Sync to URL
  useEffect(() => {
    const params = {};
    if (roleFilter !== 'all') params.role = roleFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    setSearchParams(params);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined, // Use debounced search
        roleId: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const [usersRes, deptsRes] = await Promise.all([
        userService.getUsers(params),
        departmentService.getDepartments()
      ]);

      if (usersRes.ok) {
        setUsers(usersRes.data || []);
        if (usersRes.pagination) {
          setPagination(usersRes.pagination);
        }
      } else {
        toast.error(usersRes.message || 'Không thể tải danh sách người dùng');
      }

      if (deptsRes.ok) {
        setDepartments(deptsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      username: formData.get('username'),
      password: formData.get('password'),
      email: formData.get('email'),
      fullName: formData.get('fullName'),
      phoneNumber: formData.get('phoneNumber') || '',
      roleId: formData.get('roleId'),
      departmentId: formData.get('departmentId'),
    };

    try {
      const res = await userService.createUser(data);
      if (res.ok) {
        toast.success(res.message || 'Tạo người dùng thành công');
        setShowCreateDialog(false);
        fetchData();
        e.target.reset();
      } else {
        toast.error(res.message || 'Không thể tạo người dùng');
      }
    } catch (err) {
      console.error('Create user error:', err);
      toast.error('Lỗi khi tạo người dùng');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      fullName: formData.get('fullName'),
      phoneNumber: formData.get('phoneNumber'),
      roleId: formData.get('roleId'),
      departmentId: formData.get('departmentId'),
      status: formData.get('status'),
    };

    try {
      const res = await userService.updateUser(selectedUser.aid, data);
      if (res.ok) {
        toast.success(res.message || 'Cập nhật người dùng thành công');
        setShowEditDialog(false);
        setSelectedUser(null);
        fetchData();
      } else {
        toast.error(res.message || 'Không thể cập nhật người dùng');
      }
    } catch (err) {
      console.error('Update user error:', err);
      toast.error('Lỗi khi cập nhật người dùng');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await userService.deleteUser(selectedUser.aid);
      if (res.ok) {
        toast.success(res.message || 'Xóa người dùng thành công');
        setShowDeleteDialog(false);
        setSelectedUser(null);
        fetchData();
      } else {
        toast.error(res.message || 'Không thể xóa người dùng');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleRestoreUser = async (user) => {
    try {
      const res = await userService.restoreUser(user.aid);
      if (res.ok) {
        toast.success(res.message || 'Khôi phục người dùng thành công');
        fetchData();
      } else {
        toast.error(res.message || 'Không thể khôi phục người dùng');
      }
    } catch (err) {
      console.error('Restore user error:', err);
      toast.error('Lỗi khi khôi phục người dùng');
    }
  };

  // const permissions = usePermissions(); <- Removed duplicate declaration

  // ... (existing code)

  // Filter active departments for dropdown
  const activeDepartments = departments.filter(d => d.status === 'active');

  const columns = [
    {
      key: 'userName',
      header: 'Tên đăng nhập',
      className: 'w-[150px] text-left',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback>{user.userName?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.userName}</span>
        </div>
      ),
    },
    {
      key: 'fullName',
      header: 'Họ và tên',
      className: 'w-[180px] text-left',
      render: (user) => user.member?.fullName || user.fullName || '---'
    },
    {
      key: 'email',
      header: 'Email',
      className: 'w-[220px] text-left',
    },
    {
      key: 'role',
      header: 'Vai trò',
      className: 'w-[120px] text-center',
      render: (user) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {user.role?.name || user.roleId || roleLabels[user.role?.id] || 'N/A'}
        </Badge>
      )
    },
    {
      key: 'department',
      header: 'Phòng ban',
      className: 'w-[150px] text-center',
      render: (user) => (
        <div className="flex items-center gap-1 text-muted-foreground justify-center">
          <Building2 className="w-3 h-3" />
          <span>{user.member?.departmentName || '---'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-[130px] text-center',
      render: (user) => (
        <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
          {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (user) => {
        if (!permissions?.canManageUsers) return null;

        return (
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => { setSelectedUser(user); setShowEditDialog(true); }}>
              <Edit className="w-4 h-4" />
            </Button>
            {user.isDeleted ? (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleRestoreUser(user)}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      }
    }
  ];



  return (
    <div>
      <PageHeader
        title="Quản lý Người dùng"
        description="Quản lý người dùng và phân quyền hệ thống"
        actions={
          permissions?.canManageUsers && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </Button>
          )
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, email, username..."
        filters={[
          {
            key: 'role',
            label: 'Vai trò',
            options: roleOptions.map(r => ({ value: r.value, label: r.label })),
            value: roleFilter,
            onChange: setRoleFilter,
          },
          {
            key: 'status',
            label: 'Trạng thái',
            options: [
              { value: 'active', label: 'Hoạt động' },
              { value: 'inactive', label: 'Ngưng hoạt động' },
              { value: 'deleted', label: 'Đã nghỉ việc' },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
        onClearFilters={() => {
          setRoleFilter('all');
          setStatusFilter('all');
        }}
      />


      <div className={loading ? 'opacity-50 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
        <DataTable
          data={users}
          columns={columns}
          keyExtractor={(user) => user.aid}
          emptyMessage={loading ? "Đang tải dữ liệu..." : "Không có người dùng nào"}
          pagination={{
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
          }}
        />
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo tài khoản mới. Mật khẩu tạm thời sẽ được gửi qua email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập *</Label>
                <Input id="username" name="username" placeholder="nguyenvana" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input id="fullName" name="fullName" placeholder="Nguyễn Văn A" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="email@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input id="phoneNumber" name="phoneNumber" placeholder="0123456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleId">Vai trò *</Label>
                <Select name="roleId" required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Phòng ban *</Label>
                <Select name="departmentId" required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {activeDepartments.map((dept) => (
                      <SelectItem key={dept.D_ID || dept.id} value={dept.D_ID || dept.id}>
                        {dept.D_Name || dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowCreateDialog(false)}>
                Hủy
              </Button>
              <Button type="submit">
                Tạo người dùng
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cập nhật người dùng</DialogTitle>
              <DialogDescription>
                Chỉnh sửa thông tin người dùng
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tên đăng nhập</Label>
                  <Input value={selectedUser.userName} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Họ và tên</Label>
                  <Input
                    id="edit-fullName"
                    name="fullName"
                    defaultValue={selectedUser.member?.fullName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phoneNumber">Số điện thoại</Label>
                  <Input
                    id="edit-phoneNumber"
                    name="phoneNumber"
                    defaultValue={selectedUser.member?.phoneNumber}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-roleId">Vai trò</Label>
                  <Select name="roleId" defaultValue={selectedUser.role?.id}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-departmentId">Phòng ban</Label>
                  <Select name="departmentId" defaultValue={selectedUser.member?.departmentId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {activeDepartments.map((dept) => (
                        <SelectItem key={dept.D_ID || dept.id} value={dept.D_ID || dept.id}>
                          {dept.D_Name || dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select name="status" defaultValue={selectedUser.status}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => {
                  setShowEditDialog(false);
                  setSelectedUser(null);
                }}>
                  Hủy
                </Button>
                <Button type="submit">
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ngưng hoạt động</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn ngưng hoạt động nhân sự <strong>{selectedUser?.member?.fullName || selectedUser?.userName}</strong>?
              <br />
              Nhân sự sẽ được chuyển sang trạng thái <strong>Đã nghỉ việc</strong> và ẩn khỏi các danh sách phân công.
              {selectedUser?.member?.departmentName && (
                <div className="mt-2 text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                  <strong>Lưu ý:</strong> Nhân sự này đang thuộc phòng ban <strong>{selectedUser.member.departmentName}</strong>.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ngưng hoạt động
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

