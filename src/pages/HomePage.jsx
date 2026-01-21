import { Link } from 'react-router-dom';
import { Button } from '@core/components/ui/button';
import { FolderKanban } from 'lucide-react';
export default function HomePage() {
  return (<div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
    {/* Main Content - Centered Login Portal */}
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
        {/* Logo & System Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <FolderKanban className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">TaskFlow</h1>
          <p className="text-muted-foreground">
            Hệ thống quản lý dự án & công việc nội bộ
          </p>
        </div>

        {/* Login Button */}
        <Link to="/login" className="block">
          <Button size="lg" className="w-full max-w-xs text-base py-6">
            Đăng nhập
          </Button>
        </Link>
      </div>
    </main>

    {/* Simple Footer */}
    <footer className="py-6 text-center">
      <p className="text-sm text-muted-foreground">
        © 2025 TaskFlow
      </p>
    </footer>
  </div>);
}
