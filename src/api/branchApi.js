import axios from './axios';

export const branchApi = {
    getAllBranches: async () => {
        const response = await axios.get('/branches');
        return response.data; // { success: true, data: [...] }
    },

    createBranch: async (data) => {
        const response = await axios.post('/branches', data);
        return response.data;
    },

    deleteBranch: async (roCode) => {
        const response = await axios.delete(`/branches/${roCode}`);
        return response.data;
    }
};
