import { useState, useEffect } from 'react';
import { PageHeader } from '@core/components/common/PageHeader';
import { FilterBar } from '@core/components/common/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, } from 'recharts';
import { Download, FileText, BarChart3, PieChartIcon, TrendingUp, Loader2 } from 'lucide-react';
import { dashboardService } from '@core/services/dashboardService';

// Default Colors
const COLORS = {
  completed: 'hsl(142, 71%, 45%)',
  in_progress: 'hsl(217, 91%, 50%)',
  pending: 'hsl(262, 83%, 58%)',
  overdue: 'hsl(0, 84%, 60%)',
  high: 'hsl(0, 84%, 60%)',
  medium: 'hsl(45, 93%, 47%)',
  low: 'hsl(142, 71%, 45%)'
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    statusData: [],
    priorityData: [],
    departmentData: [],
    projectData: [], // Mock or need API
    individualData: [], // Mock or need API
    trendData: [] // Mock or need API
  });

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getStats('reports');
      if (res.ok && res.data) {
        // Transform API data to Chart Format
        const backendStats = res.data;

        // 1. Status Data
        const statusData = (backendStats.statusData || []).map(s => ({
          ...s,
          color: COLORS[s.name] || COLORS.pending
        }));

        // 2. Priority Data
        const priorityData = (backendStats.tasksByPriority || []).map(p => ({
          name: p.priority,
          value: p.count,
          color: p.priority === 'High' ? COLORS.high : p.priority === 'Medium' ? COLORS.medium : COLORS.low
        }));

        // 3. Department Data
        const departmentData = backendStats.departmentData || [];

        // Mocks for missing parts (to preserve UI layout)
        const projectData = [
          { name: 'Chương trình Hè', progress: 75 },
          { name: 'Đào tạo GV', progress: 100 },
          { name: 'CNTT', progress: 45 },
          { name: 'Năm học mới', progress: 20 },
        ];
        const individualData = [
          { name: 'Nguyễn Văn A', completed: 15, pending: 3, overdue: 1 },
          { name: 'Trần Thị B', completed: 12, pending: 5, overdue: 0 },
          { name: 'Lê Văn C', completed: 10, pending: 4, overdue: 2 },
        ];
        const trendData = [
          { month: 'T1', completed: 20, created: 25 },
          { month: 'T2', completed: 28, created: 30 },
          { month: 'T3', completed: 35, created: 32 },
        ];

        setData({
          statusData,
          priorityData,
          departmentData,
          projectData, // fallback
          individualData, // fallback
          trendData // fallback
        });
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (<div>
    <PageHeader title="Báo cáo" description="Thống kê và phân tích dữ liệu công việc" actions={<div className="flex gap-2">
      <Button variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
      <Button variant="outline">
        <FileText className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
    </div>} />

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

    {/* Row 1 */}
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
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.priorityData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Row 2 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Hiệu suất theo Phòng ban
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
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
        </CardContent>
      </Card>

      {/* Individual Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Hiệu suất theo Cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.individualData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" name="Hoàn thành" fill="hsl(142, 71%, 45%)" stackId="a" />
              <Bar dataKey="pending" name="Đang làm" fill="hsl(217, 91%, 50%)" stackId="a" />
              <Bar dataKey="overdue" name="Trễ hạn" fill="hsl(0, 84%, 60%)" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Row 3 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Progress by Project */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Tiến độ theo Dự án
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.projectData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="progress" name="Tiến độ" fill="hsl(217, 91%, 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Xu hướng công việc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" name="Tạo mới" stroke="hsl(217, 91%, 50%)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="completed" name="Hoàn thành" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>);
}

