/**
 * ========================================================================
 * PROPERTY SERVICE - Property & NFT API calls
 * ========================================================================
 * Tất cả API calls liên quan đến properties và NFTs
 * Đi qua API Gateway:
 * - /api/admin/* - CRUD operations (Admin only)
 * - /api/query/* - Read operations (Public)
 * ========================================================================
 */

import apiClient, { handleApiError } from "./api";

const propertyService = {
  // ========================================================================
  // QUERY SERVICE (Public - Read only)
  // ========================================================================

  /**
   * Search properties with filters
   * @param {object} params - Search parameters (page, limit, filters, etc.)
   */
  searchProperties: async (params = {}) => {
    try {
      const response = await apiClient.get("/api/query/properties", { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to search properties");
    }
  },

  /**
   * Get property detail by ID
   * @param {string} propertyId - Property ID
   */
  getPropertyById: async (propertyId) => {
    try {
      const response = await apiClient.get(`/api/query/properties/${propertyId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get property");
    }
  },

  /**
   * Get featured properties
   * @param {number} limit - Number of properties to get
   */
  getFeaturedProperties: async (limit = 10) => {
    try {
      const response = await apiClient.get("/api/query/properties/featured/list", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get featured properties");
    }
  },

  /**
   * Track property view
   * @param {string} propertyId - Property ID
   * @param {string} userId - User ID (optional)
   */
  trackView: async (propertyId, userId = null) => {
    try {
      const response = await apiClient.post(`/api/query/properties/${propertyId}/view`, {
        userId,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to track view");
    }
  },

  /**
   * Get statistics overview
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get("/api/query/stats/overview");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get statistics");
    }
  },

  /**
   * Get price trends
   * @param {object} params - Filter parameters (propertyType, city, days)
   */
  getPriceTrends: async (params = {}) => {
    try {
      const response = await apiClient.get("/api/query/stats/price-trends", { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get price trends");
    }
  },

  /**
   * Get NFT info by token ID
   * @param {number} tokenId - NFT token ID
   */
  getNFTInfo: async (tokenId) => {
    try {
      const response = await apiClient.get(`/api/query/nfts/${tokenId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get NFT info");
    }
  },

  /**
   * Get list of cities
   */
  getCities: async () => {
    try {
      const response = await apiClient.get("/api/query/locations/cities");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get cities");
    }
  },

  /**
   * Get districts by city
   * @param {string} city - City name
   */
  getDistricts: async (city) => {
    try {
      const response = await apiClient.get("/api/query/locations/districts", {
        params: { city },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get districts");
    }
  },

  // ========================================================================
  // ADMIN SERVICE (Protected - CRUD operations)
  // ========================================================================

  /**
   * Create new property (Admin only)
   * @param {object} propertyData - Property data
   */
  createProperty: async (propertyData) => {
    try {
      const response = await apiClient.post("/api/admin/properties", propertyData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to create property");
    }
  },

  /**
   * Update property (Admin only)
   * @param {string} propertyId - Property ID
   * @param {object} propertyData - Property data to update
   */
  updateProperty: async (propertyId, propertyData) => {
    try {
      const response = await apiClient.put(`/api/admin/properties/${propertyId}`, propertyData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to update property");
    }
  },

  /**
   * Delete/Archive property (Admin only)
   * @param {string} propertyId - Property ID
   */
  deleteProperty: async (propertyId) => {
    try {
      const response = await apiClient.delete(`/api/admin/properties/${propertyId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to delete property");
    }
  },

  /**
   * Mint property as NFT (Admin only)
   * @param {string} propertyId - Property ID
   * @param {string} recipient - Recipient wallet address
   */
  mintPropertyNFT: async (propertyId, recipient) => {
    try {
      const response = await apiClient.post(`/api/admin/properties/${propertyId}/mint`, {
        recipient,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to mint NFT");
    }
  },

  /**
   * Get admin statistics
   */
  getAdminStatistics: async () => {
    try {
      const response = await apiClient.get("/api/admin/properties/stats/overview");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get admin statistics");
    }
  },
};

export default propertyService;
