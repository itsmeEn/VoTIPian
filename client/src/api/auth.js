import axios from 'axios';

// Register user
export const registerUser = async (userData) => {
  try {
    const res = await axios.post('/api/auth/register', userData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const res = await axios.post('/api/auth/login', { email, password });
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const res = await axios.get('/api/auth/me');
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};