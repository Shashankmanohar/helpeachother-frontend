import { useApp } from '@/context/AppContext';
import api from '@/lib/api';
import { useCallback } from 'react';

export const useApi = () => {
    const { showToast } = useApp();

    const handleRequest = useCallback(async (requestPromise: Promise<any>) => {
        try {
            const response = await requestPromise;
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
            showToast(message, 'error');
            throw error;
        }
    }, [showToast]);

    return {
        get: (url: string, config?: any) => handleRequest(api.get(url, config)),
        post: (url: string, data?: any, config?: any) => handleRequest(api.post(url, data, config)),
        put: (url: string, data?: any, config?: any) => handleRequest(api.put(url, data, config)),
        delete: (url: string, config?: any) => handleRequest(api.delete(url, config)),
        patch: (url: string, data?: any, config?: any) => handleRequest(api.patch(url, data, config)),
    };
};
