import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../../contexts/AdminContext";
import { useWeb3 } from "../../contexts/Web3Context";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children }) => {
  const { isAdmin, isCheckingAdmin } = useAdmin();
  const { account } = useWeb3();

  // Đang kiểm tra quyền admin
  if (isCheckingAdmin) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  // Chưa kết nối ví
  if (!account) {
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>🔒 Authentication Required</h2>
          <p>Please connect your wallet to access this page.</p>
          <button onClick={() => (window.location.href = "/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Không phải admin
  if (!isAdmin) {
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>⛔ Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p className="error-subtext">
            Only administrators can access this area.
          </p>
          <button onClick={() => (window.location.href = "/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Là admin - cho phép truy cập
  return children;
};

export default ProtectedRoute;
