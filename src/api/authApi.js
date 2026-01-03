import axios from './axios';

export const authApi = {
    login: async (username, password) => {
        const response = await axios.post('/auth/login', { username, password });
        return response.data;
    },

    logout: async () => {
        const response = await axios.post('/auth/logout');
        return response.data;
    },

    refreshToken: async () => {
        const response = await axios.post('/auth/refresh');
        return response.data;
    },

    getProfile: async () => {
        const response = await axios.get('/auth/profile'); // Changed from /user/profile to match backend router prefix
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await axios.post('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    }
};
