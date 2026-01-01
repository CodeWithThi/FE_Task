import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background transition-colors duration-300">
      <AppSidebar />
      <div className="flex-1 ml-64 transition-all duration-300 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-6 animate-fade-in">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
