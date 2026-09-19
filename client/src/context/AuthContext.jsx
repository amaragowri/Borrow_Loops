import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('borrowloop_token'));
  const [loading, setLoading] = useState(true);

  // Check auth session on load
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('borrowloop_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Failed to verify session token:', err.response?.data?.message || err.message);
        localStorage.removeItem('borrowloop_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('borrowloop_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Register handler (accepts FormData for profile image support)
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.data.success) {
      localStorage.setItem('borrowloop_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('borrowloop_token');
    setToken(null);
    setUser(null);
  };

  // Update user profile info
  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
