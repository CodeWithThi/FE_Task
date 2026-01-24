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

const actionColors = {
  'login': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'create_task': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'update_task': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'delete_task': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'create_project': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'task_completed': 'bg-green-100 text-green-800',
  'task_approved': 'bg-indigo-100 text-indigo-800'
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loại hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  <SelectItem value="login">Đăng nhập (Login)</SelectItem>
                  <SelectItem value="create_task">Tạo công việc</SelectItem>
                  <SelectItem value="update_task">Cập nhật công việc</SelectItem>
                  <SelectItem value="delete_task">Xóa công việc</SelectItem>
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
                        {log.Action}
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
