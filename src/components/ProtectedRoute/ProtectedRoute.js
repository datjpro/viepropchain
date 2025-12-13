import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../../contexts/AdminContext";
import { useWeb3 } from "../../contexts/GanacheWeb3Context";
import { useAuth } from "../../contexts/AuthContext";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children }) => {
  const { isAdmin, isCheckingAdmin, ADMIN_EMAILS } = useAdmin();
  const { account, connectWallet } = useWeb3();
  const { user, isAuthenticated } = useAuth();

  // Đang kiểm tra quyền admin
  if (isCheckingAdmin) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Chưa đăng nhập Gmail
  if (!isAuthenticated || !user) {
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>🔐 Yêu cầu đăng nhập</h2>
          <p>Vui lòng đăng nhập với tài khoản Google để tiếp tục.</p>
          <p className="error-subtext">
            🔒 Chỉ tài khoản admin <strong>{ADMIN_EMAILS[0]}</strong> mới có
            quyền truy cập.
          </p>
          <button onClick={() => (window.location.href = "/")}>
            Quay về Trang chủ để đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Chưa kết nối ví
  if (!account) {
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>🔒 Yêu cầu kết nối ví</h2>
          <p>
            Bạn đã đăng nhập với: <strong>{user.email}</strong>
          </p>
          <p>Vui lòng kết nối ví MetaMask để truy cập trang admin.</p>
          <div className="error-actions">
            <button onClick={connectWallet} className="btn-primary">
              🦊 Kết nối MetaMask
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="btn-secondary"
            >
              Quay về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Không phải admin
  if (!isAdmin) {
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>⛔ Truy cập bị từ chối</h2>
          <p>Bạn không có quyền truy cập trang này.</p>
          <p className="error-subtext">
            🔒 Chỉ tài khoản admin <strong>{ADMIN_EMAILS[0]}</strong> mới có
            quyền truy cập.
          </p>
          <p className="error-account">
            Email hiện tại: <strong>{user.email}</strong>
          </p>
          <p className="error-account">
            Ví hiện tại: <strong>{account}</strong>
          </p>
          <button onClick={() => (window.location.href = "/")}>
            Quay về Trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Là admin - cho phép truy cập
  return children;
};

export default ProtectedRoute;
