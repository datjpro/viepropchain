import React, { useState } from "react";
import "./header.css";
import logo from "../../assets/logo-removebg-preview.png";
import { useLanguage } from "../../contexts/LanguageContext";
import { useWeb3 } from "../../contexts/Web3Context";
import { useAdmin } from "../../contexts/AdminContext";
import { translations } from "../../translations/translations";
import Toast from "../Toast/Toast";
import { Link } from "react-router-dom";

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const {
    web3Api,
    account,
    connectWallet,
    disconnectWallet,
    isConnecting,
    error,
    formatAddress,
  } = useWeb3();
  const { isAdmin } = useAdmin();
  const [toast, setToast] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setToast({
          message:
            language === "en"
              ? "Address copied to clipboard!"
              : "Đã sao chép địa chỉ!",
          type: "success",
        });
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        setToast({
          message:
            language === "en"
              ? "Failed to copy address"
              : "Không thể sao chép địa chỉ",
          type: "error",
        });
      });
  };

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
            {/* Logo Section */}
            <div className="logo-section">
              <img src={logo} alt="ViePropChain" className="logo" />
              <h1 className="brand-name">ViePropChain</h1>
            </div>

            {/* Navigation Menu */}
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

            {/* Language Switcher & Wallet Section */}
            <div className="wallet-section">
              {/* Language Switcher */}
              <button
                className="language-switcher"
                onClick={toggleLanguage}
                title={
                  language === "en"
                    ? "Switch to Vietnamese"
                    : "Chuyển sang Tiếng Anh"
                }
              >
                {language === "en" ? (
                  <>
                    <svg
                      className="flag-icon"
                      width="24"
                      height="24"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="1"
                        y="4"
                        width="30"
                        height="24"
                        rx="4"
                        ry="4"
                        fill="#fff"
                      />
                      <path
                        d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z"
                        fill="#a62842"
                      />
                      <path
                        d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z"
                        fill="#a62842"
                      />
                      <path
                        d="M32,11.385H1c-.552,0-1,.448-1,1v1.231H32v-1.231c0-.552-.448-1-1-1Z"
                        fill="#a62842"
                      />
                      <rect
                        x="1"
                        y="15.462"
                        width="30"
                        height="1.846"
                        fill="#a62842"
                      />
                      <rect
                        x="1"
                        y="19.231"
                        width="30"
                        height="1.846"
                        fill="#a62842"
                      />
                      <path
                        d="M1,23.846H31c.552,0,1-.448,1-1v-1.231H0v1.231c0,.552,.448,1,1,1Z"
                        fill="#a62842"
                      />
                      <path
                        d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z"
                        fill="#a62842"
                      />
                      <path
                        d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z"
                        fill="#102d5e"
                      />
                      <path
                        d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
                        opacity=".15"
                      />
                    </svg>
                    <span className="language-code">EN</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="flag-icon"
                      width="24"
                      height="24"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="1"
                        y="4"
                        width="30"
                        height="24"
                        rx="4"
                        ry="4"
                        fill="#da251d"
                      />
                      <path
                        d="M5,4h22c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z"
                        fill="#da251d"
                      />
                      <path
                        d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z"
                        transform="rotate(180 16 24)"
                        fill="#da251d"
                      />
                      <path
                        d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
                        opacity=".15"
                      />
                      <polygon
                        points="16,11.196 17.285,15.062 21.361,15.062 18.038,17.438 19.323,21.304 16,18.928 12.677,21.304 13.962,17.438 10.639,15.062 14.715,15.062 16,11.196"
                        fill="#ff0"
                      />
                    </svg>
                    <span className="language-code">VI</span>
                  </>
                )}
              </button>

              {error && <div className="error-message">{error}</div>}

              {account ? (
                <>
                  <div className="wallet-connected">
                    <div className="wallet-info">
                      <span className="wallet-status">
                        {t(translations.nav.connected)}
                      </span>
                      {isAdmin && (
                        <span className="admin-badge">
                          👑 {language === "en" ? "ADMIN" : "QUẢN TRỊ"}
                        </span>
                      )}
                      <div className="wallet-address">
                        <span className="address-label">
                          {t(translations.nav.address)}:
                        </span>
                        <span
                          className="address-value"
                          title={`${account}\n${
                            language === "en"
                              ? "Click to copy"
                              : "Click để sao chép"
                          }`}
                          onClick={() => copyToClipboard(account)}
                        >
                          {formatAddress(account)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="disconnect-btn"
                      onClick={disconnectWallet}
                      title={language === "en" ? "Disconnect" : "Ngắt kết nối"}
                    >
                      ✕
                    </button>
                  </div>
                  {isAdmin && (
                    <Link to="/admin/nft" className="admin-link">
                      <span>⚙️</span>
                      {language === "en" ? "Admin Panel" : "Quản lý"}
                    </Link>
                  )}
                </>
              ) : (
                <button
                  className="connect-wallet-btn"
                  onClick={connectWallet}
                  disabled={!web3Api.provider || isConnecting}
                >
                  <span className="btn-icon">{isConnecting ? "⏳" : "🔗"}</span>
                  {isConnecting
                    ? language === "en"
                      ? "Connecting..."
                      : "Đang kết nối..."
                    : t(translations.nav.connectWallet)}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
