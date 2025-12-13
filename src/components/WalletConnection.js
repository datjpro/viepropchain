import React, { useState } from "react";
import { useWeb3 } from "../contexts/GanacheWeb3Context";
import "./WalletConnection.css";

const WalletConnection = () => {
  const {
    account,
    balance,
    isConnected,
    isConnecting,
    error,
    connectionMethod,
    connectWithPrivateKey,
    connectGanacheAccount,
    connectMetaMask,
    disconnect,
    ganacheAccounts,
  } = useWeb3();

  const [activeTab, setActiveTab] = useState("ganache");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handlePrivateKeyConnect = async () => {
    if (!privateKeyInput.trim()) return;

    const success = await connectWithPrivateKey(privateKeyInput);
    if (success) {
      setPrivateKeyInput(""); // Clear input after successful connection
    }
  };

  const handleGanacheAccountSelect = async (index) => {
    await connectGanacheAccount(index);
  };

  if (isConnected) {
    return (
      <div className="wallet-connection connected">
        <div className="connection-header">
          <h3>🔗 Wallet Connected</h3>
          <span className={`connection-badge ${connectionMethod}`}>
            {connectionMethod === "ganache" && "🏠 Ganache"}
            {connectionMethod === "privatekey" && "🔑 Private Key"}
            {connectionMethod === "metamask" && "🦊 MetaMask"}
          </span>
        </div>

        <div className="account-info">
          <div className="account-row">
            <span className="label">Address:</span>
            <span className="value address">{account}</span>
          </div>
          <div className="account-row">
            <span className="label">Balance:</span>
            <span className="value balance">{balance} ETH</span>
          </div>
        </div>

        <button onClick={disconnect} className="disconnect-btn">
          🔌 Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      <div className="connection-header">
        <h3>🔗 Connect Wallet</h3>
        <p>Choose your preferred connection method</p>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      <div className="connection-tabs">
        <button
          className={`tab ${activeTab === "ganache" ? "active" : ""}`}
          onClick={() => setActiveTab("ganache")}
        >
          🏠 Ganache Accounts
        </button>
        <button
          className={`tab ${activeTab === "privatekey" ? "active" : ""}`}
          onClick={() => setActiveTab("privatekey")}
        >
          🔑 Private Key
        </button>
        <button
          className={`tab ${activeTab === "metamask" ? "active" : ""}`}
          onClick={() => setActiveTab("metamask")}
        >
          🦊 MetaMask
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "ganache" && (
          <div className="ganache-accounts">
            <p className="tab-description">
              Select a Ganache account to connect directly:
            </p>
            <div className="accounts-list">
              {ganacheAccounts.map((acc, index) => (
                <div key={index} className="account-item">
                  <div className="account-details">
                    <span className="account-index">Account {index}</span>
                    <span className="account-address">{acc.address}</span>
                  </div>
                  <button
                    onClick={() => handleGanacheAccountSelect(index)}
                    disabled={isConnecting}
                    className="connect-btn ganache"
                  >
                    {isConnecting ? "⏳" : "🔗"} Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "privatekey" && (
          <div className="private-key-input">
            <p className="tab-description">
              Enter your private key to connect:
            </p>
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type={showPrivateKey ? "text" : "password"}
                  placeholder="Enter private key (with or without 0x)"
                  value={privateKeyInput}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                  className="private-key-field"
                  disabled={isConnecting}
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="toggle-visibility"
                >
                  {showPrivateKey ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <button
                onClick={handlePrivateKeyConnect}
                disabled={!privateKeyInput.trim() || isConnecting}
                className="connect-btn privatekey"
              >
                {isConnecting ? "⏳ Connecting..." : "🔗 Connect"}
              </button>
            </div>
            <div className="security-warning">
              ⚠️ Never share your private key. It will be stored locally only.
            </div>
          </div>
        )}

        {activeTab === "metamask" && (
          <div className="metamask-connection">
            <p className="tab-description">
              Connect using MetaMask browser extension:
            </p>
            <button
              onClick={connectMetaMask}
              disabled={isConnecting}
              className="connect-btn metamask"
            >
              {isConnecting ? "⏳ Connecting..." : "🦊 Connect MetaMask"}
            </button>
            <div className="metamask-note">
              ℹ️ Make sure MetaMask is installed and connected to Ganache
              network.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;
