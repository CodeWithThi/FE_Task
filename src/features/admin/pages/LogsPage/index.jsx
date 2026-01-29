import { useState, useEffect } from 'react';
import { PageHeader } from '@core/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@core/components/ui/table';
import { Input } from '@core/components/ui/input';
import { Button } from '@core/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select';
import { logService } from '@core/services/logService';
import { Loader2, Search, Calendar as CalendarIcon, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/avatar';
import { Badge } from '@core/components/ui/badge';

// System Log Action Colors - chỉ dành cho nhật ký hệ thống
const actionColors = {
  // Authentication
  'login': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'logout': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  'login_failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'password_reset': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'password_change': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',

  // User Management
  'user_create': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'user_update': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'user_delete': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'user_restore': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',

  // Configuration
  'config_change': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'role_change': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  'permission_change': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',

  // Department
  'department_create': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  'department_update': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  'department_delete': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',

  // Project
  'create_project': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'update_project': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'delete_project': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Action Labels for display
const actionLabels = {
  'login': 'Đăng nhập',
  'logout': 'Đăng xuất',
  'login_failed': 'Đăng nhập thất bại',
  'password_reset': 'Đặt lại mật khẩu',
  'password_change': 'Đổi mật khẩu',
  'user_create': 'Tạo người dùng',
  'user_update': 'Cập nhật người dùng',
  'user_delete': 'Xóa người dùng',
  'user_restore': 'Khôi phục người dùng',
  'config_change': 'Thay đổi cấu hình',
  'role_change': 'Thay đổi vai trò',
  'permission_change': 'Thay đổi quyền',
  'department_create': 'Tạo phòng ban',
  'department_update': 'Cập nhật phòng ban',
  'department_delete': 'Xóa phòng ban',
  'create_project': 'Tạo dự án',
  'update_project': 'Cập nhật dự án',
  'delete_project': 'Xóa dự án',
};

export default function LogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    type: 'all',
    actorId: '',
    startDate: '',
    endDate: ''
  });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const query = {};
      if (filters.type && filters.type !== 'all') query.type = filters.type;

      const res = await logService.getLogs(page, pagination.limit, query);
      if (res.ok) {
        setLogs(res.data);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchLogs(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký Hệ thống"
        description="Theo dõi các hoạt động trong hệ thống"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select
                value={filters.type}
                onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Loại hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  <SelectItem value="login">Đăng nhập</SelectItem>
                  <SelectItem value="logout">Đăng xuất</SelectItem>
                  <SelectItem value="password_change">Đổi mật khẩu</SelectItem>
                  <SelectItem value="user_create">Tạo người dùng</SelectItem>
                  <SelectItem value="user_update">Cập nhật người dùng</SelectItem>
                  <SelectItem value="user_delete">Xóa người dùng</SelectItem>
                  <SelectItem value="user_restore">Khôi phục người dùng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="icon" onClick={() => fetchLogs(pagination.page)}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Chi tiết</TableHead>
                <TableHead>Đối tượng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Không có nhật ký nào
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.LogID}>
                    <TableCell className="whitespace-nowrap w-[180px]">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {format(new Date(log.CreatedAt), 'HH:mm:ss')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.CreatedAt), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={log.Actor?.Member?.Avatar} />
                          <AvatarFallback>{(log.Actor?.UserName || 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{log.Actor?.Member?.FullName || log.Actor?.UserName || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">ID: {log.ActorId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={actionColors[log.Action] || ''}>
                        {actionLabels[log.Action] || log.Action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{log.Message}</span>
                    </TableCell>
                    <TableCell>
                      {log.TargetType && (
                        <Badge variant="outline" className="text-xs">
                          {log.TargetType}: {log.TargetId}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {/* Pagination Controls */}
        <div className="flex items-center justify-end p-4 border-t gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Sau
          </Button>
        </div>
      </Card>
    </div>
  );
}
