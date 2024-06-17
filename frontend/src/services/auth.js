import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/auth/';

export const register = async (name, email, password) => {
    const response = await axios.post(`${API_URL}register`, {
        name,
        email,
        password,
    });
    return response.data;
};

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}login`, {
        email,
        password,
    });
    return response.data;
};

export const getProfile = async (token) => {
    const response = await axios.get(`${API_URL}me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateProfile = async (name, password, isAdmin, token) => {
    const response = await axios.put(`${API_URL}update`, {
        name,
        password,
        isAdmin
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
