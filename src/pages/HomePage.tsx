import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FolderKanban, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Shield,
  ArrowRight,
  Target,
  Bell,
  FileText
} from 'lucide-react';

const features = [
  {
    icon: FolderKanban,
    title: 'Quản lý Dự án',
    description: 'Tạo, theo dõi và quản lý dự án từ đầu đến cuối với quy trình rõ ràng'
  },
  {
    icon: Target,
    title: 'Phân công Công việc',
    description: 'Phân công Main Task cho Leader, Subtask cho Nhân viên một cách minh bạch'
  },
  {
    icon: Clock,
    title: 'Theo dõi Tiến độ',
    description: 'Cập nhật tiến độ realtime, cảnh báo deadline và công việc trễ hạn'
  },
  {
    icon: CheckCircle2,
    title: 'Quy trình Duyệt',
    description: 'Gửi trình duyệt, phê duyệt hoặc trả lại công việc với lý do rõ ràng'
  },
  {
    icon: Bell,
    title: 'Thông báo Tự động',
    description: 'Nhận thông báo về deadline, công việc mới, trạng thái phê duyệt'
  },
  {
    icon: BarChart3,
    title: 'Báo cáo Chi tiết',
    description: 'Báo cáo theo dự án, phòng ban, cá nhân. Xuất PDF/CSV dễ dàng'
  }
];

const roles = [
  {
    name: 'Ban Giám đốc',
    description: 'Xem Dashboard tổng hợp, báo cáo toàn bộ hệ thống',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    name: 'PMO',
    description: 'Tạo dự án, gán Leader, theo dõi tiến độ tổng thể',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    name: 'Trưởng nhóm',
    description: 'Nhận việc, tạo subtask, phân công và duyệt công việc',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    name: 'Nhân viên',
    description: 'Nhận việc, cập nhật tiến độ, gửi trình duyệt',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  }
];

const workflow = [
  { step: 1, title: 'Tạo Dự án', actor: 'PMO' },
  { step: 2, title: 'Tạo Main Task', actor: 'PMO' },
  { step: 3, title: 'Gán Leader', actor: 'PMO' },
  { step: 4, title: 'Tạo Subtask', actor: 'Leader' },
  { step: 5, title: 'Phân công', actor: 'Leader' },
  { step: 6, title: 'Thực hiện', actor: 'Staff' },
  { step: 7, title: 'Gửi duyệt', actor: 'Staff' },
  { step: 8, title: 'Phê duyệt', actor: 'Leader' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">Quản lý Dự án & Công việc</p>
            </div>
          </div>
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Đăng nhập
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Quản lý Dự án & Công việc
            <span className="text-primary block mt-2">Hiệu quả - Minh bạch</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Giải pháp quản lý dự án toàn diện cho trung tâm giảng dạy. 
            Theo dõi tiến độ, phân công công việc, và tạo báo cáo một cách dễ dàng.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2 px-8">
                Bắt đầu ngay
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/sitemap">
              <Button size="lg" variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Xem Sơ đồ hệ thống
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Tính năng nổi bật</h2>
          <p className="text-muted-foreground">Tất cả công cụ bạn cần để quản lý dự án hiệu quả</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="container mx-auto px-6 py-16 bg-card/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Quy trình làm việc</h2>
          <p className="text-muted-foreground">Luồng xử lý công việc rõ ràng từ đầu đến cuối</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {workflow.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <p className="text-sm font-medium mt-2 text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.actor}</p>
              </div>
              {index < workflow.length - 1 && (
                <ArrowRight className="w-6 h-6 text-muted-foreground mx-2 mt-[-20px]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Phân quyền theo vai trò</h2>
          <p className="text-muted-foreground">Mỗi vai trò có giao diện và chức năng riêng biệt</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${role.color} border`}>
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Đăng nhập ngay để trải nghiệm hệ thống quản lý dự án chuyên nghiệp
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="gap-2 px-8">
                Đăng nhập hệ thống
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FolderKanban className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">TaskFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TaskFlow - Hệ thống Quản lý Dự án & Công việc Nội bộ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
