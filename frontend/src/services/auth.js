import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/auth/';

export const register = async (name, email, password, isAdmin) => {
  console.log('Register service called');
  const response = await axios.post(API_URL + 'register', {
    name,
    email,
    password,
    isAdmin
  });
  console.log('Register response:', response.data);
  return response.data;
};

export const login = async (email, password) => {
  console.log('Login service called');
  const response = await axios.post(API_URL + 'login', {
    email,
    password
  });
  console.log('Login response:', response.data);
  return response.data;
};

export const getProfile = async (token) => {
  console.log('GetProfile service called');
  const response = await axios.get(API_URL + 'me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('GetProfile response:', response.data);
  return response.data;
};

export const updateProfile = async (name, password, isAdmin, token) => {
  console.log('UpdateProfile service called');
  const response = await axios.put(API_URL + 'update', {
    name,
    password,
    isAdmin
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('UpdateProfile response:', response.data);
  return response.data;
};
