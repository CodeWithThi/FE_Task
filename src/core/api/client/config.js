/**
 * API Configuration
 * 
 * Centralized configuration for API settings
 */

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3069',
    TIMEOUT: 30000, // 30 seconds

    // Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
        },
        USERS: '/users',
        TASKS: '/tasks',
        PROJECTS: '/projects',
        DEPARTMENTS: '/departments',
        ACCOUNTS: '/accounts',
        DASHBOARD: '/dashboard',
    },
};

export default API_CONFIG;
