import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, roleLabels, UserRole } from '@/types';
import { Plus, Edit, Lock, Unlock } from 'lucide-react';

const mockUsers: User[] = [
  { id: '1', name: 'Nguyễn Văn Admin', email: 'admin@trungtam.edu.vn', role: 'admin', department: 'Công nghệ thông tin', status: 'active' },
  { id: '2', name: 'Trần Thị Giám Đốc', email: 'giamdoc@trungtam.edu.vn', role: 'director', department: 'Ban giám đốc', status: 'active' },
  { id: '3', name: 'Lê Văn PMO', email: 'pmo@trungtam.edu.vn', role: 'pmo', department: 'Phòng điều phối', status: 'active' },
  { id: '4', name: 'Phạm Thị Leader', email: 'leader.toan@trungtam.edu.vn', role: 'leader', department: 'Bộ môn Toán', status: 'active' },
  { id: '5', name: 'Hoàng Văn Staff', email: 'staff.toan@trungtam.edu.vn', role: 'staff', department: 'Bộ môn Toán', status: 'active' },
  { id: '6', name: 'Nguyễn Thị Staff 2', email: 'staff2.toan@trungtam.edu.vn', role: 'staff', department: 'Bộ môn Toán', status: 'locked' },
  { id: '7', name: 'Trần Văn Leader Lý', email: 'leader.ly@trungtam.edu.vn', role: 'leader', department: 'Bộ môn Lý', status: 'active' },
  { id: '8', name: 'Lê Thị Staff Lý', email: 'staff.ly@trungtam.edu.vn', role: 'staff', department: 'Bộ môn Lý', status: 'active' },
];

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value,
  label,
}));

const departmentOptions = [
  { value: 'admin', label: 'Công nghệ thông tin' },
  { value: 'director', label: 'Ban giám đốc' },
  { value: 'pmo', label: 'Phòng điều phối' },
  { value: 'toan', label: 'Bộ môn Toán' },
  { value: 'ly', label: 'Bộ môn Lý' },
  { value: 'hoa', label: 'Bộ môn Hóa' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Người dùng',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (user) => (
        <Badge variant="outline">{roleLabels[user.role]}</Badge>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      render: (user) => (
        <span className="text-sm">{user.department}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (user) => (
        <Badge
          variant={user.status === 'active' ? 'default' : 'secondary'}
          className={user.status === 'active' ? 'bg-status-completed' : 'bg-muted'}
        >
          {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
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
            {user.status === 'active' ? (
              <Lock className="w-4 h-4 text-status-overdue" />
            ) : (
              <Unlock className="w-4 h-4 text-status-completed" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

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
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
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
