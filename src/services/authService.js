import apiClient from '@/lib/apiClient';

/**
 * AUTH SERVICE
 * Handles authentication operations and formats backend responses for AuthContext
 */

export const authService = {
    /**
     * Login with username and password
     * Backend response: { ok: true, data: { data: { tokens: { accessToken }, user } } }
     * Returns: { ok: boolean, data: { token, user }, message? }
     */
    login: async (username, password) => {
        try {
            const response = await apiClient.post('/auth/login', { username, password });

            // apiClient already handles errors and returns { ok: false } on failure
            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Đăng nhập thất bại'
                };
            }

            // Extract token and user from backend structure
            const backendData = response.data; // apiClient returns response.data (body)
            const token = backendData?.tokens?.accessToken;
            let rawUser = backendData?.user;

            if (!token || !rawUser) {
                console.error('Invalid login response structure:', response);
                return {
                    ok: false,
                    message: 'Phản hồi đăng nhập không hợp lệ'
                };
            }

            // Normalize user object for frontend (map Role/roleName to role)
            let normalizedRole = (rawUser.Role?.R_Name || rawUser.roleName || '').toLowerCase();

            // Map backend roles to frontend roles (STRICT - 5 roles only)
            if (normalizedRole === 'admin' || normalizedRole === 'administrator' || normalizedRole === 'system') {
                normalizedRole = 'admin';
            } else if (normalizedRole === 'user' || normalizedRole === 'nhanvien' || normalizedRole === 'employee') {
                normalizedRole = 'staff';
            } else if (normalizedRole === 'manager' || normalizedRole === 'truongphong') {
                normalizedRole = 'leader';
            } else if (normalizedRole === 'sep' || normalizedRole === 'director') {
                normalizedRole = 'director';
            }
            // director, pmo, staff, leader, admin remain unchanged

            const user = {
                ...rawUser,
                id: rawUser.A_ID || rawUser.aid,
                username: rawUser.UserName || rawUser.username,
                name: rawUser.Account_Name || rawUser.Name || rawUser.name || rawUser.UserName || rawUser.username,
                role: normalizedRole,
                m_id: rawUser.Member?.M_ID || rawUser.M_ID
            };

            // Return formatted data for AuthContext
            return {
                ok: true,
                data: {
                    token: token,
                    user: user
                }
            };
        } catch (error) {
            console.error('authService.login error:', error);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Get current user info
     * Backend response: { status: 200, data: { user } } or just data: user
     */
    getMe: async () => {
        try {
            const response = await apiClient.get('/auth/me');

            if (response.status !== 200) {
                // Fallback for ok check if apiClient didn't throw
                if (response.ok === false) {
                    return {
                        ok: false,
                        message: response.message || 'Không thể lấy thông tin người dùng'
                    };
                }
            }

            // Extract user. 
            // If backend returns { status: 200, data: { user: ... } } -> response.data.user
            // If backend returns { status: 200, data: userObject } -> response.data
            // Based on other services, likely response.data is the payload.
            // Let's assume response.data might contain user nested or direct.
            // Safe check:
            const body = response.data || response; // In case apiClient interceptor variation
            const rawUser = body.user || body; // Try nested 'user' first, then body itself

            if (!rawUser) {
                return {
                    ok: false,
                    message: 'Dữ liệu user không hợp lệ'
                };
            }

            // Normalize
            let normalizedRole = (rawUser.Role?.R_Name || rawUser.roleName || 'user').toLowerCase();

            // Map backend roles to frontend roles (STRICT - 5 roles only)
            if (normalizedRole === 'admin' || normalizedRole === 'administrator' || normalizedRole === 'system') {
                normalizedRole = 'admin';
            } else if (normalizedRole === 'user' || normalizedRole === 'nhanvien' || normalizedRole === 'employee') {
                normalizedRole = 'staff';
            } else if (normalizedRole === 'manager' || normalizedRole === 'truongphong') {
                normalizedRole = 'leader';
            } else if (normalizedRole === 'sep' || normalizedRole === 'director') {
                normalizedRole = 'director';
            }
            // director, pmo, staff, leader, admin remain unchanged

            const user = {
                ...rawUser,
                id: rawUser.A_ID || rawUser.aid,
                username: rawUser.UserName || rawUser.username,
                name: rawUser.Account_Name || rawUser.Name || rawUser.name || rawUser.UserName || rawUser.username,
                role: normalizedRole,
                m_id: rawUser.Member?.M_ID || rawUser.M_ID
            };

            return {
                ok: true,
                data: user
            };
        } catch (error) {
            console.error('authService.getMe error:', error);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Change password
     * Returns: { ok: boolean, message }
     */
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await apiClient.post('/auth/change-password', {
                currentPassword,
                newPassword
            });

            if (response.ok === false) {
                return {
                    ok: false,
                    message: response.message || 'Đổi mật khẩu thất bại'
                };
            }

            return {
                ok: true,
                message: 'Đổi mật khẩu thành công'
            };
        } catch (error) {
            console.error('authService.changePassword error:', error);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Logout - clear local token
     */
    logout: () => {
        localStorage.removeItem('accessToken');
    }
};
