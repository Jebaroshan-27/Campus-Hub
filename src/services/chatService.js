import apiClient from './api';

/**
 * Fetch chat message history with a connected student
 * @param {string} userId - Partner student ObjectId
 * @returns {Promise<{ success: boolean, count: number, conversationKey: string, partner: Object, messages: Array, connectionId: string }>}
 */
export const getMessages = async (userId) => {
  try {
    const response = await apiClient.get(`/messages/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send a message to a connected student
 * @param {string} receiverId - Partner student ObjectId
 * @param {string} message - Message text
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const sendMessage = async (receiverId, message) => {
  try {
    const response = await apiClient.post('/messages', {
      receiverId,
      message,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getMessages,
  sendMessage,
};
