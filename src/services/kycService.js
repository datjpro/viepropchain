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
      console.log("📤 Submitting KYC:", kycData);
      const response = await apiClient.post("/api/kyc", kycData);
      console.log("✅ KYC submitted:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Submit KYC error:", error);
      throw handleApiError(error, "Failed to submit KYC");
    }
  },

  /**
   * Get KYC status for current user
   * Returns: { success: true, data: { userId, email, isVerified } }
   */
  getKYCStatus: async () => {
    try {
      console.log("🔍 Checking KYC status...");
      const response = await apiClient.get("/api/kyc/me/verified");
      console.log("✅ KYC status:", response.data);
      return response.data;
    } catch (error) {
      // If 404, user hasn't submitted KYC yet
      if (error.response?.status === 404) {
        console.log("ℹ️ No KYC record found");
        return {
          success: true,
          data: { isVerified: false, status: "not_submitted" },
        };
      }
      console.error("❌ Get KYC status error:", error);
      throw handleApiError(error, "Failed to check KYC status");
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
   * Check if current user is verified (legacy)
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
