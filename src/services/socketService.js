import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from './api';

// Derive Socket server host (remove /api suffix)
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let socket = null;
let isConnecting = false;

/**
 * Initializes and connects the Socket.IO client using current JWT token
 * @returns {Promise<Socket>}
 */
export const connectSocket = async () => {
  if (socket && socket.connected) {
    return socket;
  }

  if (isConnecting && socket) {
    return socket;
  }

  try {
    isConnecting = true;
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      isConnecting = false;
      return null;
    }

    if (!socket) {
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        isConnecting = false;
      });

      socket.on('connect_error', () => {
        isConnecting = false;
      });

      socket.on('disconnect', () => {
        isConnecting = false;
      });
    } else if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
    }

    return socket;
  } catch (err) {
    isConnecting = false;
    return null;
  }
};

/**
 * Disconnects the Socket.IO client
 */
export const disconnectSocket = () => {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    socket = null;
    isConnecting = false;
  }
};

/**
 * Join conversation room for a connected student
 * @param {string} partnerId - ObjectId of other student
 */
export const joinConversation = async (partnerId) => {
  const s = await connectSocket();
  if (s) {
    s.emit('join_conversation', { partnerId });
  }
};

/**
 * Leave conversation room
 * @param {string} partnerId
 */
export const leaveConversation = (partnerId) => {
  if (socket && socket.connected) {
    socket.emit('leave_conversation', { partnerId });
  }
};

/**
 * Register listener for incoming real-time messages
 * @param {Function} callback
 */
export const listenForMessages = async (callback) => {
  const s = await connectSocket();
  if (s) {
    s.on('new_message', callback);
  }
};

/**
 * Remove listener for incoming messages
 * @param {Function} callback
 */
export const removeMessageListener = (callback) => {
  if (socket) {
    if (callback) {
      socket.off('new_message', callback);
    } else {
      socket.off('new_message');
    }
  }
};

export default {
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  listenForMessages,
  removeMessageListener,
};
