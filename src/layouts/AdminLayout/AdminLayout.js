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
      iconSvg: (
        <svg className="nav-icon-svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      path: "/admin/nft",
      label: "Mint NFT",
      icon: "🎨",
      iconSvg: (
        <svg className="nav-icon-svg" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      path: "/admin/properties",
      label: "Quản lý Bất động sản",
      icon: "🏠",
      iconSvg: (
        <svg className="nav-icon-svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      path: "/admin/marketplace",
      label: "Quản lý Sàn niêm yết",
      icon: "🏪",
      iconSvg: (
        <svg className="nav-icon-svg" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
            clipRule="evenodd"
          />
        </svg>
      ),
      disabled: true,
    },
    {
      path: "/admin/users",
      label: "Quản lý Người dùng",
      icon: "👥",
      iconSvg: (
        <svg className="nav-icon-svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      path: "/admin/list-nft",
      label: "Quản lý NFT",
      icon: "📋",
      iconSvg: (
        <svg className="nav-icon-svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      ),
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
                <img
                  src="/logo-removebg-preview.png"
                  alt="ViePropChain Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
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
              >
                {item.iconSvg || <span className="nav-icon">{item.icon}</span>}
                <span className="nav-label">{item.label}</span>
                {item.disabled && <span className="badge-soon">Soon</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="sidebar-footer">
            <button className="nav-item settings-btn">
              <svg
                className="nav-icon-svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="nav-label">Settings</span>
            </button>
            <button className="nav-item logout-btn" onClick={handleLogout}>
              <svg
                className="nav-icon-svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="nav-label">Logout</span>
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
