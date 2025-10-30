/**
 * ========================================================================
 * IPFS SERVICE - IPFS/Pinata API calls
 * ========================================================================
 * Tất cả API calls liên quan đến IPFS uploads
 * Đi qua API Gateway: /api/ipfs/*
 * ========================================================================
 */

import apiClient, { handleApiError } from "./api";

const ipfsService = {
  /**
   * Upload image to IPFS
   * @param {File} file - Image file
   * @param {string} propertyId - Property ID (optional)
   */
  uploadImage: async (file, propertyId = null) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (propertyId) {
        formData.append("propertyId", propertyId);
      }

      const response = await apiClient.post(
        "/api/ipfs/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to upload image");
    }
  },

  /**
   * Upload document to IPFS
   * @param {File} file - Document file
   * @param {string} propertyId - Property ID (optional)
   * @param {string} documentType - Document type (e.g., 'legal', 'certificate')
   * @param {string} documentName - Document name
   */
  uploadDocument: async (
    file,
    propertyId = null,
    documentType = "legal",
    documentName = null
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (propertyId) {
        formData.append("propertyId", propertyId);
      }
      if (documentType) {
        formData.append("documentType", documentType);
      }
      if (documentName) {
        formData.append("documentName", documentName);
      }

      const response = await apiClient.post(
        "/api/ipfs/upload/document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to upload document");
    }
  },

  /**
   * Upload metadata JSON to IPFS
   * @param {object} metadata - Metadata object
   */
  uploadMetadata: async (metadata) => {
    try {
      const response = await apiClient.post(
        "/api/ipfs/upload/metadata",
        metadata
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to upload metadata");
    }
  },

  /**
   * Get content by CID
   * @param {string} cid - IPFS CID
   */
  getContentByCID: async (cid) => {
    try {
      const response = await apiClient.get(`/api/ipfs/content/${cid}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to get content");
    }
  },
};

export default ipfsService;
