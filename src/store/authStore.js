import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => {
                localStorage.setItem('authToken', token);
                localStorage.setItem('userInfo', JSON.stringify(user));
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (user) => set({ user })
        }),
        {
            name: 'auth-storage',
            getStorage: () => localStorage
        }
    )
);
