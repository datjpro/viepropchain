import React, { useState } from "react";
import "./header.css";
import logo from "../../assets/logo-removebg-preview.png";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAdmin } from "../../contexts/AdminContext";
import { translations } from "../../translations/translations";
import Toast from "../Toast/Toast";
import { Link } from "react-router-dom";

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, login, logout, isAuthenticated, loading, error } = useAuth();
  const { isAdmin } = useAdmin();
  const [toast, setToast] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        setToast({
          message: language === "en" ? "Email copied" : "Đã sao chép",
          type: "success",
        })
      )
      .catch(() =>
        setToast({
          message: language === "en" ? "Copy failed" : "Sao chép lỗi",
          type: "error",
        })
      );
  };

  const LanguageSwitcher = () => (
    <button
      className="language-switcher"
      onClick={toggleLanguage}
      title={language === "en" ? "Switch to Vietnamese" : "Switch to English"}
    >
      <span className="language-code">{language === "en" ? "EN" : "VI"}</span>
    </button>
  );

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <img src={logo} alt="ViePropChain" className="logo" />
              <h1 className="brand-name">ViePropChain</h1>
            </div>

            <nav className="nav-menu">
              <ul>
                <li>
                  <a href="/">{t(translations.nav.home)}</a>
                </li>
                <li>
                  <a href="/properties">{t(translations.nav.properties)}</a>
                </li>
                <li>
                  <a href="/marketplace">{t(translations.nav.marketplace)}</a>
                </li>
                <li>
                  <a href="/analytics">{t(translations.nav.analytics)}</a>
                </li>
                <li>
                  <a href="/about">{t(translations.nav.about)}</a>
                </li>
              </ul>
            </nav>

            <div className="wallet-section">
              {isAuthenticated && user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin/nft" className="admin-link">
                      ⚙️ {language === "en" ? "Admin" : "Quản lý"}
                    </Link>
                  )}

                  <div
                    className="user-menu-container"
                    onMouseEnter={() => setShowUserDropdown(true)}
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <button className="user-icon-btn">
                      <span className="user-icon">👤</span>
                      {isAdmin && <span className="admin-crown">👑</span>}
                    </button>

                    {showUserDropdown && (
                      <div className="user-dropdown">
                        <div className="user-dropdown-header">
                          <span className="dropdown-status">
                            {t(translations.nav.connected)}
                          </span>
                          {isAdmin && (
                            <span className="dropdown-admin-badge">
                              {language === "en" ? "ADMIN" : "QUẢN TRỊ"}
                            </span>
                          )}
                        </div>
                        <div className="user-dropdown-email">
                          <span className="email-icon">📧</span>
                          <span
                            className="email-text"
                            onClick={() => copyToClipboard(user.email)}
                            title={
                              language === "en"
                                ? "Click to copy"
                                : "Nhấn để sao chép"
                            }
                          >
                            {user.email}
                          </span>
                        </div>
                        <button
                          className="dropdown-logout-btn"
                          onClick={logout}
                        >
                          <span>🚪</span>
                          {language === "en" ? "Logout" : "Đăng xuất"}
                        </button>
                      </div>
                    )}
                  </div>

                  <LanguageSwitcher />
                </>
              ) : (
                <>
                  <button
                    className="connect-wallet-btn"
                    onClick={login}
                    disabled={loading}
                  >
                    <span className="btn-icon">{loading ? "⏳" : "🚀"}</span>
                    {loading
                      ? language === "en"
                        ? "Loading..."
                        : "Đang tải..."
                      : language === "en"
                      ? "Start Trading"
                      : "Bắt đầu giao dịch"}
                  </button>
                  <LanguageSwitcher />
                </>
              )}

              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
