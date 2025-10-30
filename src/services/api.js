/**
 * ========================================================================
 * API SERVICE - Central API Configuration
 * ========================================================================
 * Tất cả requests từ frontend đều đi qua API Gateway (port 4000)
 * ========================================================================
 */

import axios from "axios";

// API Gateway URL - điểm vào duy nhất
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("viepropchain_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized - Token expired or invalid");
      localStorage.removeItem("viepropchain_token");
      // Redirect to home or login page
      // window.location.href = "/";
    }

    // Handle 503 Service Unavailable
    if (error.response?.status === 503) {
      console.error("❌ Service unavailable:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error, customMessage = "An error occurred") => {
  if (error.response) {
    // Server responded with error
    return {
      success: false,
      message: error.response.data?.message || error.response.data?.error || customMessage,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      message: "No response from server. Please check your connection.",
      status: 0,
    };
  } else {
    // Something else happened
    return {
      success: false,
      message: error.message || customMessage,
      status: 0,
    };
  }
};
