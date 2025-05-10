const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
};

export default config;
