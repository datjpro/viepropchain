/**
 * ========================================================================
 * OAUTH CALLBACK PAGE - Handle Google OAuth redirect
 * ========================================================================
 */

import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./OAuthCallback.css";

const OAuthCallback = () => {
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    // Get token from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      // Redirect to home with error
      setTimeout(() => {
        window.location.href = "/?error=" + encodeURIComponent(error);
      }, 2000);
      return;
    }

    if (token) {
      // Handle successful authentication
      handleAuthCallback(token);
    } else {
      // No token found, redirect to home
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [handleAuthCallback]);

  return (
    <div className="oauth-callback-container">
      <div className="oauth-callback-content">
        <div className="spinner"></div>
        <h2>Đang xử lý đăng nhập...</h2>
        <p>Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
