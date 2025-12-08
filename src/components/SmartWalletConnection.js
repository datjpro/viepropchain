import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/GanacheWeb3Context";
import { useAuth } from "../contexts/AuthContext";
import "./WalletConnection.css";

const SmartWalletConnection = () => {
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

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("auto");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [userWalletInfo, setUserWalletInfo] = useState(null);

  // Auto-detect user's wallet from database
  useEffect(() => {
    if (user?.walletAddress) {
      const userWallet = user.walletAddress.toLowerCase();

      // Find matching Ganache account
      const matchingAccount = ganacheAccounts.find(
        (acc) => acc.address.toLowerCase() === userWallet
      );

      if (matchingAccount) {
        const accountIndex = ganacheAccounts.indexOf(matchingAccount);
        setUserWalletInfo({
          address: matchingAccount.address,
          privateKey: matchingAccount.privateKey,
          accountIndex,
          source: "ganache",
        });
      } else {
        setUserWalletInfo({
          address: userWallet,
          source: "external",
        });
      }
    }
  }, [user, ganacheAccounts]);

  const handleAutoConnect = async () => {
    if (!userWalletInfo) return;

    if (userWalletInfo.source === "ganache") {
      // Auto-connect to user's Ganache account
      await connectGanacheAccount(userWalletInfo.accountIndex);
    } else {
      // External wallet, need private key
      setActiveTab("privatekey");
    }
  };

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
    const isCorrectWallet =
      user?.walletAddress?.toLowerCase() === account?.toLowerCase();

    return (
      <div
        className={`wallet-connection connected ${
          !isCorrectWallet ? "warning" : ""
        }`}
      >
        <div className="connection-header">
          <h3>🔗 Wallet Connected</h3>
          <span className={`connection-badge ${connectionMethod}`}>
            {connectionMethod === "ganache" && "🏠 Ganache"}
            {connectionMethod === "privatekey" && "🔑 Private Key"}
            {connectionMethod === "metamask" && "🦊 MetaMask"}
          </span>
        </div>

        {!isCorrectWallet && (
          <div className="wallet-warning">
            ⚠️ Warning: Connected wallet doesn't match your profile wallet
            <div className="wallet-details">
              <div>Profile wallet: {user?.walletAddress}</div>
              <div>Connected wallet: {account}</div>
            </div>
          </div>
        )}

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

        <div className="connection-actions">
          {!isCorrectWallet && userWalletInfo && (
            <button onClick={handleAutoConnect} className="connect-correct-btn">
              🔄 Connect Correct Wallet
            </button>
          )}
          <button onClick={disconnect} className="disconnect-btn">
            🔌 Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      <div className="connection-header">
        <h3>🔗 Connect Wallet</h3>
        {user?.walletAddress && (
          <p className="user-wallet-info">
            Your profile wallet: <code>{user.walletAddress}</code>
          </p>
        )}
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {userWalletInfo && (
        <div className="recommended-connection">
          <h4>🎯 Recommended Connection</h4>
          <div className="recommended-wallet">
            <div className="wallet-info">
              <strong>{userWalletInfo.address}</strong>
              <span className="wallet-source">
                {userWalletInfo.source === "ganache"
                  ? `(Ganache Account ${userWalletInfo.accountIndex})`
                  : "(External Wallet)"}
              </span>
            </div>
            <button
              onClick={handleAutoConnect}
              disabled={isConnecting}
              className="connect-btn recommended"
            >
              {isConnecting ? "⏳" : "🎯"} Connect Profile Wallet
            </button>
          </div>
        </div>
      )}

      <div className="connection-tabs">
        <button
          className={`tab ${activeTab === "auto" ? "active" : ""}`}
          onClick={() => setActiveTab("auto")}
        >
          🎯 Auto
        </button>
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
        {activeTab === "auto" && (
          <div className="auto-connection">
            <p className="tab-description">
              {userWalletInfo
                ? "We detected your profile wallet. Click to connect automatically:"
                : "No wallet found in your profile. Please use manual connection methods."}
            </p>
            {userWalletInfo && (
              <div className="auto-wallet-info">
                <div className="wallet-display">
                  <span className="wallet-label">Your Wallet:</span>
                  <span className="wallet-address">
                    {userWalletInfo.address}
                  </span>
                  {userWalletInfo.source === "ganache" && (
                    <span className="wallet-badge">
                      Ganache Account {userWalletInfo.accountIndex}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleAutoConnect}
                  disabled={isConnecting}
                  className="connect-btn auto"
                >
                  {isConnecting ? "⏳ Connecting..." : "🎯 Auto Connect"}
                </button>
              </div>
            )}
          </div>
        )}

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
                    {user?.walletAddress?.toLowerCase() ===
                      acc.address.toLowerCase() && (
                      <span className="account-badge profile">
                        👤 Your Profile Wallet
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleGanacheAccountSelect(index)}
                    disabled={isConnecting}
                    className={`connect-btn ganache ${
                      user?.walletAddress?.toLowerCase() ===
                      acc.address.toLowerCase()
                        ? "recommended"
                        : ""
                    }`}
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

export default SmartWalletConnection;
