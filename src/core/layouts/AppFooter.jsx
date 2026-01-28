import { Link } from 'react-router-dom';
import { cn } from '@core/lib/utils';
import { Mail, Phone, MapPin, Shield, ExternalLink } from 'lucide-react';

/**
 * AppFooter - Footer giàu thông tin theo tiêu chuẩn E-E-A-T
 * (Experience, Expertise, Authoritativeness, Trustworthiness)
 */
export function AppFooter({ className }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'py-4 md:py-6 px-4 md:px-6 border-t border-sidebar-border bg-sidebar text-sidebar-muted transition-colors duration-300',
        className
      )}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4">

          {/* Column 1: Organization Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sidebar-foreground text-sm">Trung Tâm Dạy Học</h3>
            <p className="text-xs leading-relaxed">
              Hệ thống quản lý dự án và công việc nội bộ, phát triển bởi Công ty TNHH VuLe.
            </p>
          </div>

          {/* Column 2: Contact Info - E-E-A-T Trust signals */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sidebar-foreground text-sm">Liên hệ</h3>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Cao Đẳng Kỹ Thuật Đồng Nai</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span>thi2842005@gamil.com</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sidebar-foreground text-sm">Liên kết nhanh</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button className="hover:text-sidebar-foreground transition-colors inline-flex items-center gap-1">
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <button className="hover:text-sidebar-foreground transition-colors inline-flex items-center gap-1">
                  Điều khoản sử dụng
                </button>
              </li>
              <li>
                <button className="hover:text-sidebar-foreground transition-colors inline-flex items-center gap-1">
                  Hỗ trợ
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust Badges */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sidebar-foreground text-sm">Chứng nhận</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-sidebar-accent rounded text-[10px] font-medium">
                <Shield className="w-3 h-3 text-green-500" />
                SSL Secured
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-sidebar-accent rounded text-[10px] font-medium">
                ISO 27001
              </span>
            </div>
            <p className="text-[10px] mt-2 opacity-75">
              Dữ liệu được bảo mật và mã hóa
            </p>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-4 border-t border-sidebar-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© {currentYear} Trung Tâm Dạy Học. Bản quyền thuộc về trung tâm.</span>
          <span className="text-[10px] opacity-75">
            Phiên bản 1.0.0 | Cập nhật: 01/2026
          </span>
        </div>
      </div>
    </footer>
  );
}
