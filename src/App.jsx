import { Toaster } from "@core/components/ui/toaster";
import { Toaster as Sonner } from "@core/components/ui/sonner";
import { TooltipProvider } from "@core/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@core/contexts/AuthContext";
import { AppRoutes } from "@/routes/AppRoutes";
import { GlobalErrorBoundary } from "@core/components/common/GlobalErrorBoundary";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <GlobalErrorBoundary>
          <AppRoutes />
        </GlobalErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
</QueryClientProvider>);
export default App;

