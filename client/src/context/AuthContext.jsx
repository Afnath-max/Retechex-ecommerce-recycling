import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register
  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Login - supports both patterns
  const login = async (emailOrToken, passwordOrUser) => {
    // Pattern 1: login(token, user) - direct login with token and user object
    if (typeof passwordOrUser === 'object' && passwordOrUser !== null) {
      localStorage.setItem('token', emailOrToken);
      setUser(passwordOrUser);
      return { success: true, user: passwordOrUser };
    }
    
    // Pattern 2: login(email, password) - traditional login
    try {
      const response = await authAPI.login({ email: emailOrToken, password: passwordOrUser });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Update user
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Role checks
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (...roles) => roles.includes(user?.role);

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isStaff: user?.role === 'staff',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
