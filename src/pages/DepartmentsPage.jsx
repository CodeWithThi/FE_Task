import { useState, useEffect } from 'react';
import { usePermissions } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Users, Lock } from 'lucide-react'; // Removing Unlock if uncertain
import { departmentService } from '@/services/departmentService';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const permissions = usePermissions();
  const [selectedDept, setSelectedDept] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("Rendering DepartmentsPage");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getDepartments();
      if (res.ok) {
        console.log("Fetched Departments:", res.data);
        setDepartments(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách phòng ban");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (dept) => {
    try {
      const newStatus = dept.status === 'active' ? 'inactive' : 'active';
      const res = await departmentService.updateDepartment(dept.id, { status: newStatus });
      if (res.ok) {
        toast.success(`Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} phòng ban`);
        fetchDepartments();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Tên phòng ban',
      render: (dept) => (<div>
        <p className="font-medium">{dept.name}</p>
        <p className="text-sm text-muted-foreground">Mã: {dept.code || dept.id}</p>
      </div>),
    },
    {
      key: 'memberCount',
      header: 'Số nhân sự',
      render: (dept) => (<div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span>{dept.memberCount || 0} người</span>
      </div>),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (dept) => (<Badge variant="outline" className={dept.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}>
        {dept.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
      </Badge>),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (dept) => {
        if (!permissions?.canManageDepartments) return null;
        const hasDependencies = (dept.memberCount > 0) || (dept.projectCount > 0);

        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={hasDependencies}
              onClick={() => {
                setSelectedDept(dept);
                setShowEditDialog(true);
              }}
              className={hasDependencies ? "opacity-50 cursor-not-allowed" : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateStatus(dept)}
              className={dept.status === 'active' ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
            >
              {dept.status === 'active' ? (<Lock className="w-4 h-4" />) : (<Lock className="w-4 h-4 text-muted-foreground" />)}
            </Button>
          </div>
        );
      },
    },
  ];

  return (<div>
    <PageHeader
      title="Quản lý Phòng ban"
      description="Quản lý các phòng ban và bộ môn trong trung tâm"
      actions={
        permissions?.canManageDepartments && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm phòng ban
          </Button>
        )
      }
    />

    <DataTable data={departments} columns={columns} keyExtractor={(dept) => dept.id} emptyMessage="Không có phòng ban nào" />

    {/* Create Department Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm phòng ban mới</DialogTitle>
          <DialogDescription>
            Nhập tên và mã phòng ban (tùy chọn) để tạo mới.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const name = formData.get('name');
          const code = formData.get('code');

          if (!name) {
            toast.error("Vui lòng nhập tên phòng ban");
            return;
          }

          try {
            const payload = { name };
            if (code) payload.id = code;

            const res = await departmentService.createDepartment(payload);
            if (res.ok) {
              toast.success(res.message);
              setShowCreateDialog(false);
              fetchDepartments();
            } else {
              toast.error(res.message);
            }
          } catch (error) {
            toast.error("Lỗi khi tạo phòng ban");
          }
        }}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên phòng ban *</Label>
              <Input id="name" name="name" placeholder="VD: Bộ môn Tin học" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Mã phòng ban (Tùy chọn)</Label>
              <Input id="code" name="code" placeholder="VD: BM01 (Để trống sẽ tự tạo)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button type="submit">
              Tạo phòng ban
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Edit Department Dialog */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật phòng ban</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin phòng ban
          </DialogDescription>
        </DialogHeader>
        {selectedDept && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const name = formData.get('name');

            if (!name) {
              toast.error("Vui lòng nhập tên phòng ban");
              return;
            }

            try {
              const res = await departmentService.updateDepartment(selectedDept.id, { name });
              if (res.ok) {
                toast.success(res.message);
                setShowEditDialog(false);
                fetchDepartments();
              } else {
                toast.error(res.message);
              }
            } catch (error) {
              toast.error("Lỗi khi cập nhật phòng ban");
            }
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên phòng ban *</Label>
                <Input id="edit-name" name="name" defaultValue={selectedDept.name} required />
              </div>
              <div className="space-y-2">
                <Label>Mã phòng ban</Label>
                <Input value={selectedDept.id} disabled className="bg-muted" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button type="submit">
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  </div>);
}
