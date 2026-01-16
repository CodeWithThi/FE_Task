import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3069/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => {
        // If the API returns { ok: false, message: ... }, we can handle it here or let the component handle it
        // For now, allow 2xx responses to pass through
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: dispatch logout or redirect to login
            // window.location.href = '/login'; 
        }
        return Promise.reject(error.response ? error.response.data : error);
    }
);

export default apiClient;

