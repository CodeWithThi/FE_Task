import apiClient from '@/lib/apiClient';

export const accountService = {
    getAccounts: async () => {
        try {
            const res = await apiClient.get('/accounts');
            if (res.status === 200 || res.ok) {
                const rawData = res.data || res;
                const accounts = Array.isArray(rawData) ? rawData : (rawData.data || []);
                return {
                    ok: true,
                    data: accounts
                };
            }
            return {
                ok: false,
                message: res.message || 'Không thể tải danh sách tài khoản'
            };
        } catch (error) {
            console.error('accountService.getAccounts error:', error);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    },
    createAccount: async (data) => {
        try {
            const res = await apiClient.post('/accounts', data);
            if (res.status === 201 || res.status === 200 || res.ok) {
                return {
                    ok: true,
                    data: res.data,
                    message: 'Tạo tài khoản thành công'
                };
            }
            return {
                ok: false,
                message: res.message || 'Tạo tài khoản thất bại'
            };
        } catch (error) {
            console.error('accountService.createAccount error:', error);
            return {
                ok: false,
                message: 'Lỗi kết nối server'
            };
        }
    }
};
