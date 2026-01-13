/**
 * Standard 5 roles in the system
 */
export const ROLES = {
    ADMIN: 'admin',
    DIRECTOR: 'director',
    PMO: 'pmo',
    LEADER: 'leader',
    STAFF: 'staff',
};

/**
 * Route permissions based on role requirements
 * 
 * Role Definitions:
 * - ADMIN (System Admin): Full system access, user management, system settings, logs
 * - DIRECTOR: View-only access to dashboards and reports, strategic overview
 * - PMO: Create/manage projects, assign leaders, view all data, reports
 * - LEADER: Manage tasks within projects, assign staff, view department data
 * - STAFF: Work on assigned tasks, update progress, view personal tasks
 */
export const routePermissions = {
    // Admin routes (System Admin only)
    '/users': [ROLES.ADMIN, ROLES.PMO],
    '/departments': [ROLES.ADMIN, ROLES.PMO],
    '/settings': [ROLES.ADMIN],
    '/logs': [ROLES.ADMIN],

    // Dashboard routes
    '/dashboard': [ROLES.DIRECTOR, ROLES.PMO, ROLES.ADMIN],

    // Project management (PMO only can create/manage, Director can view, Leader/Staff view assigned)
    '/projects': [ROLES.PMO, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.STAFF],
    '/projects/:id': [ROLES.PMO, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.STAFF],
    '/workspace/:id': [ROLES.PMO, ROLES.LEADER, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.STAFF],

    // Task management
    '/tasks': [ROLES.ADMIN, ROLES.PMO, ROLES.DIRECTOR, ROLES.LEADER, ROLES.STAFF],
    '/tasks/:id': [ROLES.ADMIN, ROLES.PMO, ROLES.DIRECTOR, ROLES.LEADER, ROLES.STAFF],
    '/my-overview': [ROLES.LEADER, ROLES.STAFF, ROLES.PMO],
    '/tasks-board': [ROLES.LEADER, ROLES.STAFF, ROLES.PMO],
    '/task/:id': [ROLES.PMO, ROLES.LEADER, ROLES.STAFF, ROLES.DIRECTOR],

    // Features
    '/reminders': [ROLES.ADMIN, ROLES.PMO, ROLES.LEADER, ROLES.STAFF],
    '/reports': [ROLES.DIRECTOR, ROLES.PMO, ROLES.ADMIN, ROLES.LEADER],

    // System
    '/profile': [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PMO, ROLES.LEADER, ROLES.STAFF],
    '/change-password': [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PMO, ROLES.LEADER, ROLES.STAFF],
};

/**
 * Helper function to get default route based on role
 */
export function getDefaultRouteForRole(role) {
    const normalizedRole = role?.toLowerCase();

    switch (normalizedRole) {
        case ROLES.ADMIN:
            return '/users'; // Admin goes to user management
        case ROLES.DIRECTOR:
        case ROLES.PMO:
            return '/dashboard'; // Director and PMO go to dashboard
        case ROLES.LEADER:
        case ROLES.STAFF:
            return '/my-overview'; // Leader and Staff go to their tasks
        default:
            return '/dashboard';
    }
}

/**
 * Check if user has permission to access a route
 * @param {string} route - Route path
 * @param {string} userRole - User's role
 * @returns {boolean} True if user has permission
 */
export function hasPermission(route, userRole) {
    const normalizedRole = userRole?.toLowerCase();

    // Admin has access to everything
    if (normalizedRole === ROLES.ADMIN) {
        return true;
    }

    // Check exact route match
    if (routePermissions[route]) {
        return routePermissions[route].includes(normalizedRole);
    }

    // Check dynamic routes (e.g., /workspace/:id)
    for (const [permRoute, allowedRoles] of Object.entries(routePermissions)) {
        if (permRoute.includes(':')) {
            const pattern = new RegExp('^' + permRoute.replace(/:[^/]+/g, '[^/]+') + '$');
            if (pattern.test(route)) {
                return allowedRoles.includes(normalizedRole);
            }
        }
    }

    return false;
}

/**
 * Get dashboard component name based on role
 */
export function getDashboardComponentForRole(role) {
    const normalizedRole = role?.toLowerCase();

    switch (normalizedRole) {
        case ROLES.ADMIN:
            return 'AdminDashboard';
        case ROLES.DIRECTOR:
            return 'DirectorDashboard';
        case ROLES.PMO:
            return 'PMODashboard';
        case ROLES.LEADER:
            return 'LeaderDashboard';
        case ROLES.STAFF:
            return 'StaffDashboard';
        default:
            return 'StaffDashboard'; // Default fallback
    }
}

export default {
    ROLES,
    routePermissions,
    getDefaultRouteForRole,
    hasPermission,
    getDashboardComponentForRole,
};
