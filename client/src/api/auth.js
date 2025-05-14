import axios from 'axios';
import API_URL from './config';

// Register user
export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/register`, userData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/auth/me`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};