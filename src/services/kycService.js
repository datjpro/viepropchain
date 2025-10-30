/**
 * ========================================================================
 * KYC SERVICE - KYC Verification API calls
 * ========================================================================
 * Tất cả API calls liên quan đến KYC verification
 * Đi qua API Gateway: /api/kyc/*
 * ========================================================================
 */

import apiClient, { handleApiError } from "./api";

const kycService = {
  /**
   * Submit KYC information
   * @param {object} kycData - KYC data (fullName, idNumber)
   */
  submitKYC: async (kycData) => {
    try {
      const response = await apiClient.post("/api/kyc", kycData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to submit KYC");
    }
  },

  /**
   * Get my KYC information
   */
  getMyKYC: async () => {
    try {
      const response = await apiClient.get("/api/kyc/me");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get KYC info");
    }
  },

  /**
   * Check if current user is verified
   */
  checkVerified: async () => {
    try {
      const response = await apiClient.get("/api/kyc/me/verified");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to check verification status");
    }
  },

  /**
   * Get all verified users (Admin)
   */
  getAllVerifiedUsers: async () => {
    try {
      const response = await apiClient.get("/api/kyc/verified/all");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get verified users");
    }
  },

  /**
   * Get KYC statistics
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get("/api/kyc/statistics");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get KYC statistics");
    }
  },
};

export default kycService;
