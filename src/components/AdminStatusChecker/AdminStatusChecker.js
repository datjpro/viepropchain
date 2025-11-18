/**
 * 🔍 Admin Status Checker Component
 * Debug tool to verify admin access configuration
 */

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAdmin } from "../../contexts/AdminContext";
import { useWeb3 } from "../../contexts/Web3Context";
import "./AdminStatusChecker.css";

const AdminStatusChecker = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, isCheckingAdmin, ADMIN_EMAILS } = useAdmin();
  const { account } = useWeb3();

  return (
    <div className="admin-status-checker">
      <h3>🔍 Admin Status Checker</h3>

      <div className="status-grid">
        {/* Authentication Status */}
        <div className={`status-item ${isAuthenticated ? "success" : "error"}`}>
          <span className="status-label">Authentication:</span>
          <span className="status-value">
            {isAuthenticated ? "✅ Logged In" : "❌ Not Logged In"}
          </span>
        </div>

        {/* Email Status */}
        <div className={`status-item ${user?.email ? "success" : "error"}`}>
          <span className="status-label">Email:</span>
          <span className="status-value">{user?.email || "❌ No Email"}</span>
        </div>

        {/* Wallet Status */}
        <div className={`status-item ${account ? "success" : "error"}`}>
          <span className="status-label">Wallet:</span>
          <span className="status-value">
            {account
              ? `✅ ${account.substring(0, 8)}...${account.substring(
                  account.length - 6
                )}`
              : "❌ Not Connected"}
          </span>
        </div>

        {/* Admin Status */}
        <div className={`status-item ${isAdmin ? "success" : "error"}`}>
          <span className="status-label">Admin Access:</span>
          <span className="status-value">
            {isCheckingAdmin
              ? "⏳ Checking..."
              : isAdmin
              ? "✅ GRANTED"
              : "❌ DENIED"}
          </span>
        </div>

        {/* Admin Email Whitelist */}
        <div className="status-item info">
          <span className="status-label">Admin Emails:</span>
          <span className="status-value">{ADMIN_EMAILS.join(", ")}</span>
        </div>

        {/* Email Match Status */}
        <div
          className={`status-item ${
            ADMIN_EMAILS.includes(user?.email?.toLowerCase())
              ? "success"
              : "error"
          }`}
        >
          <span className="status-label">Email Match:</span>
          <span className="status-value">
            {ADMIN_EMAILS.includes(user?.email?.toLowerCase())
              ? "✅ Match"
              : "❌ No Match"}
          </span>
        </div>
      </div>

      {/* Access Summary */}
      <div className={`access-summary ${isAdmin ? "granted" : "denied"}`}>
        {isAdmin ? (
          <>
            <h4>✅ Access Granted</h4>
            <p>Bạn có quyền truy cập tất cả trang admin.</p>
          </>
        ) : (
          <>
            <h4>❌ Access Denied</h4>
            <p>
              {!isAuthenticated && "Vui lòng đăng nhập với tài khoản admin."}
              {isAuthenticated && !account && "Vui lòng kết nối ví MetaMask."}
              {isAuthenticated &&
                account &&
                !isAdmin &&
                `Email hiện tại (${user?.email}) không có quyền admin.`}
            </p>
            <p className="required-email">
              Email admin được phép: <strong>{ADMIN_EMAILS[0]}</strong>
            </p>
          </>
        )}
      </div>

      {/* Debug Info */}
      <details className="debug-info">
        <summary>🔧 Debug Info (Click to expand)</summary>
        <pre>
          {JSON.stringify(
            {
              user: user
                ? {
                    email: user.email,
                    role: user.role,
                    id: user._id,
                  }
                : null,
              isAuthenticated,
              account,
              isAdmin,
              isCheckingAdmin,
              ADMIN_EMAILS,
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
};

export default AdminStatusChecker;
