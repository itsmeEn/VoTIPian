import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUser({ ...response.data, token });
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (values) => {
    console.log("Login form data:", values);
    
    try {
      console.log("Login form data:", JSON.stringify(values, null, 2)); 
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        email: values.email,
        password: values.password
      });

      if (response.data.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          email: response.data.email,
          msg: response.data.msg || 'Please verify your email before logging in'
        };
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser({ ...response.data.user, token: response.data.token });
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Backend error response:', error.response?.data);
      throw new Error(error.response?.data?.msg || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const register = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        studentId: userData.studentId,
        department: userData.department,
        password: userData.password
      });

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.msg || 'Registration failed');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/profile`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setUser(prevUser => ({ ...prevUser, ...response.data }));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.msg || 'Failed to update profile');
    }
  };

  const value = {
    user,
    register,
    login,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
