/**
 * API Configuration
 * All API calls should go through API Gateway on port 4000
 */

export const API_GATEWAY_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

// API endpoints through gateway
export const API_ENDPOINTS = {
  // Admin Service - via /api/admin/*
  ADMIN: {
    PROPERTIES: `${API_GATEWAY_URL}/api/admin/properties`,
    PROPERTIES_STATS: `${API_GATEWAY_URL}/api/admin/properties/stats`,
    PROPERTY_BY_ID: (id) => `${API_GATEWAY_URL}/api/admin/properties/${id}`,
    CREATE_AND_MINT: `${API_GATEWAY_URL}/api/admin/properties/create-and-mint`,
    HEALTH: `${API_GATEWAY_URL}/api/admin/health`,
  },

  // Auth Service - via /api/auth/*
  AUTH: {
    STATS: `${API_GATEWAY_URL}/api/auth/stats`,
    USERS_RECENT: `${API_GATEWAY_URL}/api/auth/users/recent`,
    LINK_WALLET: `${API_GATEWAY_URL}/api/auth/link-wallet`,
    HEALTH: `${API_GATEWAY_URL}/api/auth/health`,
  },

  // Blockchain Service - via /api/blockchain/*
  BLOCKCHAIN: {
    TOTAL_SUPPLY: `${API_GATEWAY_URL}/api/blockchain/total-supply`,
    NFT_BY_ID: (id) => `${API_GATEWAY_URL}/api/blockchain/nft/${id}`,
    HEALTH: `${API_GATEWAY_URL}/api/blockchain/health`,
  },

  // Marketplace Service - via /api/marketplace/*
  MARKETPLACE: {
    BASE: `${API_GATEWAY_URL}/api/marketplace`,
    LISTINGS: `${API_GATEWAY_URL}/api/marketplace/listings`,
    ORDERS: `${API_GATEWAY_URL}/api/marketplace/orders`,
    HEALTH: `${API_GATEWAY_URL}/api/marketplace/health`,
  },

  // IPFS Service - via /api/ipfs/*
  IPFS: {
    UPLOAD_IMAGE: `${API_GATEWAY_URL}/api/ipfs/upload/image`,
    UPLOAD_DOCUMENT: `${API_GATEWAY_URL}/api/ipfs/upload/document`,
    UPLOAD_METADATA: `${API_GATEWAY_URL}/api/ipfs/upload/metadata`,
    CONTENT: (hash) => `${API_GATEWAY_URL}/api/ipfs/content/${hash}`,
    HEALTH: `${API_GATEWAY_URL}/api/ipfs/health`,
  },

  // User Service - via /api/user/* (TEMPORARILY DIRECT FOR TESTING)
  USER: {
    MY_PROPERTIES: `http://localhost:4006/my-properties`,
    HEALTH: `${API_GATEWAY_URL}/api/user/health`,
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("viepropchain_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch wrapper with auth
export const authenticatedFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
