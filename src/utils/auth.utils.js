const API_URL = 'http://localhost:3000';

let isRefreshing = false;
let pendingRequests = [];

const getAccessToken = () => localStorage.getItem('tm_accessToken');
const getRefreshToken = () => localStorage.getItem('tm_refreshToken');

const setTokens = (access, refresh) => {
    localStorage.setItem('tm_accessToken', access);
    if (refresh) localStorage.setItem('tm_refreshToken', refresh);
};

const clearTokens = () => {
    localStorage.removeItem('tm_accessToken');
    localStorage.removeItem('tm_refreshToken');
};

const processQueue = (error, token = null) => {
    pendingRequests.forEach(req => {
        if (error) req.reject(error);
        else req.resolve(token);
    });
    pendingRequests = [];
};

const makeRequest = (endpoint, options, token) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });
};

export const apiFetch = async (endpoint, options = {}) => {
    let res = await makeRequest(endpoint, options, getAccessToken());

    if (res.status !== 401) return res;

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            pendingRequests.push({
                resolve: (newToken) => resolve(makeRequest(endpoint, options, newToken)),
                reject: (err) => reject(err),
            });
        });
    }

    isRefreshing = true;

    try {
        const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: getRefreshToken() }),
        });

        if (!refreshRes.ok) throw new Error('Refresh invalid');

        const data = await refreshRes.json();
        const newAccessToken = data?.data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken;

        if (!newAccessToken) throw new Error('No access token in refresh response');

        setTokens(newAccessToken, newRefreshToken);
        res = await makeRequest(endpoint, options, newAccessToken);
        processQueue(null, newAccessToken);

        return res;

    } catch (err) {
        processQueue(err, null);
        clearTokens();
        window.location.hash = '#/login';
        throw new Error('Sesión expirada');
    } finally {
        isRefreshing = false;
    }
};