import { API_URL } from '../config/api.config.js';
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from '../utils/auth.utils.js';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
    };

    export const apiClient = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const accessToken = getAccessToken();
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config = { ...options, headers };

    try {
        let response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 401) {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
            clearAuth();
            window.dispatchEvent(new CustomEvent('auth-expired'));
            throw new Error('Sesión expirada');
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
            }).then(newToken => {
            config.headers['Authorization'] = `Bearer ${newToken}`;
            return fetch(`${API_URL}${endpoint}`, config).then(res => parseResponse(res));
            });
        }

        isRefreshing = true;

        try {
            const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }) 
            });

            if (!refreshResponse.ok) throw new Error('Refresh token inválido');

            const data = await refreshResponse.json();
            const newAccessToken = data.data.accessToken; 

            setTokens(newAccessToken, null);
            
            isRefreshing = false;
            processQueue(null, newAccessToken);

            config.headers['Authorization'] = `Bearer ${newAccessToken}`;
            response = await fetch(`${API_URL}${endpoint}`, config);

        } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError, null);
            clearAuth();
            window.dispatchEvent(new CustomEvent('auth-expired'));
            throw refreshError;
        }
        }

        return await parseResponse(response);

    } catch (error) {
        throw error;
    }
};

const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    let responseData = null;
    if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
    }
    if (!response.ok) {
        throw { status: response.status, ...responseData };
    }
    return responseData;
};