import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await authService.getMe();
                    if (response.ok) {
                        setUser(response.data);
                    } else {
                        localStorage.removeItem('accessToken');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('accessToken');
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);
            if (response.ok && response.data) {
                // Save token to localStorage
                localStorage.setItem('accessToken', response.data.token);
                // Set user data
                setUser(response.data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        authService.logout();
    };

    return (<AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
        {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
// Helper hook to check permissions
// Helper hook to check permissions
export function usePermissions() {
    const { user } = useAuth();
    if (!user) return null;

    // Normalize role
    const role = (user.role || '').toLowerCase();

    // Helper checks
    const isAdmin = role === 'admin';
    const isDirector = role === 'director';
    const isPMO = role === 'pmo';
    const isLeader = role === 'leader';
    const isStaff = role === 'staff';

    return {
        // Dashboard & Overview
        canViewDashboard: true,

        // Projects
        // Projects
        canViewProjects: true, // All roles can at least view (Admin read-only, Director View, etc)
        canCreateProject: isPMO,
        canEditProject: isPMO,

        // Tasks
        canViewTasks: true,
        // PMO creates Main Tasks for teams, Leader creates tasks within team
        canCreateMainTask: isPMO || isLeader,
        // Subtasks are for breaking down work - Leader primarily, PMO if needed? Text says "PMO: Không xử lý từng subtask nhỏ".
        // Leader: "Phân nhỏ Subtask". Staff: "Hoàn thành Subtask".
        canCreateSubtask: isLeader,

        canEditTask: isPMO || isLeader || isAdmin,
        canDeleteTask: isPMO || isLeader || isAdmin,

        canAssignTask: isPMO || isLeader, // PMO assigns Leader/Staff, Leader assigns Staff
        canApproveTask: isPMO || isLeader, // "Review các task quan trọng" (PMO), "Duyệt task" (Leader)

        // Staff Actions
        canAcceptTask: isStaff,
        canRejectTask: isStaff,
        canUpdateProgress: isStaff || isLeader, // Staff updates progress, Leader monitors
        canSubmitForApproval: isStaff,

        // Reports
        canViewReports: isDirector || isPMO || isLeader || isAdmin,
        canExportReports: isDirector || isPMO || isAdmin,

        // User Management (Admin Only)
        canManageUsers: isAdmin,
        canManageDepartments: isAdmin,

        // System
        canViewSystemLogs: isAdmin,
        canConfigureSystem: isAdmin,
    };
}
