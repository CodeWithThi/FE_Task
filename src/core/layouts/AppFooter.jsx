import { cn } from '@core/lib/utils';
import { Mail, Phone, MapPin } from 'lucide-react';

/**
 * AppFooter - Footer đẹp và gọn nhẹ cho web app nội bộ
 */
export function AppFooter({ className }) {
  const version = '1.0.0';
  const lastUpdate = '29/01/2026';

  return (
    <footer
      className={cn(
        'relative overflow-hidden border-t border-slate-800/50 bg-gradient-to-r from-slate-900 to-[#0B1220] transition-colors duration-300',
        className
      )}
      role="contentinfo"
    >
      <div className="py-3 px-4 md:px-6">
        {/* Single Row Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-sm">
          {/* Left: Logo + System Name + Address */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              TT
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#E2E8F0] text-sm">
                Trung Tâm Dạy Học
              </span>
              <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                Cao Đẳng Kỹ Thuật Đồng Nai
              </span>
            </div>
          </div>

          {/* Center: Contact Cards */}
          <div className="flex items-center gap-3 text-xs">
            <a
              href="mailto:support@trungtamdayhoc.vn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600 text-[#CBD5E1] hover:text-white transition-all duration-200 hover:scale-105"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden md:inline">support@trungtamdayhoc.vn</span>
              <span className="md:hidden">Email</span>
            </a>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700/50 text-[#CBD5E1]">
              <Phone className="w-3.5 h-3.5" />
              <span>0123 456 789</span>
            </span>
          </div>

          {/* Right: Version Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-200 border border-blue-500/20">
              v{version}
            </span>
            <span className="text-[10px] text-[#64748B] opacity-70">
              {lastUpdate}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
