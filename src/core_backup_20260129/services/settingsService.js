
import { httpClient } from '@core/api';

export const settingsService = {
    getSettings: async () => {
        try {
            const response = await httpClient.get('/settings');

            console.log('DEBUG settingsService.getSettings response:', response);
            console.log('DEBUG response.data:', response.data);

            // Backend wraps in { status: 200, data: actualData }
            const backendPayload = response.data?.data || response.data;

            console.log('DEBUG backendPayload:', backendPayload);

            return {
                ok: true,
                data: backendPayload
            };
        } catch (error) {
            console.error('settingsService.getSettings error:', error);
            throw error;
        }
    },

    updateSettings: async (data) => {
        try {
            console.log('DEBUG settingsService.updateSettings payload:', data);

            const response = await httpClient.put('/settings', data);

            console.log('DEBUG updateSettings response:', response);

            const backendPayload = response.data?.data || response.data;

            return {
                ok: true,
                data: backendPayload
            };
        } catch (error) {
            console.error('settingsService.updateSettings error:', error);
            throw error;
        }
    }
};

