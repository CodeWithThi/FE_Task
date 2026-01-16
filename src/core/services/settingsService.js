
import apiClient from '@core/config/api';

export const settingsService = {
    getSettings: async () => {
        try {
            const response = await apiClient.get('/settings');
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateSettings: async (data) => {
        try {
            const response = await apiClient.put('/settings', data);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

