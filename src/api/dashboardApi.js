import axios from './axios';

export const dashboardApi = {
    getStats: async (filters = {}) => {
        const response = await axios.get('/dashboard', { params: filters });
        return response.data;
    },

    getDailyComplaints: async (filters = {}) => {
        const response = await axios.get('/dashboard/daily-complaints', { params: filters });
        return response.data;
    },

    getNotVerifiedDistribution: async (filters = {}) => {
        const response = await axios.get('/dashboard/not-verified-distribution', { params: filters });
        return response.data;
    },

    getWashroomFeedback: async (filters = {}) => {
        const response = await axios.get('/dashboard/washroom-feedback', { params: filters });
        return response.data;
    },

    getFreeAirFeedback: async (filters = {}) => {
        const response = await axios.get('/dashboard/free-air-feedback', { params: filters });
        return response.data;
    },

    getDrinkingWaterFeedback: async (filters = {}) => {
        const response = await axios.get('/dashboard/drinking-water-feedback', { params: filters });
        return response.data;
    }
};
