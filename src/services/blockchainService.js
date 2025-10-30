/**
 * ========================================================================
 * BLOCKCHAIN SERVICE - Blockchain API calls
 * ========================================================================
 * Tất cả API calls liên quan đến blockchain operations
 * Đi qua API Gateway: /api/blockchain/*
 * Note: Các operations này thường được gọi từ admin service,
 * frontend ít khi gọi trực tiếp
 * ========================================================================
 */

import apiClient, { handleApiError } from "./api";

const blockchainService = {
  /**
   * Get blockchain service health
   */
  getHealth: async () => {
    try {
      const response = await apiClient.get("/api/blockchain/health");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get blockchain health");
    }
  },

  /**
   * Get NFT info by token ID
   * @param {number} tokenId - NFT token ID
   */
  getNFT: async (tokenId) => {
    try {
      const response = await apiClient.get(`/api/blockchain/nft/${tokenId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get NFT");
    }
  },

  /**
   * Get NFTs by owner address
   * @param {string} ownerAddress - Owner wallet address
   */
  getNFTsByOwner: async (ownerAddress) => {
    try {
      const response = await apiClient.get(`/api/blockchain/nfts/${ownerAddress}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get NFTs by owner");
    }
  },

  /**
   * Get total token counter
   */
  getTokenCounter: async () => {
    try {
      const response = await apiClient.get("/api/blockchain/token-counter");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get token counter");
    }
  },

  /**
   * Mint NFT (Admin only - usually called from admin service)
   * @param {string} recipient - Recipient wallet address
   * @param {string} tokenURI - Token URI (IPFS link)
   */
  mintNFT: async (recipient, tokenURI) => {
    try {
      const response = await apiClient.post("/api/blockchain/mint", {
        recipient,
        tokenURI,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to mint NFT");
    }
  },

  /**
   * Transfer NFT (Admin only)
   * @param {string} from - From address
   * @param {string} to - To address
   * @param {number} tokenId - Token ID
   */
  transferNFT: async (from, to, tokenId) => {
    try {
      const response = await apiClient.post("/api/blockchain/transfer", {
        from,
        to,
        tokenId,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to transfer NFT");
    }
  },
};

export default blockchainService;
