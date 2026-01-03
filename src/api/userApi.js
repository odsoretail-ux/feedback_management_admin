import axiosClient from './axios';

export const userApi = {
    getAllUsers: () => axiosClient.get('/users/'),
    createUser: (userData) => axiosClient.post('/users/', userData),
    updateUser: (id, userData) => axiosClient.put(`/users/${id}`, userData),
    deleteUser: (id) => axiosClient.delete(`/users/${id}`),
    resetPassword: (id, newPassword) => axiosClient.post(`/users/${id}/reset-password`, { newPassword }),
};
