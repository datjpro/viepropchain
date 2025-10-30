/**
 * ========================================================================
 * USER SERVICE - User Profile API calls
 * ========================================================================
 * Tất cả API calls liên quan đến user profiles
 * Đi qua API Gateway: /api/user/*
 * ========================================================================
 */

import apiClient, { handleApiError } from "./api";

const userService = {
  /**
   * Get user profile by userId
   * @param {string} userId - User ID
   */
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/api/user/profile/user/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get user profile");
    }
  },

  /**
   * Get my profile (current user)
   */
  getMyProfile: async () => {
    try {
      const response = await apiClient.get("/api/user/profile/me");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get profile");
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} profileData - Profile data to update
   */
  updateProfile: async (userId, profileData) => {
    try {
      const response = await apiClient.put(`/api/user/profile/user/${userId}`, profileData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to update profile");
    }
  },

  /**
   * Get user's favorites
   * @param {string} userId - User ID
   */
  getFavorites: async (userId) => {
    try {
      const response = await apiClient.get(`/api/user/profile/user/${userId}/favorites`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get favorites");
    }
  },

  /**
   * Add property to favorites
   * @param {string} userId - User ID
   * @param {string} propertyId - Property ID
   */
  addFavorite: async (userId, propertyId) => {
    try {
      const response = await apiClient.post(`/api/user/profile/user/${userId}/favorites`, {
        propertyId,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to add favorite");
    }
  },

  /**
   * Remove property from favorites
   * @param {string} userId - User ID
   * @param {string} propertyId - Property ID
   */
  removeFavorite: async (userId, propertyId) => {
    try {
      const response = await apiClient.delete(
        `/api/user/profile/user/${userId}/favorites/${propertyId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to remove favorite");
    }
  },

  /**
   * Get all user profiles (Admin)
   */
  getAllProfiles: async () => {
    try {
      const response = await apiClient.get("/api/user/profiles");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get all profiles");
    }
  },
};

export default userService;
