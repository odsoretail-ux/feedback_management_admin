import axios from './axios';

export const feedbackApi = {
    getFeedbacks: async (params = {}) => {
        const response = await axios.get('/feedbacks', { params });
        return response.data;
    },

    getFeedbackDetail: async (id) => {
        const response = await axios.get(`/feedbacks/${id}`);
        return response.data;
    },

    reviewFeedback: async (id, status) => {
        const response = await axios.patch(`/feedbacks/${id}/review`, { status });
        return response.data;
    },

    getFilterOptions: async () => {
        const response = await axios.get('/filters/options');
        return response.data;
    },

    exportCSV: async (params = {}) => {
        const response = await axios.get('/feedbacks/export/csv', {
            params,
            responseType: 'blob'
        });
        return response;
    },

    updateWorkflowStatus: async (id, status, assignedTo = null, comments = null) => {
        const payload = { status, assignedTo, comments };
        const response = await axios.patch(`/feedbacks/${id}/workflow`, payload);
        return response.data;
    },

    getFieldOfficers: async (branchCode) => {
        const response = await axios.get('/users/fo', { params: { branchCode } });
        return response.data;
    }
};
