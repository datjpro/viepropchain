import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AdminHeader.css";

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "📊",
      description: "Tổng quan hệ thống",
    },
    {
      path: "/admin/properties",
      label: "Bất động sản",
      icon: "🏠",
      description: "Quản lý properties",
    },
    {
      path: "/admin/nft",
      label: "Mint NFT",
      icon: "🎨",
      description: "Tạo NFT mới",
    },
    {
      path: "/admin/list-nft",
      label: "NFT Manager",
      icon: "📋",
      description: "Danh sách NFT",
    },
    {
      path: "/admin/marketplace",
      label: "Marketplace",
      icon: "🏪",
      description: "Quản lý chợ",
      disabled: true,
    },
    {
      path: "/admin/rentals",
      label: "Cho thuê",
      icon: "🔑",
      description: "Quản lý rental",
      disabled: true,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: "👥",
      description: "Quản lý người dùng",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        <Link to="/admin/dashboard" className="admin-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">ViePropChain Admin</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="admin-nav desktop-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""} ${
                item.disabled ? "disabled" : ""
              }`}
              onClick={(e) => item.disabled && e.preventDefault()}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.disabled && <span className="coming-soon">Soon</span>}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="admin-user-menu">
          {user && (
            <>
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="btn-logout">
                🚪 Đăng xuất
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="admin-nav mobile-nav">
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
                  setMenuOpen(false);
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.disabled && <span className="coming-soon">Soon</span>}
            </Link>
          ))}
          <div className="mobile-user-section">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="btn-logout mobile">
              🚪 Đăng xuất
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default AdminHeader;
