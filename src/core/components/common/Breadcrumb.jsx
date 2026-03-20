import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@core/lib/utils';
import { useEffect } from 'react';

/**
 * Breadcrumb - Navigation component with Schema.org markup.
 * Maps URL segments to professional English labels.
 */

// Mapping path segments to English labels
const pathLabels = {
    dashboard: 'Tổng quan',
    workload: 'Tổng quan',
    projects: 'Dự án',
    workspace: 'Không gian làm việc',
    board: 'Bảng công việc',
    tasks: 'Công việc',
    reminders: 'Nhắc việc',
    reports: 'Báo cáo',
    members: 'Người dùng',
    departments: 'Phòng ban',
    system: 'Hệ thống',
    logs: 'Nhật ký hệ thống',
    settings: 'Cài đặt',
    account: 'Tài khoản',
    changePassword: 'Đổi mật khẩu',
    forgotPassword: 'Quên mật khẩu',
    resetPassword: 'Đặt lại mật khẩu',
    create: 'Tạo mới',
    edit: 'Chỉnh sửa',
};

export function Breadcrumb({ className, customItems }) {
    const location = useLocation();

    // Parse pathname into breadcrumb items
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Build breadcrumb items from path
    const items = pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        let label = pathLabels[segment];

        if (!label) {
            // Format dynamic segments (IDs or slugs) into readable labels
            if (segment.startsWith('P_')) label = `Project ${segment}`;
            else if (segment.startsWith('T_') || segment.startsWith('SUB_')) label = `Task ${segment}`;
            else if (segment.startsWith('D_')) label = `Department ${segment}`;
            else if (segment.startsWith('U_')) label = `User ${segment}`;
            else {
                // Convert camelCase or plain text to Title Case
                label = segment
                    .replace(/([A-Z])/g, ' $1') // split camelCase
                    .replace(/^./, s => s.toUpperCase()) // capitalize first letter
                    .trim();
            }
        }

        const isLast = index === pathSegments.length - 1;

        return { path, label, isLast };
    });

    // Update Browser Tab Title
    useEffect(() => {
        if (items.length > 0) {
            const currentItem = items[items.length - 1];
            document.title = `${currentItem.label} | TaskEdu`;
        } else {
            document.title = 'TaskEdu Management';
        }
    }, [items, location.pathname]);

    // Don't render if we're at root
    if (items.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn('mb-4', className)}
            itemScope
            itemType="https://schema.org/BreadcrumbList"
        >
            <ol className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
                {/* Home link */}
                <li
                    className="flex items-center"
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                >
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1 hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
                        itemProp="item"
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline" itemProp="name">Trang chủ</span>
                    </Link>
                    <meta itemProp="position" content="1" />
                </li>

                {items.map((item, index) => (
                    <li
                        key={item.path}
                        className="flex items-center"
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
                        {item.isLast ? (
                            <span
                                className="font-medium text-foreground truncate max-w-[150px] sm:max-w-none"
                                itemProp="name"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.path}
                                className="hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50 truncate max-w-[100px] sm:max-w-none"
                                itemProp="item"
                            >
                                <span itemProp="name">{item.label}</span>
                            </Link>
                        )}
                        <meta itemProp="position" content={String(index + 2)} />
                    </li>
                ))}
            </ol>
        </nav>
    );
}
