import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://helpeachother-backend.vercel.app', // Using backend Vercel URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add tokens
api.interceptors.request.use(
    (config) => {
        // Use admin token for admin routes, user token for everything else
        const isAdminRoute = config.url?.includes('/api/admin');
        const token = isAdminRoute
            ? localStorage.getItem('heo_admin_token')
            : (localStorage.getItem('heo_token') || localStorage.getItem('heo_admin_token'));
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        console.error('API Error Response:', error.response?.data);
        console.error('API Error Message:', message);
        return Promise.reject(error);
    }
);

export default api;
