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
export function usePermissions() {
    const { user } = useAuth();
    if (!user)
        return null;
    const role = user.role;
    return {
        // Dashboard & Overview
        canViewDashboard: true,
        // Projects
        canViewProjects: role !== 'admin',
        canCreateProject: role === 'pmo',
        canEditProject: role === 'pmo',
        // Tasks
        canViewTasks: role !== 'admin',
        canCreateMainTask: role === 'pmo',
        canCreateSubtask: role === 'leader',
        canAssignTask: role === 'pmo' || role === 'leader',
        canApproveTask: role === 'leader',
        canAcceptTask: role === 'staff',
        canRejectTask: role === 'staff',
        canUpdateProgress: role === 'staff',
        canSubmitForApproval: role === 'staff',
        // Reports
        canViewReports: role !== 'admin' && role !== 'staff',
        canExportReports: role === 'pmo' || role === 'director',
        // User Management
        canManageUsers: role === 'admin' || role === 'pmo',
        canManageDepartments: role === 'admin' || role === 'pmo',
        // System
        canViewSystemLogs: role === 'admin',
        canConfigureSystem: role === 'admin',
    };
}
