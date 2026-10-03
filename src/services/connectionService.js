import apiClient from './api';

/**
 * Search student by exact register number
 * @param {string} registerNumber
 * @returns {Promise<{ success: boolean, student: Object, connectionStatus: string, connectionId?: string }>}
 */
export const searchStudent = async (registerNumber) => {
  try {
    const cleaned = String(registerNumber || '').trim();
    const response = await apiClient.get(`/connections/search/${encodeURIComponent(cleaned)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send connection request to a student
 * @param {string} registerNumber
 * @returns {Promise<{ success: boolean, message: string, connection: Object }>}
 */
export const sendConnectionRequest = async (registerNumber) => {
  try {
    const cleaned = String(registerNumber || '').trim();
    const response = await apiClient.post('/connections/request', {
      registerNumber: cleaned,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all connections for the logged in student
 * @returns {Promise<{ success: boolean, counts: Object, pendingReceived: Array, pendingSent: Array, accepted: Array, blocked: Array }>}
 */
export const getConnections = async () => {
  try {
    const response = await apiClient.get('/connections');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Accept a received connection request
 * @param {string} connectionId
 * @returns {Promise<{ success: boolean, message: string, connection: Object }>}
 */
export const acceptConnection = async (connectionId) => {
  try {
    const response = await apiClient.post(`/connections/${connectionId}/accept`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject a received connection request
 * @param {string} connectionId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const rejectConnection = async (connectionId) => {
  try {
    const response = await apiClient.post(`/connections/${connectionId}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Block a connected student
 * @param {string} connectionId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const blockConnection = async (connectionId) => {
  try {
    const response = await apiClient.post(`/connections/${connectionId}/block`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  searchStudent,
  sendConnectionRequest,
  getConnections,
  acceptConnection,
  rejectConnection,
  blockConnection,
};
