import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { cn } from '@/lib/utils';

export function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background transition-colors duration-300">
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn(
        "flex-1 transition-all duration-300 flex flex-col min-h-screen",
        collapsed ? "ml-16" : "ml-64"
      )}>
        <AppHeader />
        <main className="flex-1 p-6 animate-fade-in">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
