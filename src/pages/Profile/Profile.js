import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useWeb3 } from "../../contexts/Web3Context";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";
import "./Profile.css";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [userStats, setUserStats] = useState({
    totalProperties: 0,
    ownedNFTs: 0,
    transactions: 0,
    totalValue: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {user?.profile?.displayName ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </h1>
              <p className="profile-email">{user?.email}</p>
              {account && (
                <div className="profile-wallet">
                  <span className="wallet-label">
                    {language === "en" ? "Wallet:" : "Ví:"}
                  </span>
                  <span
                    className="wallet-address"
                    onClick={() => copyToClipboard(account)}
                    title={
                      language === "en" ? "Click to copy" : "Nhấn để sao chép"
                    }
                  >
                    {formatAddress(account)}
                  </span>
                </div>
              )}
            </div>
            {!account ? (
              <button
                className="connect-wallet-profile-btn"
                onClick={connectWallet}
              >
                <span>🔗</span>
                {language === "en" ? "Connect Wallet" : "Kết nối ví"}
              </button>
            ) : (
              <button
                className="disconnect-wallet-btn"
                onClick={disconnectWallet}
              >
                <span>🔓</span>
                {language === "en" ? "Disconnect" : "Ngắt kết nối"}
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <div className="stat-value">{userStats.totalProperties}</div>
              <div className="stat-label">
                {language === "en" ? "Properties" : "Bất động sản"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎨</div>
              <div className="stat-value">{userStats.ownedNFTs}</div>
              <div className="stat-label">
                {language === "en" ? "NFTs Owned" : "NFT sở hữu"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{userStats.transactions}</div>
              <div className="stat-label">
                {language === "en" ? "Transactions" : "Giao dịch"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">
                {userStats.totalValue.toLocaleString()}
              </div>
              <div className="stat-label">
                {language === "en" ? "Total Value (ETH)" : "Tổng giá trị (ETH)"}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              {language === "en" ? "Overview" : "Tổng quan"}
            </button>
            <button
              className={`tab-btn ${
                activeTab === "properties" ? "active" : ""
              }`}
              onClick={() => setActiveTab("properties")}
            >
              {language === "en" ? "My Properties" : "BĐS của tôi"}
            </button>
            <button
              className={`tab-btn ${activeTab === "nfts" ? "active" : ""}`}
              onClick={() => setActiveTab("nfts")}
            >
              {language === "en" ? "My NFTs" : "NFT của tôi"}
            </button>
            <button
              className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              {language === "en" ? "Transaction History" : "Lịch sử giao dịch"}
            </button>
            <button
              className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              {language === "en" ? "Settings" : "Cài đặt"}
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-content">
            {activeTab === "overview" && (
              <div className="tab-panel">
                <h2>
                  {language === "en"
                    ? "Account Overview"
                    : "Tổng quan tài khoản"}
                </h2>
                <div className="overview-grid">
                  <div className="overview-card">
                    <h3>
                      {language === "en"
                        ? "Account Information"
                        : "Thông tin tài khoản"}
                    </h3>
                    <div className="info-row">
                      <span className="info-label">
                        {language === "en" ? "Email:" : "Email:"}
                      </span>
                      <span className="info-value">{user?.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">
                        {language === "en" ? "Joined:" : "Tham gia:"}
                      </span>
                      <span className="info-value">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">
                        {language === "en" ? "Status:" : "Trạng thái:"}
                      </span>
                      <span className="info-value status-verified">
                        {language === "en" ? "Verified" : "Đã xác thực"}
                      </span>
                    </div>
                  </div>

                  {account && (
                    <div className="overview-card">
                      <h3>
                        {language === "en"
                          ? "Wallet Information"
                          : "Thông tin ví"}
                      </h3>
                      <div className="info-row">
                        <span className="info-label">
                          {language === "en" ? "Address:" : "Địa chỉ:"}
                        </span>
                        <span
                          className="info-value wallet-clickable"
                          onClick={() => copyToClipboard(account)}
                        >
                          {account}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">
                          {language === "en" ? "Network:" : "Mạng:"}
                        </span>
                        <span className="info-value">Ethereum (Local)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "properties" && (
              <div className="tab-panel">
                <h2>
                  {language === "en" ? "My Properties" : "Bất động sản của tôi"}
                </h2>
                <div className="empty-state">
                  <span className="empty-icon">🏠</span>
                  <p>
                    {language === "en"
                      ? "No properties yet"
                      : "Chưa có bất động sản"}
                  </p>
                  <button
                    className="cta-btn"
                    onClick={() => navigate("/marketplace")}
                  >
                    {language === "en"
                      ? "Browse Marketplace"
                      : "Xem sàn giao dịch"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "nfts" && (
              <div className="tab-panel">
                <h2>{language === "en" ? "My NFTs" : "NFT của tôi"}</h2>
                <div className="empty-state">
                  <span className="empty-icon">🎨</span>
                  <p>{language === "en" ? "No NFTs yet" : "Chưa có NFT"}</p>
                  <button
                    className="cta-btn"
                    onClick={() => navigate("/marketplace")}
                  >
                    {language === "en" ? "Explore NFTs" : "Khám phá NFT"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="tab-panel">
                <h2>
                  {language === "en"
                    ? "Transaction History"
                    : "Lịch sử giao dịch"}
                </h2>
                <div className="empty-state">
                  <span className="empty-icon">📊</span>
                  <p>
                    {language === "en"
                      ? "No transactions yet"
                      : "Chưa có giao dịch"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="tab-panel">
                <h2>
                  {language === "en" ? "Account Settings" : "Cài đặt tài khoản"}
                </h2>
                <div className="settings-section">
                  <h3>
                    {language === "en" ? "Profile Settings" : "Cài đặt hồ sơ"}
                  </h3>
                  <div className="setting-item">
                    <label>
                      {language === "en" ? "Display Name" : "Tên hiển thị"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        language === "en"
                          ? "Enter display name"
                          : "Nhập tên hiển thị"
                      }
                      defaultValue={user?.profile?.displayName || ""}
                    />
                  </div>
                  <div className="setting-item">
                    <label>{language === "en" ? "Bio" : "Giới thiệu"}</label>
                    <textarea
                      placeholder={
                        language === "en"
                          ? "Tell us about yourself"
                          : "Giới thiệu về bạn"
                      }
                      rows="4"
                    />
                  </div>
                  <button className="save-settings-btn">
                    {language === "en" ? "Save Changes" : "Lưu thay đổi"}
                  </button>
                </div>

                <div className="settings-section">
                  <h3>
                    {language === "en"
                      ? "Notification Settings"
                      : "Cài đặt thông báo"}
                  </h3>
                  <div className="setting-toggle">
                    <label>
                      <input type="checkbox" />
                      {language === "en"
                        ? "Email notifications"
                        : "Thông báo qua email"}
                    </label>
                  </div>
                  <div className="setting-toggle">
                    <label>
                      <input type="checkbox" />
                      {language === "en"
                        ? "Transaction alerts"
                        : "Cảnh báo giao dịch"}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
