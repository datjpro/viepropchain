import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminHeader.css";

const AdminHeader = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { path: "/admin/nft", label: "Mint NFT", icon: "🎨" },
    { path: "/admin/list-nft", label: "Quản lý NFT", icon: "📋" },
    {
      path: "/admin/marketplace",
      label: "Marketplace",
      icon: "🏪",
      disabled: true,
    },
    { path: "/admin/analytics", label: "Thống kê", icon: "📊", disabled: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        <div className="admin-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">ViePropChain Admin</span>
        </div>

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
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.disabled && (
                <span className="coming-soon">Coming Soon</span>
              )}
            </Link>
          ))}
        </nav>

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
              {item.disabled && (
                <span className="coming-soon">Coming Soon</span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default AdminHeader;
