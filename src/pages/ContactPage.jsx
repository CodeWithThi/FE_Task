import { Link, useNavigate } from 'react-router-dom';
import {
    Building2, MapPin, Mail, Phone, Clock,
    ChevronLeft, ChevronRight, Home
} from 'lucide-react';

const contactItems = [
    {
        icon: Building2,
        label: 'Trung tâm',
        value: 'Trung tâm Dạy Học',
        color: 'bg-primary/10 text-primary'
    },
    {
        icon: MapPin,
        label: 'Địa chỉ',
        value: 'Cao Đẳng Kỹ Thuật Đồng Nai',
        color: 'bg-[hsl(var(--status-completed)/0.1)] text-[hsl(var(--status-completed))]'
    },
    {
        icon: Mail,
        label: 'Email hỗ trợ',
        value: 'Thi2842005@gmail.com',
        href: 'mailto:Thi2842005@gmail.com',
        color: 'bg-[hsl(var(--status-in-progress)/0.1)] text-[hsl(var(--status-in-progress))]'
    },
    {
        icon: Phone,
        label: 'Hotline',
        value: '(079) 220 4481',
        href: 'tel:0792204481',
        color: 'bg-[hsl(var(--status-pending)/0.1)] text-[hsl(var(--status-pending))]'
    },
];

const workingHours = [
    { day: 'Thứ 2 – Thứ 6', hours: '08:00 – 17:30' },
    { day: 'Thứ 7', hours: '08:00 – 12:00' },
    { day: 'Chủ nhật', hours: 'Nghỉ' },
];

export default function ContactPage() {
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
                        <span className="text-foreground font-medium">Liên hệ</span>
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
                            <h1 className="text-2xl font-bold text-foreground">Liên hệ</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Thông tin liên hệ & hỗ trợ kỹ thuật</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Contact Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Thông tin liên hệ</h2>

                        {contactItems.map((item, idx) => {
                            const Icon = item.icon;
                            const Wrapper = item.href ? 'a' : 'div';
                            const wrapperProps = item.href ? { href: item.href } : {};

                            return (
                                <Wrapper
                                    key={idx}
                                    {...wrapperProps}
                                    className={`bg-card border border-border rounded-xl p-5 flex items-start gap-4 transition-all hover:border-primary/20 hover:shadow-sm animate-fade-in ${item.href ? 'group cursor-pointer' : ''}`}
                                    style={{ animationDelay: `${idx * 80}ms` }}
                                >
                                    <div className={`p-2.5 rounded-lg shrink-0 ${item.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                            {item.label}
                                        </p>
                                        <p className={`text-foreground font-medium leading-relaxed ${item.href ? 'group-hover:text-primary transition-colors' : ''}`}>
                                            {item.value}
                                        </p>
                                    </div>
                                </Wrapper>
                            );
                        })}
                    </div>

                    {/* Right: Working Hours + IT Support */}
                    <div className="space-y-6">
                        {/* Working Hours */}
                        <div className="animate-fade-in" style={{ animationDelay: '320ms' }}>
                            <h2 className="text-xl font-semibold text-foreground mb-4">Giờ làm việc</h2>

                            <div className="bg-card border border-border rounded-xl p-5">
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="p-2.5 rounded-lg bg-[hsl(var(--status-waiting)/0.1)] text-[hsl(var(--status-waiting))] shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-muted-foreground pt-1">
                                        Hỗ trợ kỹ thuật trong giờ hành chính
                                    </p>
                                </div>

                                <div className="space-y-0">
                                    {workingHours.map((wh, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between py-3 px-1 ${i < workingHours.length - 1 ? 'border-b border-border/50' : ''
                                                }`}
                                        >
                                            <span className="text-sm text-muted-foreground">{wh.day}</span>
                                            <span className={`text-sm font-medium ${wh.hours === 'Nghỉ' ? 'text-[hsl(var(--status-overdue))]' : 'text-foreground'}`}>
                                                {wh.hours}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* IT Support Card */}
                        <div className="bg-card border border-primary/20 rounded-xl p-5 animate-fade-in" style={{ animationDelay: '400ms' }}>
                            <h3 className="text-sm font-semibold text-foreground mb-3">🛠 Hỗ trợ kỹ thuật</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>Nếu gặp sự cố kỹ thuật với hệ thống, vui lòng liên hệ:</p>
                                <ul className="space-y-1.5 mt-2">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <span>Email: <a href="mailto:Thi2842005@gmail.com" className="text-primary hover:underline">Thi2842005@gmail.com</a></span>
                                    </li>

                                </ul>
                            </div>
                        </div>
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
