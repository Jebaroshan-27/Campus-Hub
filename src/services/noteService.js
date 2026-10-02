import apiClient from './api';

/**
 * Fetch list of notes with optional search & filter parameters
 * @param {Object} params - { search, department, year, semester, subject, myNotes }
 * @returns {Promise<{ success: boolean, count: number, notes: Array }>}
 */
export const getNotes = async (params = {}) => {
  try {
    const cleanedParams = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        cleanedParams[key] = val;
      }
    });

    const response = await apiClient.get('/notes', { params: cleanedParams });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch detailed information for a single note
 * @param {string} id - MongoDB Note ObjectId
 * @returns {Promise<{ success: boolean, note: Object }>}
 */
export const getNoteById = async (id) => {
  try {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload a new study material / note document
 * @param {FormData} formData - Multipart form-data containing fields and file
 * @returns {Promise<{ success: boolean, message: string, note: Object }>}
 */
export const uploadNote = async (formData) => {
  try {
    const response = await apiClient.post('/notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Give sufficient timeout for file uploading to Cloudinary
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a note (Admin or author only)
 * @param {string} id - Note ID to delete
 * @returns {Promise<{ success: boolean, message: string, deletedId: string }>}
 */
export const deleteNote = async (id) => {
  try {
    const response = await apiClient.delete(`/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getNotes,
  getNoteById,
  uploadNote,
  deleteNote,
};
