import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
const mockLogs = [
    { id: '1', user: { id: '1', name: 'Nguyễn Văn Admin', email: '', role: 'admin', department: 'CNTT', status: 'active' }, action: 'Đăng nhập', target: 'Hệ thống', timestamp: '2024-01-11T10:30:00', details: 'IP: 192.168.1.1' },
    { id: '2', user: { id: '2', name: 'Trần Thị B', email: '', role: 'pmo', department: 'PMO', status: 'active' }, action: 'Tạo dự án', target: 'Kế hoạch Q2', timestamp: '2024-01-11T10:15:00' },
    { id: '3', user: { id: '1', name: 'Nguyễn Văn Admin', email: '', role: 'admin', department: 'CNTT', status: 'active' }, action: 'Thêm người dùng', target: 'Lê Văn C', timestamp: '2024-01-11T09:45:00' },
    { id: '4', user: { id: '3', name: 'Lê Văn C', email: '', role: 'staff', department: 'Toán', status: 'active' }, action: 'Cập nhật tiến độ', target: 'Soạn giáo án chương 5', timestamp: '2024-01-11T09:30:00', details: '60% → 80%' },
    { id: '5', user: { id: '4', name: 'Phạm Thị D', email: '', role: 'leader', department: 'Toán', status: 'active' }, action: 'Phê duyệt', target: 'Bài tập thực hành', timestamp: '2024-01-11T09:00:00' },
    { id: '6', user: { id: '3', name: 'Lê Văn C', email: '', role: 'staff', department: 'Toán', status: 'active' }, action: 'Gửi duyệt', target: 'Bài tập thực hành', timestamp: '2024-01-11T08:30:00' },
    { id: '7', user: { id: '2', name: 'Trần Thị B', email: '', role: 'pmo', department: 'PMO', status: 'active' }, action: 'Gán công việc', target: 'Chuẩn bị slide', timestamp: '2024-01-10T17:00:00', details: 'Gán cho: Hoàng Văn E' },
    { id: '8', user: { id: '1', name: 'Nguyễn Văn Admin', email: '', role: 'admin', department: 'CNTT', status: 'active' }, action: 'Cập nhật cấu hình', target: 'Ngưỡng cảnh báo', timestamp: '2024-01-10T16:30:00', details: '2 ngày → 3 ngày' },
    { id: '9', user: { id: '5', name: 'Hoàng Văn E', email: '', role: 'staff', department: 'Lý', status: 'active' }, action: 'Từ chối', target: 'Họp đánh giá', timestamp: '2024-01-10T15:00:00', details: 'Lý do: Trùng lịch' },
    { id: '10', user: { id: '4', name: 'Phạm Thị D', email: '', role: 'leader', department: 'Toán', status: 'active' }, action: 'Trả lại', target: 'Báo cáo tuần', timestamp: '2024-01-10T14:00:00', details: 'Lý do: Cần bổ sung số liệu' },
];
const actionOptions = [
    { value: 'login', label: 'Đăng nhập' },
    { value: 'create', label: 'Tạo mới' },
    { value: 'update', label: 'Cập nhật' },
    { value: 'delete', label: 'Xóa' },
    { value: 'approve', label: 'Phê duyệt' },
    { value: 'reject', label: 'Từ chối' },
];
export default function LogsPage() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const columns = [
        {
            key: 'timestamp',
            header: 'Thời gian',
            render: (log) => (<span className="text-sm">
          {new Date(log.timestamp).toLocaleString('vi-VN')}
        </span>),
        },
        {
            key: 'user',
            header: 'Người dùng',
            render: (log) => (<div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
            {log.user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{log.user.name}</p>
            <p className="text-xs text-muted-foreground">{log.user.department}</p>
          </div>
        </div>),
        },
        {
            key: 'action',
            header: 'Hành động',
            render: (log) => (<Badge variant="outline">{log.action}</Badge>),
        },
        {
            key: 'target',
            header: 'Đối tượng',
            render: (log) => (<span className="text-sm">{log.target}</span>),
        },
        {
            key: 'details',
            header: 'Chi tiết',
            render: (log) => (<span className="text-sm text-muted-foreground">
          {log.details || '-'}
        </span>),
        },
    ];
    const filteredLogs = mockLogs.filter((log) => {
        const matchesSearch = log.user.name.toLowerCase().includes(search.toLowerCase()) ||
            log.target.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });
    return (<div>
      <PageHeader title="Nhật ký Hệ thống" description="Theo dõi các hoạt động trong hệ thống"/>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Tìm kiếm theo người dùng hoặc đối tượng..." filters={[
            {
                key: 'action',
                label: 'Loại hành động',
                options: actionOptions,
                value: actionFilter,
                onChange: setActionFilter,
            },
        ]}/>

      <DataTable data={filteredLogs} columns={columns} keyExtractor={(log) => log.id} emptyMessage="Không có nhật ký nào"/>
    </div>);
}
