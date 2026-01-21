import { useState, useEffect } from 'react';
import { PageHeader } from '@core/components/common/PageHeader';
import { FilterBar } from '@core/components/common/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, } from 'recharts';
import { Download, FileText, BarChart3, PieChartIcon, Loader2 } from 'lucide-react';
import { dashboardService } from '@core/services/dashboardService';

// Vietnamese label mappings
const STATUS_LABELS = {
  'not-assigned': 'Chưa nhận',
  'in-progress': 'Đang làm',
  'running': 'Đang làm',
  'waiting-approval': 'Chờ duyệt',
  'returned': 'Trả lại',
  'completed': 'Hoàn thành',
  'overdue': 'Trễ hạn',
};

const PRIORITY_LABELS = {
  'high': 'Cao',
  'High': 'Cao',
  'medium': 'Trung bình',
  'Medium': 'Trung bình',
  'low': 'Thấp',
  'Low': 'Thấp',
};

// Default Colors
const COLORS = {
  completed: 'hsl(142, 71%, 45%)',
  'in-progress': 'hsl(217, 91%, 50%)',
  'running': 'hsl(217, 91%, 50%)',
  'not-assigned': 'hsl(262, 83%, 58%)',
  'waiting-approval': 'hsl(45, 93%, 47%)',
  'returned': 'hsl(25, 95%, 53%)',
  overdue: 'hsl(0, 84%, 60%)',
  high: 'hsl(0, 84%, 60%)',
  medium: 'hsl(45, 93%, 47%)',
  low: 'hsl(142, 71%, 45%)',
  High: 'hsl(0, 84%, 60%)',
  Medium: 'hsl(45, 93%, 47%)',
  Low: 'hsl(142, 71%, 45%)',
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    statusData: [],
    priorityData: [],
    departmentData: [],
  });

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getStats('reports');
      if (res.ok && res.data) {
        const backendStats = res.data;

        // 1. Status Data - Map to Vietnamese labels
        const statusData = (backendStats.statusData || []).map(s => ({
          name: STATUS_LABELS[s.name] || s.name,
          value: s.value,
          color: COLORS[s.name] || COLORS['not-assigned']
        }));

        // 2. Priority Data - Map to Vietnamese labels
        const priorityData = (backendStats.tasksByPriority || []).map(p => ({
          name: PRIORITY_LABELS[p.priority] || p.priority,
          value: p.count,
          color: COLORS[p.priority] || COLORS.medium
        }));

        // 3. Department Data
        const departmentData = (backendStats.departmentData || []).map(d => ({
          name: d.name,
          total: d.total || 0,
          completed: d.completed || 0,
          overdue: d.overdue || 0,
        }));

        setData({
          statusData,
          priorityData,
          departmentData,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
        <span className="ml-2 text-muted-foreground">Đang tải báo cáo...</span>
      </div>
    );
  }

  const hasStatusData = data.statusData && data.statusData.length > 0;
  const hasPriorityData = data.priorityData && data.priorityData.length > 0;
  const hasDepartmentData = data.departmentData && data.departmentData.length > 0;

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = '';

    // Status Data
    csvContent += 'BÁO CÁO THEO TRẠNG THÁI\n';
    csvContent += 'Trạng thái,Số lượng\n';
    data.statusData.forEach(item => {
      csvContent += `${item.name},${item.value}\n`;
    });
    csvContent += '\n';

    // Priority Data
    csvContent += 'BÁO CÁO THEO ĐỘ ƯU TIÊN\n';
    csvContent += 'Độ ưu tiên,Số lượng\n';
    data.priorityData.forEach(item => {
      csvContent += `${item.name},${item.value}\n`;
    });
    csvContent += '\n';

    // Department Data
    csvContent += 'BÁO CÁO THEO PHÒNG BAN\n';
    csvContent += 'Phòng ban,Tổng,Hoàn thành,Trễ hạn\n';
    data.departmentData.forEach(item => {
      csvContent += `${item.name},${item.total},${item.completed},${item.overdue}\n`;
    });

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao_cao_cong_viec_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Export to PDF (using browser print)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader
        title="Báo cáo"
        description="Thống kê và phân tích dữ liệu công việc"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Xuất CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              Xuất PDF
            </Button>
          </div>
        }
      />

      <FilterBar filters={[
        {
          key: 'timeRange',
          label: 'Khoảng thời gian',
          options: [
            { value: 'week', label: 'Tuần này' },
            { value: 'month', label: 'Tháng này' },
            { value: 'quarter', label: 'Quý này' },
            { value: 'year', label: 'Năm nay' },
          ],
          value: timeRange,
          onChange: setTimeRange,
        },
      ]} />

      {/* Row 1: Status & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Phân bố theo Trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasStatusData ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Phân bố theo Độ ưu tiên
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasPriorityData ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Department Performance */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Hiệu suất theo Phòng ban
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasDepartmentData ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Tổng" fill="hsl(217, 91%, 80%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Hoàn thành" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overdue" name="Trễ hạn" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Chưa có dữ liệu phòng ban
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

