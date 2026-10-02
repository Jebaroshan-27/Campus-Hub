import apiClient from './api';

/**
 * Fetch placement drives with optional search & filter parameters
 * @param {Object} params - { search, department, year, workMode, status }
 * @returns {Promise<{ success: boolean, count: number, placements: Array }>}
 */
export const getPlacements = async (params = {}) => {
  try {
    const cleanedParams = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        cleanedParams[key] = val;
      }
    });

    const response = await apiClient.get('/placements', { params: cleanedParams });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch single placement drive by ID
 * @param {string} id - Placement MongoDB ObjectId
 * @returns {Promise<{ success: boolean, placement: Object }>}
 */
export const getPlacementById = async (id) => {
  try {
    const response = await apiClient.get(`/placements/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new placement drive (Admin only)
 * @param {Object} data - Placement details payload
 * @returns {Promise<{ success: boolean, message: string, placement: Object }>}
 */
export const createPlacement = async (data) => {
  try {
    const response = await apiClient.post('/placements', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing placement drive (Admin only)
 * @param {string} id - Placement ID
 * @param {Object} data - Updated fields payload
 * @returns {Promise<{ success: boolean, message: string, placement: Object }>}
 */
export const updatePlacement = async (id, data) => {
  try {
    const response = await apiClient.put(`/placements/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a placement drive (Admin only)
 * @param {string} id - Placement ID
 * @returns {Promise<{ success: boolean, message: string, deletedId: string }>}
 */
export const deletePlacement = async (id) => {
  try {
    const response = await apiClient.delete(`/placements/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
};
