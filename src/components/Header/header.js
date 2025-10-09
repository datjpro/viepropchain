import React from "react";
import "./header.css";
import logo from "../../assets/logo-removebg-preview.png";

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
            <img src={logo} alt="ViePropChain" className="logo" />
            <h1 className="brand-name">ViePropChain</h1>
          </div>

          {/* Navigation Menu */}
          <nav className="nav-menu">
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/properties">Properties</a>
              </li>
              <li>
                <a href="/marketplace">Marketplace</a>
              </li>
              <li>
                <a href="/analytics">Analytics</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
            </ul>
          </nav>

          {/* Wallet Connection Section */}
          <div className="wallet-section">
            {error && <div className="error-message">{error}</div>}

            {account ? (
              <div className="wallet-connected">
                <span className="wallet-status">Connected</span>
                <div className="wallet-address">
                  <span className="address-label">Address:</span>
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
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
