import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable } from '@/components/common/DataTable';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { roleLabels } from '@/types';
import { Plus, Edit, Lock, Unlock } from 'lucide-react';
import { accountService } from '@/services/accountService';
import { departmentService } from '@/services/departmentService';
import { toast } from 'sonner';

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        accountService.getAccounts(),
        departmentService.getDepartments()
      ]);

      if (usersRes.ok) {
        setUsers(usersRes.data);
      } else {
        toast.error('Không thể tải danh sách người dùng');
      }

      if (deptsRes.ok) {
        setDepartments(deptsRes.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Người dùng',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {(user.name || user.username || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email || user.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (user) => (
        <Badge variant="outline">
          {roleLabels[user.role] || user.role}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      render: (user) => (
        <span className="text-sm">{user.departmentName || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (user) => (
        <Badge
          variant={user.isActive ? 'default' : 'secondary'}
          className={user.isActive ? 'bg-status-completed' : 'bg-muted'}
        >
          {user.isActive ? 'Hoạt động' : 'Đã khóa'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (user) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            {user.isActive ? (
              <Lock className="w-4 h-4 text-status-overdue" />
            ) : (
              <Unlock className="w-4 h-4 text-status-completed" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? user.isActive : !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <PageHeader
        title="Quản lý Nhân sự"
        description="Quản lý người dùng và phân quyền hệ thống"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm người dùng..."
        filters={[
          {
            key: 'role',
            label: 'Vai trò',
            options: roleOptions,
            value: roleFilter,
            onChange: setRoleFilter,
          },
          {
            key: 'status',
            label: 'Trạng thái',
            options: [
              { value: 'active', label: 'Hoạt động' },
              { value: 'locked', label: 'Đã khóa' },
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

      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(user) => user.id}
        emptyMessage="Không có người dùng nào"
      />

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo tài khoản mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@trungtam.edu.vn" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select>
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
              <Label htmlFor="department">Phòng ban</Label>
              <Select>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {departments.map((dept) => (
                    <SelectItem key={dept.D_ID || dept.id} value={dept.D_ID || dept.id}>
                      {dept.D_Name || dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
