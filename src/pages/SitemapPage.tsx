import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft,
  ArrowRight,
  Home,
  LogIn,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Bell,
  BarChart3,
  Users,
  Building2,
  Settings,
  FileText,
  Shield,
  Eye,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Upload
} from 'lucide-react';

const sitemapData = [
  {
    title: 'Công khai',
    icon: Home,
    pages: [
      { name: 'Trang chủ', path: '/', description: 'Giới thiệu hệ thống' },
      { name: 'Đăng nhập', path: '/login', description: 'Xác thực người dùng' },
    ]
  },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    pages: [
      { name: 'Dashboard Admin', path: '/dashboard', description: 'Quản trị hệ thống', roles: ['admin'] },
      { name: 'Dashboard Giám đốc', path: '/dashboard', description: 'Tổng quan dự án & báo cáo', roles: ['director'] },
      { name: 'Dashboard PMO', path: '/dashboard', description: 'Quản lý dự án & tiến độ', roles: ['pmo'] },
      { name: 'Dashboard Leader', path: '/dashboard', description: 'Công việc nhóm & phê duyệt', roles: ['leader'] },
      { name: 'Dashboard Staff', path: '/dashboard', description: 'Công việc cá nhân', roles: ['staff'] },
    ]
  },
  {
    title: 'Quản lý Dự án',
    icon: FolderKanban,
    pages: [
      { name: 'Danh sách Dự án', path: '/projects', description: 'Xem tất cả dự án' },
      { name: 'Chi tiết Dự án', path: '/projects/:id', description: 'Thông tin, Main Task, thành viên' },
      { name: 'Tạo Dự án', path: '/projects/new', description: 'Tạo dự án mới', roles: ['pmo'] },
    ]
  },
  {
    title: 'Quản lý Công việc',
    icon: ListTodo,
    pages: [
      { name: 'Danh sách Công việc', path: '/tasks', description: 'Main Task & Subtask' },
      { name: 'Chi tiết Công việc', path: '/tasks/:id', description: '70% nội dung - 30% hành động' },
      { name: 'Tạo Main Task', path: '/tasks/new', description: 'Tạo công việc chính', roles: ['pmo'] },
      { name: 'Tạo Subtask', path: '/tasks/new-subtask', description: 'Tạo công việc con', roles: ['leader'] },
    ]
  },
  {
    title: 'Thông báo',
    icon: Bell,
    pages: [
      { name: 'Trung tâm Thông báo', path: '/reminders', description: 'Tất cả thông báo' },
      { name: 'Nhắc việc', path: '/reminders', description: 'Deadline sắp tới' },
    ]
  },
  {
    title: 'Báo cáo',
    icon: BarChart3,
    pages: [
      { name: 'Báo cáo tổng hợp', path: '/reports', description: 'Theo dự án, phòng ban', roles: ['director', 'pmo'] },
      { name: 'Xuất báo cáo', path: '/reports', description: 'PDF / CSV', roles: ['director', 'pmo'] },
    ]
  },
  {
    title: 'Nhân sự & Tổ chức',
    icon: Users,
    pages: [
      { name: 'Quản lý User', path: '/users', description: 'Danh sách người dùng', roles: ['admin', 'pmo'] },
      { name: 'Quản lý Phòng ban', path: '/departments', description: 'Cơ cấu tổ chức', roles: ['admin', 'pmo'] },
    ]
  },
  {
    title: 'Hệ thống',
    icon: Settings,
    pages: [
      { name: 'Cài đặt', path: '/settings', description: 'Cấu hình hệ thống', roles: ['admin'] },
      { name: 'Nhật ký', path: '/logs', description: 'Log hoạt động', roles: ['admin'] },
    ]
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Tạo Dự án',
    actor: 'PMO',
    icon: Plus,
    color: 'bg-blue-500',
    actions: ['Nhập thông tin dự án', 'Chọn phòng ban tham gia', 'Đặt deadline']
  },
  {
    step: 2,
    title: 'Tạo Main Task',
    actor: 'PMO',
    icon: ListTodo,
    color: 'bg-blue-500',
    actions: ['Mô tả công việc', 'Đặt độ ưu tiên', 'Gán cho Leader']
  },
  {
    step: 3,
    title: 'Leader Nhận việc',
    actor: 'Leader',
    icon: CheckCircle,
    color: 'bg-green-500',
    actions: ['Xem chi tiết', 'Nhận việc hoặc Từ chối', 'Lập kế hoạch']
  },
  {
    step: 4,
    title: 'Tạo Subtask',
    actor: 'Leader',
    icon: Edit,
    color: 'bg-green-500',
    actions: ['Chia nhỏ công việc', 'Gán nhân viên', 'Đặt deadline chi tiết']
  },
  {
    step: 5,
    title: 'Staff Thực hiện',
    actor: 'Staff',
    icon: Clock,
    color: 'bg-orange-500',
    actions: ['Nhận/Từ chối subtask', 'Cập nhật tiến độ', 'Upload tài liệu']
  },
  {
    step: 6,
    title: 'Gửi Trình duyệt',
    actor: 'Staff',
    icon: Upload,
    color: 'bg-orange-500',
    actions: ['Hoàn thành công việc', 'Đính kèm kết quả', 'Gửi Leader duyệt']
  },
  {
    step: 7,
    title: 'Phê duyệt',
    actor: 'Leader',
    icon: CheckCircle,
    color: 'bg-green-500',
    actions: ['Xem kết quả', 'Duyệt hoặc Trả lại', 'Ghi chú feedback']
  },
  {
    step: 8,
    title: 'Báo cáo',
    actor: 'PMO/Director',
    icon: BarChart3,
    color: 'bg-purple-500',
    actions: ['Xem tiến độ tổng', 'Tạo báo cáo', 'Xuất PDF/CSV']
  },
];

const rolePermissions = [
  {
    role: 'System Admin',
    color: 'bg-red-100 text-red-700 border-red-200',
    permissions: [
      { action: 'Quản lý User', allowed: true },
      { action: 'Phân quyền', allowed: true },
      { action: 'Cấu hình hệ thống', allowed: true },
      { action: 'Xem Log', allowed: true },
      { action: 'Xem Dự án', allowed: false },
      { action: 'Tạo Task', allowed: false },
    ]
  },
  {
    role: 'Ban Giám đốc',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    permissions: [
      { action: 'Xem Dashboard', allowed: true },
      { action: 'Xem Báo cáo', allowed: true },
      { action: 'Xem Dự án', allowed: true },
      { action: 'Chỉnh sửa dữ liệu', allowed: false },
      { action: 'Giao Task', allowed: false },
    ]
  },
  {
    role: 'PMO',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    permissions: [
      { action: 'Tạo Dự án', allowed: true },
      { action: 'Tạo Main Task', allowed: true },
      { action: 'Gán Leader', allowed: true },
      { action: 'Theo dõi tiến độ', allowed: true },
      { action: 'Tạo Subtask', allowed: false },
      { action: 'Duyệt công việc', allowed: false },
    ]
  },
  {
    role: 'Leader',
    color: 'bg-green-100 text-green-700 border-green-200',
    permissions: [
      { action: 'Nhận Main Task', allowed: true },
      { action: 'Tạo Subtask', allowed: true },
      { action: 'Phân công Staff', allowed: true },
      { action: 'Duyệt/Trả lại', allowed: true },
      { action: 'Tạo Dự án', allowed: false },
      { action: 'Tạo Main Task', allowed: false },
    ]
  },
  {
    role: 'Staff',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    permissions: [
      { action: 'Nhận Subtask', allowed: true },
      { action: 'Cập nhật tiến độ', allowed: true },
      { action: 'Upload tài liệu', allowed: true },
      { action: 'Gửi trình duyệt', allowed: true },
      { action: 'Tạo Task', allowed: false },
      { action: 'Duyệt công việc', allowed: false },
    ]
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg text-foreground">Sơ đồ Hệ thống</h1>
              <p className="text-sm text-muted-foreground">Sitemap & User Flow</p>
            </div>
          </div>
          <Link to="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Sitemap */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Sitemap - Cấu trúc trang
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sitemapData.map((section, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <section.icon className="w-5 h-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.pages.map((page, pidx) => (
                    <div key={pidx} className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <p className="font-medium text-sm text-foreground">{page.name}</p>
                      <p className="text-xs text-muted-foreground">{page.description}</p>
                      {page.roles && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {page.roles.map(role => (
                            <span key={role} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* User Flow */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <ArrowRight className="w-6 h-6 text-primary" />
            User Flow - Quy trình nghiệp vụ
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                {workflowSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[140px]">
                      <div className={`w-14 h-14 rounded-full ${step.color} text-white flex items-center justify-center mb-2`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-sm text-foreground text-center">{step.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">{step.actor}</p>
                      <div className="text-left w-full">
                        {step.actions.map((action, aidx) => (
                          <p key={aidx} className="text-xs text-muted-foreground">• {action}</p>
                        ))}
                      </div>
                    </div>
                    {idx < workflowSteps.length - 1 && (
                      <ArrowRight className="w-6 h-6 text-muted-foreground mx-2 mt-[-60px]" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Role Permissions Matrix */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Ma trận Phân quyền
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {rolePermissions.map((roleData, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm px-3 py-1 rounded-full w-fit ${roleData.color} border`}>
                    {roleData.role}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {roleData.permissions.map((perm, pidx) => (
                    <div key={pidx} className="flex items-center gap-2 text-sm">
                      {perm.allowed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={perm.allowed ? 'text-foreground' : 'text-muted-foreground'}>
                        {perm.action}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
