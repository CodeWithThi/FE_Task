import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { getDefaultRouteForRole } from "@/config/permissions";

export function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const defaultRoute = getDefaultRouteForRole(user.role);

        // Prevent infinite loop if already at the default route
        if (location.pathname === defaultRoute) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Không có quyền truy cập</h1>
                    <p className="text-muted-foreground mb-4">
                        Tài khoản của bạn ({user.role}) không được phân quyền truy cập trang này.
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    >
                        Đăng nhập lại
                    </button>
                </div>
            );
        }

        return <Navigate to={defaultRoute} replace />;
    }

    return <MainLayout>{children}</MainLayout>;
}
