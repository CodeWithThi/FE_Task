import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@core/lib/utils';

/**
 * Breadcrumb - Navigation component giúp người dùng hiểu vị trí hiện tại
 * trong cấu trúc website. Hỗ trợ SEO với Schema.org markup.
 * 
 * Quy tắc 3 lần nhấp chuột: Giúp user navigate về trang chính nhanh chóng.
 */

import { useEffect } from 'react';

// Mapping path segments to English labels
const pathLabels = {
    dashboard: 'Dashboard',
    'my-overview': 'My Overview',
    projects: 'Projects',
    tasks: 'Tasks',
    'tasks-board': 'Task Board',
    reminders: 'Reminders',
    reports: 'Reports',
    users: 'Users',
    departments: 'Departments',
    logs: 'System Logs',
    settings: 'Settings',
    profile: 'User Profile',
    'change-password': 'Change Password',
    create: 'Create',
    edit: 'Edit',
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
            // Check for raw IDs and format them natively in English
            if (segment.startsWith('P_')) label = `Project ${segment}`;
            else if (segment.startsWith('T_') || segment.startsWith('SUB_')) label = `Task ${segment}`;
            else if (segment.startsWith('D_')) label = `Department ${segment}`;
            else if (segment.startsWith('U_')) label = `User ${segment}`;
            else label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        const isLast = index === pathSegments.length - 1;

        return { path, label, isLast };
    });

    // Update Browser Tab Title to match the current page's breadcrumb
    useEffect(() => {
        if (items.length > 0) {
            const currentItem = items[items.length - 1];
            document.title = `${currentItem.label} | TaskEdu`;
        } else {
            document.title = 'TaskEdu Management';
        }
    }, [items, location.pathname]);

    // Don't render if we're at root or only one level deep
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
                        <span className="hidden sm:inline" itemProp="name">Home</span>
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
