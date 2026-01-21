import { cn } from '@core/lib/utils';

export function AppFooter({ className }) {
  return (
    <footer className={cn(
      'py-3 md:py-4 px-4 md:px-6 border-t border-border bg-card/50 text-xs text-muted-foreground transition-colors duration-300',
      className
    )}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-4">
          <span className="font-medium">© 2025 Trung Tâm Dạy Học</span>
          <span className="hidden md:inline">•</span>
          <span className="text-[10px] sm:text-xs">Phát triển bởi: Công ty TNHH VuLe</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Địa chỉ: Cao Dẳng Kỹ Thuật Đồng Nai</span>
          <span className="hidden md:inline">•</span>
          <button className="hover:text-primary transition-colors duration-200 underline-offset-2 hover:underline">
            Chính sách quyền riêng tư
          </button>
        </div>
      </div>
    </footer>
  );
}

