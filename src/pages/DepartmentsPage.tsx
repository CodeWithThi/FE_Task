import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Department } from '@/types';
import { Plus, Edit, Users, Lock, Unlock } from 'lucide-react';

const mockDepartments: Department[] = [
  { id: '1', name: 'Bộ môn Toán', code: 'TOAN', memberCount: 8, status: 'active' },
  { id: '2', name: 'Bộ môn Lý', code: 'LY', memberCount: 6, status: 'active' },
  { id: '3', name: 'Bộ môn Hóa', code: 'HOA', memberCount: 5, status: 'active' },
  { id: '4', name: 'Bộ môn Văn', code: 'VAN', memberCount: 7, status: 'active' },
  { id: '5', name: 'Bộ môn Anh', code: 'ANH', memberCount: 6, status: 'active' },
  { id: '6', name: 'Phòng CNTT', code: 'CNTT', memberCount: 4, status: 'active' },
  { id: '7', name: 'Phòng Đào tạo', code: 'DAOTAO', memberCount: 5, status: 'active' },
  { id: '8', name: 'Ban Điều hành', code: 'DIEUHANH', memberCount: 3, status: 'active' },
  { id: '9', name: 'Bộ môn Sinh', code: 'SINH', memberCount: 0, status: 'inactive' },
];

export default function DepartmentsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Tên phòng ban',
      render: (dept) => (
        <div>
          <p className="font-medium">{dept.name}</p>
          <p className="text-sm text-muted-foreground">Mã: {dept.code}</p>
        </div>
      ),
    },
    {
      key: 'memberCount',
      header: 'Số nhân sự',
      render: (dept) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{dept.memberCount} người</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (dept) => (
        <Badge
          variant={dept.status === 'active' ? 'default' : 'secondary'}
          className={dept.status === 'active' ? 'bg-status-completed' : 'bg-muted'}
        >
          {dept.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (dept) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            {dept.status === 'active' ? (
              <Lock className="w-4 h-4 text-status-overdue" />
            ) : (
              <Unlock className="w-4 h-4 text-status-completed" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Phòng ban"
        description="Quản lý các phòng ban và bộ môn trong trung tâm"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm phòng ban
          </Button>
        }
      />

      <DataTable
        data={mockDepartments}
        columns={columns}
        keyExtractor={(dept) => dept.id}
        emptyMessage="Không có phòng ban nào"
      />

      {/* Create Department Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm phòng ban mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo phòng ban mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên phòng ban</Label>
              <Input id="name" placeholder="VD: Bộ môn Tin học" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Mã phòng ban</Label>
              <Input id="code" placeholder="VD: TINHOC" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Tạo phòng ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
