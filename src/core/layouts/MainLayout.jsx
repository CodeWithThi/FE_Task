import { useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { SkipLink } from '@core/components/common/SkipLink';
import { Breadcrumb } from '@core/components/common/Breadcrumb';
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
      {/* Skip Link for Accessibility */}
      <SkipLink targetId="main-content" />

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={handleOverlayClick}
          aria-hidden="true"
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

        {/* Breadcrumb Navigation - Outside main content box */}
        <div className="px-4 md:px-6 pt-4 pb-2">
          <Breadcrumb />
        </div>

        <main
          id="main-content"
          className="flex-1 px-4 md:px-6 pb-4 md:pb-6 animate-fade-in"
          role="main"
          tabIndex={-1}
        >
          {/* Page Content */}
          {children}
        </main>

        {/* Footer - Full width at bottom, outside content area */}
        <div className="mt-auto">
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
