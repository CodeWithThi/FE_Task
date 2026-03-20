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
    // Dashboard routes
    '/dashboard': [ROLES.DIRECTOR, ROLES.PMO, ROLES.ADMIN],
    '/workload': [ROLES.LEADER, ROLES.STAFF, ROLES.PMO],

    // Project management
    '/projects': [ROLES.PMO, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.STAFF],
    '/projects/:id': [ROLES.PMO, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.STAFF],
    '/projects/:id/workspace': [ROLES.PMO, ROLES.LEADER, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.STAFF],
    '/projects/:id/board': [ROLES.LEADER, ROLES.STAFF, ROLES.PMO, ROLES.DIRECTOR],
    '/board': [ROLES.LEADER, ROLES.STAFF, ROLES.PMO, ROLES.DIRECTOR],

    // Task management
    '/tasks': [ROLES.ADMIN, ROLES.PMO, ROLES.DIRECTOR, ROLES.LEADER, ROLES.STAFF],
    '/tasks/:id': [ROLES.ADMIN, ROLES.PMO, ROLES.DIRECTOR, ROLES.LEADER, ROLES.STAFF],

    // Members & Organization
    '/members': [ROLES.ADMIN, ROLES.PMO],
    '/members/:username': [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PMO, ROLES.LEADER, ROLES.STAFF],
    '/departments': [ROLES.ADMIN, ROLES.PMO],

    // Features
    '/reminders': [ROLES.ADMIN, ROLES.PMO, ROLES.LEADER, ROLES.STAFF],
    '/reports': [ROLES.DIRECTOR, ROLES.PMO, ROLES.ADMIN, ROLES.LEADER],

    // System (Admin only)
    '/system/settings': [ROLES.ADMIN],
    '/system/logs': [ROLES.ADMIN],

    // Account
    '/account/changePassword': [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PMO, ROLES.LEADER, ROLES.STAFF],
};

/**
 * Helper function to get default route based on role
 */
export function getDefaultRouteForRole(role) {
    const normalizedRole = role?.toLowerCase();

    switch (normalizedRole) {
        case ROLES.ADMIN:
            return '/members'; // Admin goes to member management
        case ROLES.DIRECTOR:
        case ROLES.PMO:
            return '/dashboard'; // Director and PMO go to dashboard
        case ROLES.LEADER:
        case ROLES.STAFF:
            return '/workload'; // Leader and Staff go to their workload
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

    // Check dynamic routes (e.g., /projects/:id/workspace)
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

/**
 * Action-based permissions for granular UI control
 * Determines which actions each role can perform
 */
export const actionPermissions = {
    // Project actions
    'project:create': [ROLES.PMO],
    'project:edit': [ROLES.PMO],
    'project:delete': [ROLES.PMO],
    'project:view': [ROLES.DIRECTOR, ROLES.PMO, ROLES.LEADER, ROLES.STAFF],
    'project:approve': [ROLES.DIRECTOR],
    'project:accept': [ROLES.LEADER],

    // Task actions
    'task:create_main': [ROLES.PMO],
    'task:create_subtask': [ROLES.PMO, ROLES.LEADER],
    'task:edit': [ROLES.PMO, ROLES.LEADER],
    'task:delete': [ROLES.PMO],
    'task:view': [ROLES.DIRECTOR, ROLES.PMO, ROLES.LEADER, ROLES.STAFF],
    'task:assign': [ROLES.PMO, ROLES.LEADER],
    'task:approve': [ROLES.PMO, ROLES.LEADER],
    'task:update_progress': [ROLES.STAFF, ROLES.LEADER],
    'task:escalate': [ROLES.STAFF, ROLES.LEADER],

    // System actions
    'user:manage': [ROLES.ADMIN],
    'user:view': [ROLES.ADMIN, ROLES.PMO],
    'department:manage': [ROLES.ADMIN],
    'logs:view': [ROLES.ADMIN],
    'settings:edit': [ROLES.ADMIN],
    'reports:view': [ROLES.DIRECTOR, ROLES.PMO, ROLES.LEADER],
};

/**
 * Check if user can perform a specific action
 * @param {string} action - Action to check (e.g., 'task:create_main')
 * @param {string} userRole - User's role
 * @returns {boolean} True if user can perform the action
 */
export function canPerformAction(action, userRole) {
    const normalizedRole = userRole?.toLowerCase();

    // Admin has all system permissions but NOT workflow permissions
    if (normalizedRole === ROLES.ADMIN) {
        // Admin only has access to system actions
        const systemActions = ['user:manage', 'user:view', 'department:manage', 'logs:view', 'settings:edit'];
        return systemActions.some(a => action.startsWith(a.split(':')[0])) || actionPermissions[action]?.includes(ROLES.ADMIN);
    }

    const permissions = actionPermissions[action];
    if (!permissions) return false;

    return permissions.includes(normalizedRole);
}

export default {
    ROLES,
    routePermissions,
    actionPermissions,
    getDefaultRouteForRole,
    hasPermission,
    canPerformAction,
    getDashboardComponentForRole,
};
