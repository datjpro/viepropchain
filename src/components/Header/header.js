import React, { useState, useEffect } from "react";
import "./header.css";
import logo from "../../assets/logo-removebg-preview.png";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAdmin } from "../../contexts/AdminContext";
import { useWeb3 } from "../../contexts/Web3Context";
import { translations } from "../../translations/translations";
import Toast from "../Toast/Toast";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, login, logout, isAuthenticated, loading, error } = useAuth();
  const { isAdmin } = useAdmin();
  const { account, web3 } = useWeb3();
  const [toast, setToast] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dropdownTimer, setDropdownTimer] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/");
  };
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

  // Fetch account balance when account or web3 changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (account && web3) {
        try {
          const balance = await web3.eth.getBalance(account);
          const ethBalance = web3.utils.fromWei(balance, "ether");
          setAccountBalance(parseFloat(ethBalance).toFixed(4));
        } catch (error) {
          console.error("Error fetching balance:", error);
          setAccountBalance("0.0000");
        }
      } else {
        setAccountBalance(null);
      }
    };

    fetchBalance();
  }, [account, web3]);

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle mouse enter - show dropdown immediately
  const handleMouseEnter = () => {
    // Clear any pending close timer
    if (dropdownTimer) {
      clearTimeout(dropdownTimer);
      setDropdownTimer(null);
    }
    setShowUserDropdown(true);
  };

  // Handle mouse leave - delay 3 seconds before closing
  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setShowUserDropdown(false);
    }, 1500);
    setDropdownTimer(timer);
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
            <div
              className="logo-section"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            >
              <img src={logo} alt="ViePropChain" className="logo" />
              <h1 className="brand-name">ViePropChain</h1>
            </div>

            <nav className="nav-menu">
              <ul>
                <li>
                  <a href="/">{t(translations.nav.home)}</a>
                </li>
                <li>
                  <a href="/market">Thị Trường BDS</a>
                </li>
                <li>
                  <a href="/market/buy">Mua Nhà</a>
                </li>
                <li>
                  <a href="/market/rent">Thuê Nhà</a>
                </li>
                <li>
                  <a href="/analytics">{t(translations.nav.analytics)}</a>
                </li>
                <li>
                  <a href="/about-us">{t(translations.nav.about)}</a>
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
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className="user-icon-btn"
                      onClick={() => navigate("/profile")}
                    >
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

                        {/* Wallet Address */}
                        {account && (
                          <div className="user-dropdown-wallet">
                            <span className="wallet-icon">🔗</span>
                            <span
                              className="wallet-text"
                              onClick={() => copyToClipboard(account)}
                              title={
                                language === "en"
                                  ? "Click to copy wallet address"
                                  : "Nhấn để sao chép địa chỉ ví"
                              }
                            >
                              {formatAddress(account)}
                            </span>
                          </div>
                        )}

                        {/* Account Balance */}
                        {accountBalance !== null && (
                          <div className="user-dropdown-balance">
                            <span className="balance-icon">💰</span>
                            <span className="balance-text">
                              {accountBalance} ETH
                            </span>
                          </div>
                        )}

                        <button
                          className="dropdown-profile-btn"
                          onClick={() => {
                            navigate("/profile");
                            setShowUserDropdown(false);
                          }}
                        >
                          <span>👤</span>
                          {language === "en" ? "Profile" : "Hồ sơ"}
                        </button>
                        <button
                          className="dropdown-profile-btn"
                          onClick={() => {
                            navigate("/my-dashboard");
                            setShowUserDropdown(false);
                          }}
                        >
                          <span>📊</span>
                          {language === "en"
                            ? "My Dashboard"
                            : "Bảng Điều Khiển"}
                        </button>
                        <button
                          className="dropdown-profile-btn"
                          onClick={() => {
                            navigate("/my-properties");
                            setShowUserDropdown(false);
                          }}
                        >
                          <span>🏘️</span>
                          {language === "en"
                            ? "My Properties"
                            : "Tin Đăng Của Tôi"}
                        </button>
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
