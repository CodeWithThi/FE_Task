import { cn } from '@/lib/utils';
export function AppFooter({ className }) {
    return (<footer className={cn('py-4 px-6 border-t border-border bg-card/50 text-xs text-muted-foreground transition-colors duration-300', className)}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <span className="font-medium">© 2024 Trung Tâm Dạy Học</span>
          <span className="hidden md:inline">•</span>
          <span>Phát triển bởi: Công ty TNHH Phần mềm ABC</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</span>
          <span className="hidden md:inline">•</span>
          <button className="hover:text-primary transition-colors duration-200 underline-offset-2 hover:underline">
            Chính sách quyền riêng tư
          </button>
        </div>
      </div>
    </footer>);
}
