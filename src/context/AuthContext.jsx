import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, onUnauthorized } from '../services/api';
import {
  loginUser,
  registerUser,
  logoutUser,
  getStoredAuthSession,
} from '../services/authService';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore existing session and verify token with backend on launch
  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const session = await getStoredAuthSession();
      if (session?.token && session?.user) {
        setToken(session.token);
        setUser(session.user);
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    // Hook unauthorized callback from API interceptor
    onUnauthorized(() => {
      setUser(null);
      setToken(null);
    });
  }, [restoreSession]);

  /**
   * Log in user via backend API
   */
  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const result = await loginUser({ identifier, password });
      setToken(result.token);
      setUser(result.user);
      return result;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register user via backend API
   */
  const register = async (registrationData) => {
    setLoading(true);
    try {
      const result = await registerUser(registrationData);
      if (result.token && result.user) {
        setToken(result.token);
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user & remove stored credentials
   */
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update local user state & storage
   */
  const updateUser = async (updatedFields) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (err) {
      // Ignore storage sync errors
    }
  };

  /**
   * Quick role switch for development testing: logs into real seed user
   */
  const switchRole = async (targetRole) => {
    if (!targetRole) return;
    let identifier = '21BCS0142';
    if (targetRole === ROLES.FACULTY) identifier = 'FAC-CSE-109';
    if (targetRole === ROLES.ADMIN) identifier = 'ADM-IT-001';

    await login(identifier, 'password123');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
    register,
    updateUser,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
