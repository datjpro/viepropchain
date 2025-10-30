/**
 * ========================================================================
 * MARKETPLACE SERVICE - Marketplace API calls
 * ========================================================================
 * Tất cả API calls liên quan đến NFT marketplace
 * Đi qua API Gateway: /api/marketplace/*
 * ========================================================================
 */

import apiClient, { handleApiError } from "./api";

const marketplaceService = {
  // ========================================================================
  // LISTINGS
  // ========================================================================

  /**
   * Browse all active listings
   * @param {object} params - Filter parameters
   */
  getListings: async (params = {}) => {
    try {
      const response = await apiClient.get("/api/marketplace/listings", {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get listings");
    }
  },

  /**
   * Get listing by ID
   * @param {string} listingId - Listing ID
   */
  getListingById: async (listingId) => {
    try {
      const response = await apiClient.get(
        `/api/marketplace/listings/${listingId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get listing");
    }
  },

  /**
   * Get listing by token ID
   * @param {number} tokenId - NFT token ID
   */
  getListingByTokenId: async (tokenId) => {
    try {
      const response = await apiClient.get(
        `/api/marketplace/listings/token/${tokenId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get listing");
    }
  },

  /**
   * Create new listing
   * @param {object} listingData - Listing data
   */
  createListing: async (listingData) => {
    try {
      const response = await apiClient.post(
        "/api/marketplace/listings",
        listingData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to create listing");
    }
  },

  /**
   * Update listing
   * @param {string} listingId - Listing ID
   * @param {object} updateData - Update data (price, description)
   */
  updateListing: async (listingId, updateData) => {
    try {
      const response = await apiClient.put(
        `/api/marketplace/listings/${listingId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to update listing");
    }
  },

  /**
   * Cancel listing
   * @param {string} listingId - Listing ID
   */
  cancelListing: async (listingId) => {
    try {
      const response = await apiClient.delete(
        `/api/marketplace/listings/${listingId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to cancel listing");
    }
  },

  /**
   * Get my listings
   * @param {string} status - Filter by status (optional)
   */
  getMyListings: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(
        "/api/marketplace/listings/my/listings",
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get my listings");
    }
  },

  /**
   * Track listing view
   * @param {string} listingId - Listing ID
   */
  trackListingView: async (listingId) => {
    try {
      const response = await apiClient.post(
        `/api/marketplace/listings/${listingId}/view`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to track view");
    }
  },

  // ========================================================================
  // OFFERS
  // ========================================================================

  /**
   * Create new offer
   * @param {object} offerData - Offer data (listingId, price, message)
   */
  createOffer: async (offerData) => {
    try {
      const response = await apiClient.post(
        "/api/marketplace/offers",
        offerData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to create offer");
    }
  },

  /**
   * Get offers for a listing
   * @param {string} listingId - Listing ID
   * @param {string} status - Filter by status (optional)
   */
  getOffersByListing: async (listingId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(
        `/api/marketplace/offers/listing/${listingId}`,
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get offers");
    }
  },

  /**
   * Get my offers (as buyer)
   * @param {string} status - Filter by status (optional)
   */
  getMyOffers: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(
        "/api/marketplace/offers/my/offers",
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get my offers");
    }
  },

  /**
   * Get offers received on my listings (as seller)
   * @param {string} status - Filter by status (optional)
   */
  getOffersReceived: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(
        "/api/marketplace/offers/my/received",
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get received offers");
    }
  },

  /**
   * Accept offer (seller only)
   * @param {string} offerId - Offer ID
   * @param {string} transactionHash - Blockchain transaction hash
   */
  acceptOffer: async (offerId, transactionHash) => {
    try {
      const response = await apiClient.post(
        `/api/marketplace/offers/${offerId}/accept`,
        {
          transactionHash,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to accept offer");
    }
  },

  /**
   * Reject offer (seller only)
   * @param {string} offerId - Offer ID
   * @param {string} message - Rejection message (optional)
   */
  rejectOffer: async (offerId, message = null) => {
    try {
      const response = await apiClient.post(
        `/api/marketplace/offers/${offerId}/reject`,
        {
          message,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to reject offer");
    }
  },

  /**
   * Cancel offer (buyer only)
   * @param {string} offerId - Offer ID
   */
  cancelOffer: async (offerId) => {
    try {
      const response = await apiClient.delete(
        `/api/marketplace/offers/${offerId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to cancel offer");
    }
  },
};

export default marketplaceService;
