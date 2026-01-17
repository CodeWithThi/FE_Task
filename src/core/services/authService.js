import { authApi } from '@core/api';

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
            const response = await authApi.login({ username, password });

            // Backend wraps data: response.data = { data: { tokens, user } }
            // Axios returns full response, so response.data is the backend response
            const backendData = response.data?.data || response.data; // Handle both wrapped and unwrapped
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
                m_id: rawUser.Member?.M_ID || rawUser.M_ID,
                avatar: rawUser.Avatar ? `http://localhost:3069${rawUser.Avatar}` : null
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
                message: error.response?.data?.message || 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Get current user info
     * Backend response: { status: 200, data: { user } } or just data: user
     */
    getMe: async () => {
        try {
            const response = await authApi.getMe();

            // DEBUG: Log raw response to understand structure
            console.log('=== authService.getMe() DEBUG ===');
            console.log('Full response:', response);
            console.log('response.data:', response.data);
            console.log('response.status:', response.status);

            if (response.status !== 200) {
                // Fallback for ok check if httpClient didn't throw
                if (response.ok === false) {
                    return {
                        ok: false,
                        message: response.message || 'Không thể lấy thông tin người dùng'
                    };
                }
            }

            // Extract user from response
            // axios returns: { status: 200, data: <backend_payload>, ... }
            // Backend returns: { data: userObject } OR just userObject
            let rawUser = null;

            if (response.data) {
                // Check if backend wrapped in { data: user }
                if (response.data.data) {
                    rawUser = response.data.data;
                } else if (response.data.user) {
                    rawUser = response.data.user;
                } else {
                    // Direct user object
                    rawUser = response.data;
                }
            } else {
                rawUser = response;
            }

            console.log('Extracted rawUser:', rawUser);

            if (!rawUser || !rawUser.A_ID) {
                console.error('Invalid user data:', rawUser);
                return {
                    ok: false,
                    message: 'Dữ liệu user không hợp lệ'
                };
            }

            // Normalize
            let normalizedRole = (rawUser.Role?.R_Name || rawUser.roleName || 'user').toLowerCase();
            console.log('Original role:', rawUser.Role?.R_Name || rawUser.roleName);
            console.log('Normalized role (before mapping):', normalizedRole);

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

            console.log('Final mapped role:', normalizedRole);

            const user = {
                ...rawUser,
                id: rawUser.A_ID || rawUser.aid,
                username: rawUser.UserName || rawUser.username,
                name: rawUser.Account_Name || rawUser.Name || rawUser.name || rawUser.UserName || rawUser.username,
                role: normalizedRole,
                m_id: rawUser.Member?.M_ID || rawUser.M_ID,
                avatar: rawUser.Avatar ? `http://localhost:3069${rawUser.Avatar}` : null
            };

            console.log('Final user object:', user);

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
    changePassword: async (oldPassword, newPassword) => {
        try {
            // Note: changePassword API might need to be added to authApi
            // For now, using httpClient directly
            const { httpClient } = await import('@core/api');
            const response = await httpClient.post('/auth/change-password', {
                oldPassword,
                newPassword,
                confirmPassword: newPassword
            });

            return {
                ok: true,
                message: response.data?.message || 'Đổi mật khẩu thành công'
            };
        } catch (error) {
            console.error('authService.changePassword error:', error);
            return {
                ok: false,
                message: error.response?.data?.message || 'Lỗi kết nối server'
            };
        }
    },

    /**
     * Forgot Password
     */
    forgotPassword: async (email) => {
        try {
            const response = await authApi.forgotPassword(email);
            return { ok: true, message: response.data?.message || 'Đã gửi email reset password' };
        } catch (error) {
            console.error('authService.forgotPassword error:', error);
            return { ok: false, message: error.response?.data?.message || 'Lỗi kết nối server' };
        }
    },

    /**
     * Reset Password
     */
    resetPassword: async (token, email, newPassword) => {
        try {
            const response = await authApi.resetPassword(token, email, newPassword);
            return { ok: true, message: response.data?.message || 'Đặt lại mật khẩu thành công' };
        } catch (error) {
            console.error('authService.resetPassword error:', error);
            return { ok: false, message: error.response?.data?.message || 'Lỗi kết nối server' };
        }
    },

    /**
     * Logout - clear local token
     */
    logout: () => {
        localStorage.removeItem('accessToken');
    }
};
