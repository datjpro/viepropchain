/**
 * ========================================================================
 * AUTH CONTEXT - Gmail OAuth Authentication
 * ========================================================================
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AUTH_SERVICE_URL = "http://localhost:4010";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("viepropchain_token");
        console.log(
          "🔍 initAuth - stored token:",
          storedToken ? storedToken.substring(0, 20) + "..." : "null"
        );

        if (storedToken) {
          setToken(storedToken);
          await fetchUserInfo(storedToken);
        } else {
          console.log("ℹ️ No stored token found");
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Auth initialization error:", err);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fetch user info with token
  const fetchUserInfo = async (authToken) => {
    try {
      console.log(
        "🔍 Fetching user info with token:",
        authToken.substring(0, 20) + "..."
      );

      const response = await axios.get(`${AUTH_SERVICE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        timeout: 5000, // 5 second timeout
      });

      console.log("✅ User info response:", response.data);

      if (response.data.success) {
        setUser(response.data.data);
        setError(null);
        console.log("✅ User set:", response.data.data.email);
      }
    } catch (err) {
      console.error("❌ Failed to fetch user info:", err);

      // If it's a network error (service not running), just log it
      if (
        err.code === "ECONNREFUSED" ||
        err.code === "ERR_NETWORK" ||
        !err.response
      ) {
        console.warn(
          "⚠️ Auth service not available. Please start auth-service on port 4010"
        );
        setError("Auth service unavailable");
        // Don't logout, just clear user
        setUser(null);
      }
      // Token might be expired
      else if (err.response?.status === 401) {
        console.error("❌ Token expired or invalid");
        logout();
      } else {
        setError("Failed to fetch user information");
      }
    } finally {
      setLoading(false);
    }
  };

  // Login - redirect to Google OAuth
  const login = () => {
    // Save current URL to return after login
    localStorage.setItem("viepropchain_return_url", window.location.pathname);
    // Redirect to Google OAuth
    window.location.href = `${AUTH_SERVICE_URL}/auth/google`;
  };

  // Handle OAuth callback (call this when redirected back with token)
  const handleAuthCallback = async (authToken) => {
    try {
      console.log(
        "🔐 handleAuthCallback called with token:",
        authToken.substring(0, 20) + "..."
      );
      setLoading(true);

      // Save token
      localStorage.setItem("viepropchain_token", authToken);
      setToken(authToken);
      console.log("✅ Token saved to localStorage");

      // Fetch user info and WAIT for it to complete
      await fetchUserInfo(authToken);

      // Wait a bit to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("✅ Redirecting to home...");

      // Redirect to saved URL or home
      const returnUrl = localStorage.getItem("viepropchain_return_url") || "/";
      localStorage.removeItem("viepropchain_return_url");
      window.location.href = returnUrl;
    } catch (err) {
      console.error("❌ Auth callback error:", err);
      setError("Authentication failed");
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Call logout endpoint
      if (token) {
        await axios.post(
          `${AUTH_SERVICE_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear local state
      setUser(null);
      setToken(null);
      localStorage.removeItem("viepropchain_token");
      setError(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    handleAuthCallback,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
