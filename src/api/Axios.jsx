import axios from 'axios';
import { REFRESH } from './Urls';

const AUTH_STORAGE_KEY = "porhaxaliAuth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://porhaxali-backend-production.up.railway.app/'
});

const readStoredAuth = () => {
    try {
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        return savedAuth ? JSON.parse(savedAuth) : {};
    } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return {};
    }
};

const writeStoredAuth = (auth) => {
    if (auth?.accessToken || auth?.jwtToken) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
        window.dispatchEvent(new CustomEvent("porhaxaliAuthUpdated", { detail: auth }));
    } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("porhaxaliAuthUpdated", { detail: {} }));
    }
};

api.interceptors.request.use((config) => {
    if (config.skipAuth) {
        return config;
    }

    const auth = readStoredAuth();
    const accessToken = auth.accessToken ?? auth.jwtToken;
    if (accessToken && !config.headers?.Authorization) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${accessToken}`,
        };
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (status !== 401 || !originalRequest || originalRequest._retry || originalRequest.skipAuth) {
            return Promise.reject(error);
        }

        const auth = readStoredAuth();
        if (!auth.refreshToken) {
            writeStoredAuth({});
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const refreshResponse = await api.post(
                REFRESH,
                { refreshToken: auth.refreshToken },
                { skipAuth: true }
            );

            const refreshed = refreshResponse.data.data;
            const accessToken = refreshed.accessToken ?? refreshed.token;
            const nextAuth = {
                ...auth,
                accessToken,
                jwtToken: accessToken,
                refreshToken: refreshed.refreshToken,
                userEmail: refreshed.email ?? auth.userEmail,
                userName: refreshed.name ?? auth.userName,
                userRole: refreshed.role ?? auth.userRole,
            };

            writeStoredAuth(nextAuth);
            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${accessToken}`,
            };

            return api(originalRequest);
        } catch (refreshError) {
            writeStoredAuth({});
            return Promise.reject(refreshError);
        }
    }
);

export default api;
