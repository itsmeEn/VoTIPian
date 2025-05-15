const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'https://votipian.onrender.com/api',
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
};

export default config;
