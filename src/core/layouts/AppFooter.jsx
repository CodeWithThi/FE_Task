import { cn } from '@core/lib/utils';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

/**
 * AppFooter - Footer 3 cột cho web app nội bộ
 * Cột 1: Thông tin trung tâm
 * Cột 2: Liên kết quan trọng
 * Cột 3: Phiên bản, bản quyền, social icons
 */
export function AppFooter({ className }) {
  const version = '1.0.0';
  const currentYear = new Date().getFullYear();

  // Social links - có thể cấu hình sau
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com', color: 'hover:text-blue-500' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: 'hover:text-pink-500' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com', color: 'hover:text-sky-400' },
  ];

  return (
    <footer
      className={cn(
        'relative overflow-hidden border-t border-slate-800/50 bg-gradient-to-r from-slate-900 via-[#0B1220] to-slate-900 transition-colors duration-300',
        className
      )}
      role="contentinfo"
    >
      <div className="py-6 px-4 md:px-8 lg:px-12">
        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          {/* Column 1: Center Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                TT
              </div>
              <div>
                <h3 className="font-bold text-[#E2E8F0] text-base">
                  Trung Tâm Dạy Học
                </h3>
                <p className="text-xs text-[#94A3B8]">Hệ thống quản lý dự án nội bộ</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Cao Đẳng Kỹ Thuật Đồng Nai</span>
              </div>
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <Phone className="w-4 h-4 text-green-400" />
                <span>0123 456 789</span>
              </div>
              <a href="mailto:support@trungtamdayhoc.vn" className="flex items-center gap-2 text-[#94A3B8] hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>support@trungtamdayhoc.vn</span>
              </a>
            </div>
          </div>

          {/* Column 2: Important Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-[#E2E8F0] text-sm uppercase tracking-wider">
              Liên kết
            </h4>
            <nav className="flex flex-col gap-2">
              <a href="/privacy" className="text-sm text-[#94A3B8] hover:text-blue-400 transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                Chính sách bảo mật
              </a>
              <a href="/terms" className="text-sm text-[#94A3B8] hover:text-blue-400 transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                Điều khoản sử dụng
              </a>
              <a href="/contact" className="text-sm text-[#94A3B8] hover:text-blue-400 transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                Liên hệ hỗ trợ
              </a>
              <a href="/help" className="text-sm text-[#94A3B8] hover:text-blue-400 transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                Hướng dẫn sử dụng
              </a>
            </nav>
          </div>

          {/* Column 3: Version, Copyright, Social */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-[#E2E8F0] text-sm uppercase tracking-wider">
              Kết nối
            </h4>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-9 h-9 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 transition-all duration-200 hover:scale-110',
                    social.color
                  )}
                  title={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
              {/* Zalo - Custom icon */}
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 transition-all duration-200 hover:scale-110 hover:text-blue-400"
                title="Zalo"
              >
                <span className="text-xs font-bold">Z</span>
              </a>
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 transition-all duration-200 hover:scale-110 hover:text-white"
                title="TikTok"
              >
                <span className="text-xs font-bold">T</span>
              </a>
            </div>

            {/* Version & Copyright */}
            <div className="mt-auto pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-200 border border-blue-500/20">
                  v{version}
                </span>
                <span className="text-[10px] text-[#64748B]">
                  Stable Release
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                © {currentYear} Trung Tâm Dạy Học. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
