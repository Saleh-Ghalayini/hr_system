import axios from "axios";

export const baseApi = import.meta.env.VITE_Base_API;

export const getToken = () =>
    localStorage.getItem('token') || sessionStorage.getItem('token');

export const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
});

export const request = async ({ method, path, data, headers }) => {
    const token = getToken();
    try {
        const response = await axios({
            method,
            url: baseApi + path,
            data,
            headers: {
                ...headers,
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }
        throw error;
    }
};
