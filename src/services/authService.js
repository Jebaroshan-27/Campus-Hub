import apiClient, { STORAGE_KEYS, setAuthToken, clearAuthToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * =========================================================================
 * REAL BACKEND AUTHENTICATION SERVICE (STEP 4)
 * =========================================================================
 * Connected to Node.js / Express / MongoDB / JWT API on port 5000.
 */

/**
 * Login user via POST /api/auth/login
 */
export const loginUser = async ({ identifier, password }) => {
  const cleanId = (identifier || '').trim();
  const cleanPw = (password || '').trim();

  if (!cleanId || !cleanPw) {
    throw new Error('Please enter your register number or email and password.');
  }

  const response = await apiClient.post('/auth/login', {
    identifier: cleanId,
    password: cleanPw,
  });

  const { token, user } = response.data;

  if (!token || !user) {
    throw new Error('Authentication response did not provide a valid session token.');
  }

  // Persist session to AsyncStorage
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  setAuthToken(token);

  return { token, user };
};

/**
 * Register user via POST /api/auth/register
 */
export const registerUser = async (registrationData) => {
  const { name, registerNumber, email, password, role = 'student', department, year } = registrationData;

  const payload = {
    name: (name || '').trim(),
    registerNumber: (registerNumber || '').trim().toUpperCase(),
    email: (email || '').trim().toLowerCase(),
    password,
    role: role || 'student',
    department: (department || '').trim(),
    year: (year || '').trim(),
  };

  const response = await apiClient.post('/auth/register', payload);
  const { token, user } = response.data;

  if (token && user) {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setAuthToken(token);
  }

  return { token, user, message: response.data.message };
};

/**
 * Real session restoration:
 * Reads cached token and verifies with backend via GET /api/auth/me
 */
export const getStoredAuthSession = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      return { token: null, user: null };
    }

    // Set token for outgoing verification request
    setAuthToken(token);

    // Verify token with backend database
    const response = await apiClient.get('/auth/me');

    if (response.data && response.data.success && response.data.user) {
      const verifiedUser = response.data.user;
      // Sync fresh user data to storage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(verifiedUser));
      return { token, user: verifiedUser };
    }

    // If verification unsuccessful, clear token
    await clearStoredAuth();
    return { token: null, user: null };
  } catch (error) {
    // If backend returns 401 or token is invalid, clear stale credentials
    await clearStoredAuth();
    return { token: null, user: null };
  }
};

/**
 * Clear stored auth credentials from device storage
 */
export const clearStoredAuth = async () => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
  } catch (err) {
    // Ignore storage clear error
  }
  clearAuthToken();
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  await clearStoredAuth();
  return { success: true };
};

/**
 * Request password reset verification code via POST /api/auth/forgot-password
 */
export const requestPasswordReset = async (identifier) => {
  const cleanId = (identifier || '').trim();
  if (!cleanId) {
    throw new Error('Please enter your registered email or register number.');
  }

  const response = await apiClient.post('/auth/forgot-password', {
    identifier: cleanId,
  });

  return response.data;
};

/**
 * Reset password via POST /api/auth/reset-password
 */
export const resetPasswordWithOtp = async ({ identifier, otp, newPassword }) => {
  const cleanId = (identifier || '').trim();
  const cleanOtp = (otp || '').trim();

  if (!cleanId || !cleanOtp || !newPassword) {
    throw new Error('Please enter verification code and new password.');
  }

  const response = await apiClient.post('/auth/reset-password', {
    identifier: cleanId,
    otp: cleanOtp,
    newPassword,
  });

  return response.data;
};

export default {
  loginUser,
  registerUser,
  getStoredAuthSession,
  logoutUser,
  clearStoredAuth,
  requestPasswordReset,
  resetPasswordWithOtp,
};
