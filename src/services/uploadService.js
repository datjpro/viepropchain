/**
 * ========================================================================
 * UPLOAD SERVICE - Upload files to IPFS
 * ========================================================================
 */

import { API_ENDPOINTS } from "../config/api";

class UploadService {
  /**
   * Upload image to IPFS
   * @param {File} file - Image file object
   * @param {string} propertyId - Optional property ID
   * @returns {Promise<{success: boolean, url: string, ipfsUrl: string, cid: string}>}
   */
  async uploadImage(file, propertyId = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (propertyId) {
        formData.append("propertyId", propertyId);
      }

      const token = localStorage.getItem("viepropchain_token");

      const response = await fetch(API_ENDPOINTS.IPFS.UPLOAD_IMAGE, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      return {
        success: true,
        url: data.data.url, // Pinata gateway URL
        ipfsUrl: data.data.ipfsUrl, // IPFS URL
        cid: data.data.cid,
        filename: data.data.filename,
        size: data.data.size,
      };
    } catch (error) {
      console.error("❌ Upload image error:", error);
      throw error;
    }
  }

  /**
   * Upload document to IPFS (encrypted)
   * @param {File} file - Document file object
   * @param {string} propertyId - Optional property ID
   * @returns {Promise<{success: boolean, url: string, cid: string}>}
   */
  async uploadDocument(file, propertyId = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (propertyId) {
        formData.append("propertyId", propertyId);
      }

      const token = localStorage.getItem("viepropchain_token");

      const response = await fetch(API_ENDPOINTS.IPFS.UPLOAD_DOCUMENT, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload document");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      return {
        success: true,
        url: data.data.url,
        ipfsUrl: data.data.ipfsUrl,
        cid: data.data.cid,
        filename: data.data.filename,
        size: data.data.size,
      };
    } catch (error) {
      console.error("❌ Upload document error:", error);
      throw error;
    }
  }

  /**
   * Upload multiple images sequentially
   * @param {File[]} files - Array of image files
   * @param {string} propertyId - Optional property ID
   * @param {Function} onProgress - Progress callback (current, total)
   * @returns {Promise<Array<{url: string, ipfsUrl: string, cid: string}>>}
   */
  async uploadMultipleImages(files, propertyId = null, onProgress = null) {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      if (onProgress) {
        onProgress(i + 1, files.length);
      }

      const result = await this.uploadImage(files[i], propertyId);
      results.push(result);
    }

    return results;
  }
}

export default new UploadService();
