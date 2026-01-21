import { useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { cn } from '@core/lib/utils';
import { useIsMobile } from '@core/hooks/use-mobile';

export function MainLayout({ children }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse on tablet, auto-hide on mobile
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
      setCollapsed(true);
    }
  }, [isMobile]);

  // Close mobile menu when clicking outside
  const handleOverlayClick = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex w-full bg-background transition-colors duration-300">
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar - hidden on mobile unless opened */}
      <AppSidebar
        collapsed={isMobile ? false : collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 transition-all duration-300 flex flex-col min-h-screen",
        // No margin on mobile, responsive margin on desktop
        isMobile ? "ml-0" : (collapsed ? "ml-16" : "ml-64")
      )}>
        <AppHeader
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 p-4 md:p-6 animate-fade-in">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

