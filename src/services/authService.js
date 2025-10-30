/**
 * ========================================================================
 * AUTH SERVICE - Authentication API calls
 * ========================================================================
 * Tất cả API calls liên quan đến authentication
 * Đi qua API Gateway: /api/auth/*
 * ========================================================================
 */

import apiClient, { handleApiError } from "./api";

const authService = {
  /**
   * Get current user info (Gmail OAuth)
   */
  getMe: async () => {
    try {
      const response = await apiClient.get("/api/auth/me");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get user info");
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      const response = await apiClient.post("/api/auth/logout");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to logout");
    }
  },

  /**
   * Get link wallet message
   * @param {string} walletAddress - Wallet address to link
   */
  getLinkWalletMessage: async (walletAddress) => {
    try {
      const response = await apiClient.post("/api/auth/link-wallet/message", {
        walletAddress,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get link wallet message");
    }
  },

  /**
   * Link wallet with signature
   * @param {string} walletAddress - Wallet address
   * @param {string} signature - Signed message
   */
  linkWallet: async (walletAddress, signature) => {
    try {
      const response = await apiClient.post("/api/auth/link-wallet", {
        walletAddress,
        signature,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to link wallet");
    }
  },

  /**
   * Unlink wallet
   */
  unlinkWallet: async () => {
    try {
      const response = await apiClient.post("/api/auth/unlink-wallet");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to unlink wallet");
    }
  },

  // ========================================================================
  // LEGACY WALLET AUTH (Backward compatibility)
  // ========================================================================

  /**
   * Get nonce for wallet signature (Legacy)
   * @param {string} walletAddress - User's wallet address
   */
  getNonce: async (walletAddress) => {
    try {
      const response = await apiClient.post("/api/auth/get-nonce", {
        walletAddress,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get nonce");
    }
  },

  /**
   * Verify signature and login (Legacy)
   * @param {string} walletAddress - User's wallet address
   * @param {string} signature - Signed message
   */
  verifySignature: async (walletAddress, signature) => {
    try {
      const response = await apiClient.post("/api/auth/verify-signature", {
        walletAddress,
        signature,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to verify signature");
    }
  },
};

export default authService;
