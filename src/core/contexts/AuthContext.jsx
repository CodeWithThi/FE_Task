import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@core/services/authService';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const cachedUser = localStorage.getItem('user');

            if (token) {
                try {
                    // Try to fetch fresh user data from backend
                    const response = await authService.getMe();
                    if (response.ok) {
                        setUser(response.data);
                        // Update cached user
                        localStorage.setItem('user', JSON.stringify(response.data));
                    } else {
                        // If getMe fails but we have cached user, use it
                        if (cachedUser) {
                            setUser(JSON.parse(cachedUser));
                        } else {
                            localStorage.removeItem('accessToken');
                        }
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // Fallback to cached user if available
                    if (cachedUser) {
                        setUser(JSON.parse(cachedUser));
                    } else {
                        localStorage.removeItem('accessToken');
                    }
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
                // Save user object to localStorage for persistence
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // Set user data in state
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
        localStorage.removeItem('user');
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

        // Project Permissions
        canViewProjects: !isAdmin,
        canCreateProject: isPMO,
        canEditProject: isPMO,
        canApproveProject: isDirector,
        canAcceptProject: isLeader,

        // Task Permissions
        canViewTasks: !isAdmin,
        canCreateMainTask: isPMO || isLeader, // Both PMO and Leader can create tasks
        canCreateSubtask: isLeader, // Only Leader can create subtasks per new rule
        canEditTask: isPMO || isLeader,
        canDeleteTask: isPMO,
        canAssignTask: isPMO || isLeader,
        canApproveTask: isPMO || isLeader,

        // Reports (Director, PMO, Leader can view)
        canViewReports: isDirector || isPMO || isLeader,
        canExportReports: isDirector || isPMO || isAdmin,

        // User Management (Admin Only)
        canManageUsers: isAdmin,
        canManageDepartments: isAdmin,

        // System
        canViewSystemLogs: isAdmin,
        canConfigureSystem: isAdmin,
    };
}

