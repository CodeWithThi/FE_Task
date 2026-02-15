import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, Database, Eye, Lock, UserCheck,
    ChevronLeft, ChevronRight, Home
} from 'lucide-react';

const sections = [
    {
        icon: Database,
        title: 'Thu thập dữ liệu',
        content: 'Hệ thống thu thập thông tin cần thiết cho việc quản lý công việc: họ tên, email, phòng ban, chức vụ và lịch sử hoạt động. Dữ liệu được sử dụng duy nhất cho mục đích vận hành nội bộ.'
    },
    {
        icon: Eye,
        title: 'Phạm vi sử dụng',
        items: [
            'Xác thực và phân quyền truy cập hệ thống',
            'Phân công, theo dõi và đánh giá công việc',
            'Tạo báo cáo tổng hợp cho quản lý',
            'Gửi thông báo và nhắc nhở nội bộ'
        ]
    },
    {
        icon: Lock,
        title: 'Cam kết bảo mật',
        items: [
            'Mật khẩu được mã hóa bcrypt, không lưu dạng rõ',
            'Phiên đăng nhập sử dụng JWT với thời hạn giới hạn',
            'Truy cập dữ liệu theo phân quyền vai trò (RBAC)',
            'Kết nối database qua kênh bảo mật, giới hạn connection pool'
        ]
    },
    {
        icon: UserCheck,
        title: 'Quyền của người dùng',
        items: [
            'Xem và chỉnh sửa thông tin cá nhân của mình',
            'Đổi mật khẩu bất kỳ lúc nào',
            'Yêu cầu quản trị viên xóa hoặc xuất dữ liệu cá nhân',
            'Được thông báo khi có thay đổi về chính sách bảo mật'
        ]
    }
];

export default function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
            {/* Header */}
            <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" />
                            Trang chủ
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-foreground font-medium">Chính sách bảo mật</span>
                    </nav>

                    {/* Back button + Title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                            title="Quay lại"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Chính sách bảo mật</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Cập nhật: Tháng 2, 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full">
                {/* Intro */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-2">Về hệ thống TaskFlow</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                TaskFlow là hệ thống quản lý dự án và công việc <strong className="text-foreground">nội bộ</strong> dành cho
                                trung tâm. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu
                                của nhân viên trong phạm vi hệ thống.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Cards */}
                <div className="space-y-4">
                    {sections.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-card border border-border rounded-xl p-6 transition-all hover:border-primary/20 hover:shadow-sm animate-fade-in"
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-foreground mb-3">{section.title}</h3>
                                        {section.content && (
                                            <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                                        )}
                                        {section.items && (
                                            <ul className="space-y-2">
                                                {section.items.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-muted-foreground">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                        <span className="leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/50 py-6 mt-8">
                <p className="text-center text-xs text-muted-foreground">
                    © 2026 TaskFlow — Hệ thống quản lý nội bộ
                </p>
            </footer>
        </div>
    );
}
