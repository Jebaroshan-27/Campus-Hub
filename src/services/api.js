import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Configure API Base URL:
 * 1. Reads process.env.EXPO_PUBLIC_API_URL if configured.
 * 2. On Android/physical devices on LAN, uses current machine IP (10.104.102.37).
 * 3. Falls back to localhost for Web / iOS simulators.
 */
const DEFAULT_HOST = Platform.OS === 'android' ? '10.104.102.37' : 'localhost';
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_HOST}:5000/api`;

export const STORAGE_KEYS = {
  TOKEN: '@campushub_auth_token',
  USER: '@campushub_auth_user',
};

// Create Centralized Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let currentAuthToken = null;
let unauthorizedHandler = null;

export const setAuthToken = (token) => {
  currentAuthToken = token;
};

export const clearAuthToken = () => {
  currentAuthToken = null;
};

export const onUnauthorized = (callback) => {
  unauthorizedHandler = callback;
};

// Request Interceptor: Injects Authorization Bearer JWT
apiClient.interceptors.request.use(
  async (config) => {
    let token = currentAuthToken;
    if (!token) {
      try {
        token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          currentAuthToken = token;
        }
      } catch (err) {
        // Fallback silently if storage read fails
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages & handle 401 session expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message = 'Something went wrong. Please check your connection and try again.';

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        message = error.response.data?.message || 'Session expired. Please log in again.';
        // If unauthorized and handler registered, notify AuthContext
        if (unauthorizedHandler) {
          unauthorizedHandler();
        }
      } else if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (status === 404) {
        message = 'The requested endpoint was not found.';
      } else if (status === 409) {
        message = error.response.data?.message || 'Conflict: Record already exists.';
      } else if (status >= 500) {
        message = 'Internal server error. Please try again later.';
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Make sure the Node.js server is running on port 5000.';
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
