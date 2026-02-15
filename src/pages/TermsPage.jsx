import { Link, useNavigate } from 'react-router-dom';
import {
    FileText, UserCog, ShieldAlert, Gavel, AlertTriangle,
    ChevronLeft, ChevronRight, Home
} from 'lucide-react';

const sections = [
    {
        icon: UserCog,
        title: '1. Quy định tài khoản',
        items: [
            'Mỗi nhân viên được cấp một tài khoản duy nhất bởi quản trị viên hệ thống.',
            'Tài khoản là cá nhân, không được chia sẻ hoặc chuyển nhượng cho người khác.',
            'Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập của mình.',
            'Phải đổi mật khẩu mặc định ngay sau lần đăng nhập đầu tiên.'
        ]
    },
    {
        icon: ShieldAlert,
        title: '2. Trách nhiệm người dùng',
        items: [
            'Sử dụng hệ thống đúng mục đích — quản lý dự án và công việc được giao.',
            'Không truy cập, sửa đổi hoặc xóa dữ liệu không thuộc phạm vi quyền hạn.',
            'Báo cáo ngay cho quản trị viên nếu phát hiện lỗi bảo mật hoặc hành vi bất thường.',
            'Cập nhật tiến độ công việc đầy đủ và đúng thời hạn trên hệ thống.',
            'Không sử dụng hệ thống để lưu trữ nội dung không liên quan đến công việc.'
        ]
    },
    {
        icon: Gavel,
        title: '3. Quyền của quản trị viên',
        items: [
            'Tạo, chỉnh sửa, vô hiệu hóa và xóa tài khoản người dùng.',
            'Phân quyền truy cập theo vai trò: Admin, Director, PMO, Leader, Staff.',
            'Xem lịch sử hoạt động (System Logs) để giám sát và audit.',
            'Quản lý cấu trúc phòng ban, dự án và phân công nhân sự.',
            'Thực hiện sao lưu và khôi phục dữ liệu khi cần thiết.'
        ]
    }
];

const violations = [
    { level: 'Nhẹ', desc: 'Không cập nhật tiến độ, bỏ quên công việc', action: 'Nhắc nhở qua hệ thống' },
    { level: 'Trung bình', desc: 'Chia sẻ tài khoản, truy cập vượt quyền', action: 'Khóa tài khoản tạm thời' },
    { level: 'Nghiêm trọng', desc: 'Sửa/xóa dữ liệu trái phép, gian lận', action: 'Khóa vĩnh viễn + xử lý kỷ luật' },
];

export default function TermsPage() {
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
                        <span className="text-foreground font-medium">Điều khoản sử dụng</span>
                    </nav>

                    {/* Back + Title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                            title="Quay lại"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Điều khoản sử dụng</h1>
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
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-2">Quy định chung</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Bằng việc sử dụng hệ thống TaskFlow, bạn đồng ý tuân thủ các điều khoản dưới đây.
                                Các quy định này nhằm đảm bảo hệ thống hoạt động an toàn, hiệu quả và công bằng
                                cho tất cả người dùng.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Cards */}
                <div className="space-y-4 mb-8">
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
                                        <ul className="space-y-2">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-muted-foreground">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                    <span className="leading-relaxed">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Violations - Warning highlight box */}
                <div className="bg-card border border-[hsl(var(--status-overdue)/0.3)] rounded-xl p-6 animate-fade-in" style={{ animationDelay: '240ms' }}>
                    <div className="flex items-start gap-4 mb-5">
                        <div className="p-2.5 rounded-lg bg-[hsl(var(--status-overdue)/0.1)] text-[hsl(var(--status-overdue))] shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground pt-1">4. Chính sách xử lý vi phạm</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-semibold text-foreground">Mức độ</th>
                                    <th className="text-left py-3 px-4 font-semibold text-foreground">Vi phạm</th>
                                    <th className="text-left py-3 px-4 font-semibold text-foreground">Xử lý</th>
                                </tr>
                            </thead>
                            <tbody>
                                {violations.map((v, i) => (
                                    <tr key={i} className="border-b border-border/50 last:border-none">
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${i === 0 ? 'bg-[hsl(var(--status-pending)/0.1)] text-[hsl(var(--status-pending))]'
                                                : i === 1 ? 'bg-[hsl(var(--status-returned)/0.1)] text-[hsl(var(--status-returned))]'
                                                    : 'bg-[hsl(var(--status-overdue)/0.1)] text-[hsl(var(--status-overdue))]'
                                                }`}>
                                                {v.level}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">{v.desc}</td>
                                        <td className="py-3 px-4 text-muted-foreground font-medium">{v.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
