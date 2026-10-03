import apiClient from './api';

/**
 * Fetch events with optional query filters (search, eventType, department, status, isPaid, creator)
 * @param {Object} params
 * @returns {Promise<{ success: boolean, count: number, events: Array }>}
 */
export const getEvents = async (params = {}) => {
  try {
    const cleanedParams = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        cleanedParams[key] = val;
      }
    });

    const response = await apiClient.get('/events', { params: cleanedParams });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch single event details by ID
 * @param {string} id
 * @returns {Promise<{ success: boolean, event: Object }>}
 */
export const getEventById = async (id) => {
  try {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new event (Faculty / Admin)
 * @param {Object} data
 * @returns {Promise<{ success: boolean, message: string, event: Object }>}
 */
export const createEvent = async (data) => {
  try {
    const response = await apiClient.post('/events', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing event (Faculty can only update own; Admin can update any)
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<{ success: boolean, message: string, event: Object }>}
 */
export const updateEvent = async (id, data) => {
  try {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete an event (Faculty can only delete own; Admin can delete any)
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string, deletedId: string }>}
 */
export const deleteEvent = async (id) => {
  try {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Register student for a free event
 * @param {string} eventId
 * @returns {Promise<{ success: boolean, message: string, registration: Object }>}
 */
export const registerFreeEvent = async (eventId) => {
  try {
    const response = await apiClient.post(`/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get student's current registration status for an event
 * @param {string} eventId
 * @returns {Promise<{ success: boolean, isRegistered: boolean, registration: Object|null }>}
 */
export const getRegistrationStatus = async (eventId) => {
  try {
    const response = await apiClient.get(`/events/${eventId}/registration`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all registrations for current logged-in student
 * @returns {Promise<{ success: boolean, count: number, registrations: Array }>}
 */
export const getMyRegistrations = async () => {
  try {
    const response = await apiClient.get('/my-registrations');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch attendee roster for an event (Faculty creator or Admin)
 * @param {string} eventId
 * @returns {Promise<{ success: boolean, count: number, event: Object, registrations: Array }>}
 */
export const getEventRegistrations = async (eventId) => {
  try {
    const response = await apiClient.get(`/events/${eventId}/registrations`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a Razorpay Order for a paid event
 * @param {string} eventId
 * @returns {Promise<{ success: boolean, orderId: string, amount: number, currency: string, keyId: string, event: Object, prefill: Object }>}
 */
export const createPaymentOrder = async (eventId) => {
  try {
    const response = await apiClient.post(`/events/${eventId}/create-order`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify Razorpay payment signature & confirm student registration
 * @param {string} eventId
 * @param {Object} paymentData - { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * @returns {Promise<{ success: boolean, message: string, registration: Object }>}
 */
export const verifyPayment = async (eventId, paymentData) => {
  try {
    const response = await apiClient.post(
      `/events/${eventId}/verify-payment`,
      paymentData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerFreeEvent,
  getRegistrationStatus,
  getMyRegistrations,
  getEventRegistrations,
  createPaymentOrder,
  verifyPayment,
};
