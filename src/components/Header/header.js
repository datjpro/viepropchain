import React from "react";
import "./header.css";

const Header = ({ web3Api, account, onConnectWallet, error }) => {
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo Section */}
          <div className="logo-section">
            <img
              src="/logo-removebg-preview.png"
              alt="ViePropChain"
              className="logo"
            />
            <h1 className="brand-name">ViePropChain</h1>
          </div>

          {/* Navigation Menu */}
          <nav className="nav-menu">
            <ul>
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li>
                <a href="/properties">Bất động sản</a>
              </li>
              <li>
                <a href="/transactions">Giao dịch</a>
              </li>
              <li>
                <a href="/about">Giới thiệu</a>
              </li>
            </ul>
          </nav>

          {/* Wallet Connection Section */}
          <div className="wallet-section">
            {error && <div className="error-message">{error}</div>}

            {account ? (
              <div className="wallet-connected">
                <span className="wallet-status">Đã kết nối</span>
                <div className="wallet-address">
                  <span className="address-label">Địa chỉ:</span>
                  <span className="address-value" title={account}>
                    {formatAddress(account)}
                  </span>
                </div>
              </div>
            ) : (
              <button
                className="connect-wallet-btn"
                onClick={onConnectWallet}
                disabled={!web3Api.provider}
              >
                <span className="btn-icon">🔗</span>
                Kết nối ví
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
