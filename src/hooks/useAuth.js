import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setAuth, logout: logoutStore, user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const login = async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authApi.login(username, password);

            if (response.success && response.token) {
                setAuth(response.user, response.token);
                navigate('/dashboard');
                return { success: true };
            } else {
                throw new Error('Login failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            logoutStore();
            navigate('/login');
        }
    };

    return {
        login,
        logout,
        loading,
        error,
        user,
        isAuthenticated
    };
};
