/**
 * ========================================================================
 * SERVICES INDEX - Export all services
 * ========================================================================
 * Central export point for all API services
 * Tất cả services đều đi qua API Gateway (port 4000)
 * ========================================================================
 */

export { default as apiClient } from "./api";
export { default as authService } from "./authService";
export { default as kycService } from "./kycService";
export { default as userService } from "./userService";
export { default as propertyService } from "./propertyService";
export { default as ipfsService } from "./ipfsService";
export { default as blockchainService } from "./blockchainService";
