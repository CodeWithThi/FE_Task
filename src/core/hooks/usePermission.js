/**
 * usePermission hook
 * Provides role-based permission checking for React components
 */
import { useMemo } from 'react';
import { useAuth } from '@core/hooks/useAuth';
import { canPerformAction, ROLES } from '@core/config/permissions';

/**
 * Hook to check permissions for the current user
 * @returns Object with permission checking utilities
 */
export function usePermission() {
    const { user } = useAuth();
    const userRole = (user?.roleName || user?.role || '').toLowerCase();

    const permissions = useMemo(() => {
        const isPMO = userRole === ROLES.PMO;
        const isDirector = userRole === ROLES.DIRECTOR;
        const isLeader = userRole === ROLES.LEADER;
        const isStaff = userRole === ROLES.STAFF;
        const isAdmin = userRole === ROLES.ADMIN;

        return {
            // Role checks
            isPMO,
            isDirector,
            isLeader,
            isStaff,
            isAdmin,
            userRole,

            // Project permissions
            canCreateProject: isPMO,
            canEditProject: isPMO,
            canDeleteProject: isPMO,
            canApproveProject: isDirector,
            canAcceptProject: isLeader,

            // Task permissions
            canCreateMainTask: isPMO,
            canCreateSubtask: isPMO || isLeader,
            canEditTask: isPMO || isLeader,
            canDeleteTask: isPMO,
            canAssignTask: isPMO || isLeader,
            canApproveTask: isPMO || isLeader,
            canUpdateProgress: isStaff || isLeader,
            canEscalateTask: isStaff || isLeader,

            // System permissions
            canManageUsers: isAdmin,
            canViewLogs: isAdmin,
            canEditSettings: isAdmin,
            canViewReports: isDirector || isPMO || isLeader,

            // View permissions (no create/edit)
            isViewOnly: isDirector || isAdmin,
        };
    }, [userRole]);

    /**
     * Check if user can perform a specific action
     * @param {string} action - Action to check (e.g., 'task:create_main')
     * @returns {boolean}
     */
    const can = (action) => {
        return canPerformAction(action, userRole);
    };

    return {
        ...permissions,
        can,
    };
}

export default usePermission;
