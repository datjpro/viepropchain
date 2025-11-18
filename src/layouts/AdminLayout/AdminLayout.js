import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWeb3 } from "../../contexts/Web3Context";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { account } = useWeb3();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "📊",
      description: "Tổng quan hệ thống",
    },
    {
      path: "/admin/nft",
      label: "Mint NFT",
      icon: "🎨",
      description: "Tạo NFT mới",
    },
    {
      path: "/admin/properties",
      label: "Quản lý Bất động sản",
      icon: "🏠",
      description: "Quản lý properties",
    },
    {
      path: "/admin/marketplace",
      label: "Quản lý Sàn niêm yết",
      icon: "🏪",
      description: "Quản lý marketplace",
      disabled: true,
    },
    {
      path: "/admin/users",
      label: "Quản lý Người dùng",
      icon: "👥",
      description: "Quản lý users",
    },
    {
      path: "/admin/list-nft",
      label: "Quản lý NFT",
      icon: "📋",
      description: "Danh sách NFT",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-header">
            <Link to="/admin/dashboard" className="logo-container">
              <div className="logo-icon">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient
                      id="logoGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: "#3B82F6", stopOpacity: 1 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: "#DC2626", stopOpacity: 1 }}
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20 30 L50 10 L80 30 L80 70 L50 90 L20 70 Z"
                    fill="none"
                    stroke="url(#logoGrad)"
                    strokeWidth="4"
                  />
                  <path d="M50 30 L50 70" stroke="#DC2626" strokeWidth="4" />
                  <path
                    d="M35 45 L50 30 L65 45"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                  />
                </svg>
              </div>
              <h1 className="logo-text">ViePropChain</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? "active" : ""} ${
                  item.disabled ? "disabled" : ""
                }`}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  } else {
                    setSidebarOpen(false);
                  }
                }}
                title={item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.disabled && <span className="badge-soon">Soon</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="sidebar-footer">
            <button className="nav-item" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="hamburger-icon">☰</span>
            </button>
            <h2 className="page-title">
              {menuItems.find((item) => item.path === location.pathname)
                ?.label || "Admin"}
            </h2>
          </div>

          <div className="topbar-right">
            {/* Search */}
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
              />
            </div>

            {/* Notifications */}
            <button className="icon-btn" title="Notifications">
              <span className="icon">🔔</span>
            </button>

            {/* User Info */}
            <div className="user-info">
              <div className="user-avatar">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="user-details">
                <div className="user-name">Admin User</div>
                <div className="user-email">
                  {user?.email || "admin@propertychain.io"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
