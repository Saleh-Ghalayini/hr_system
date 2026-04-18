import axios from "axios";

export const baseApi = import.meta.env.VITE_Base_API;

let unauthorizedHandled = false;

export const resetUnauthorizedState = () => {
    unauthorizedHandled = false;
};

export const getToken = () =>
    localStorage.getItem('token') || sessionStorage.getItem('token');

export const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
});

export const request = async ({ method, path, data, params, headers }) => {
    const token = getToken();
    try {
        const response = await axios({
            method,
            url: baseApi + path,
            data,
            params,
            headers: {
                ...headers,
                "ngrok-skip-browser-warning": "69420",
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Request error:", {
            url: baseApi + path,
            method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            if (!url.includes('guest/login')) {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');

                // Signal auth state expiration without forcing a hard browser reload.
                if (!unauthorizedHandled && typeof window !== 'undefined') {
                    unauthorizedHandled = true;
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                }
            }
        }
        throw error;
    }
};
