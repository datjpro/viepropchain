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
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalProperties: 0,
    ownedNFTs: 0,
    transactions: 0,
    totalValue: 0,
  });
  const [myNFTs, setMyNFTs] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user data khi có wallet hoặc user thay đổi
  useEffect(() => {
    const fetchUserData = async () => {
      if (!account && !user?.walletAddress) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const walletAddress = account || user?.walletAddress;
        console.log("🔍 Fetching data for wallet:", walletAddress);

        // 1. Lấy danh sách NFTs của user
        const nftsResponse = await fetch(
          `http://localhost:4000/api/marketplace/my-nfts/${walletAddress}`
        );
        const nftsData = await nftsResponse.json();
        console.log("📦 NFTs Response:", nftsData);

        if (nftsData.success && nftsData.data) {
          // API trả về data.nfts, không phải data trực tiếp
          const nftsList = nftsData.data.nfts || [];
          console.log("✅ NFTs List:", nftsList);
          console.log("📊 Total NFTs:", nftsList.length);
          setMyNFTs(nftsList);

          // Tính tổng giá trị từ NFTs
          const totalValue = nftsList.reduce((sum, nft) => {
            return sum + (parseFloat(nft.price) || 0);
          }, 0);

          setUserStats((prev) => ({
            ...prev,
            ownedNFTs: nftsList.length,
            totalValue: totalValue / 1e18, // Convert từ Wei sang ETH
          }));

          console.log("📈 Updated stats:", {
            ownedNFTs: nftsList.length,
            totalValue: totalValue / 1e18,
          });
        }

        // 2. Lấy danh sách properties
        // API này có thể cần authentication token
        const token = localStorage.getItem("jwt_token");
        if (token) {
          const propertiesResponse = await fetch(
            `http://localhost:4000/api/properties/my-properties`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const propertiesData = await propertiesResponse.json();

          if (propertiesData.success) {
            setMyProperties(propertiesData.data || []);
            setUserStats((prev) => ({
              ...prev,
              totalProperties: propertiesData.data.length,
            }));
          }
        }

        // 3. Lấy lịch sử giao dịch (có thể từ blockchain hoặc database)
        const transactionsResponse = await fetch(
          `http://localhost:4008/api/marketplace/transactions/${walletAddress}`
        );
        const transactionsData = await transactionsResponse.json();

        if (transactionsData.success) {
          setMyTransactions(transactionsData.data || []);
          setUserStats((prev) => ({
            ...prev,
            transactions: transactionsData.data.length,
          }));
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [account, user?.walletAddress]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const getUserInitial = () => {
    if (user?.profile?.displayName) {
      return user.profile.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUsername = () => {
    if (user?.profile?.displayName) {
      return user.profile.displayName;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  return (
    <>
      <Header />
      <div className="profile-page-new">
        <div className="profile-container-new">
          {/* Profile Header Card */}
          <div className="profile-header-card">
            <div className="profile-header-content">
              <div className="profile-avatar-section">
                <div className="avatar-circle-new">{getUserInitial()}</div>
              </div>
              <div className="profile-info-section">
                <h1 className="profile-username">{getUsername()}</h1>
                <p className="profile-email-text">{user?.email}</p>
                {account && (
                  <div className="wallet-badge">
                    <span className="wallet-icon">💼</span>
                    <span className="wallet-label-new">
                      {language === "en" ? "Wallet:" : "Ví:"}
                    </span>
                    <span
                      className="wallet-address-new"
                      onClick={() => copyToClipboard(account)}
                      title={
                        language === "en" ? "Click to copy" : "Nhấn để sao chép"
                      }
                    >
                      {formatAddress(account)}
                    </span>
                    <button
                      className="copy-btn-new"
                      onClick={() => copyToClipboard(account)}
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>
              <div className="profile-actions">
                {!account ? (
                  <button className="connect-btn-new" onClick={connectWallet}>
                    <span>🔗</span>
                    <span>
                      {language === "en" ? "Connect Wallet" : "Kết nối ví"}
                    </span>
                  </button>
                ) : (
                  <button
                    className="disconnect-btn-new"
                    onClick={disconnectWallet}
                  >
                    <span>🔓</span>
                    <span>
                      {language === "en" ? "Disconnect" : "Ngắt kết nối"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid-new">
            <div className="stat-card-new">
              <div className="stat-icon-new property-icon">🏠</div>
              <div className="stat-content-new">
                <p className="stat-label-new">
                  {language === "en" ? "PROPERTIES" : "BẤT ĐỘNG SẢN"}
                </p>
                <p className="stat-value-new">{userStats.totalProperties}</p>
              </div>
            </div>
            <div className="stat-card-new">
              <div className="stat-icon-new nft-icon">🎨</div>
              <div className="stat-content-new">
                <p className="stat-label-new">
                  {language === "en" ? "NFTS OWNED" : "NFT SỞ HỮU"}
                </p>
                <p className="stat-value-new">{userStats.ownedNFTs}</p>
              </div>
            </div>
            <div className="stat-card-new">
              <div className="stat-icon-new transaction-icon">📊</div>
              <div className="stat-content-new">
                <p className="stat-label-new">
                  {language === "en" ? "TRANSACTIONS" : "GIAO DỊCH"}
                </p>
                <p className="stat-value-new">{userStats.transactions}</p>
              </div>
            </div>
            <div className="stat-card-new">
              <div className="stat-icon-new value-icon">💰</div>
              <div className="stat-content-new">
                <p className="stat-label-new">
                  {language === "en"
                    ? "TOTAL VALUE (ETH)"
                    : "TỔNG GIÁ TRỊ (ETH)"}
                </p>
                <p className="stat-value-new">
                  {userStats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="tabs-container-new">
            <nav className="tabs-nav-new">
              <button
                className={`tab-btn-new ${
                  activeTab === "overview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("overview")}
              >
                {language === "en" ? "Overview" : "Tổng quan"}
              </button>
              <button
                className={`tab-btn-new ${
                  activeTab === "properties" ? "active" : ""
                }`}
                onClick={() => setActiveTab("properties")}
              >
                {language === "en" ? "My Properties" : "BĐS của tôi"}
              </button>
              <button
                className={`tab-btn-new ${
                  activeTab === "nfts" ? "active" : ""
                }`}
                onClick={() => setActiveTab("nfts")}
              >
                {language === "en" ? "My NFTs" : "NFT của tôi"}
              </button>
              <button
                className={`tab-btn-new ${
                  activeTab === "history" ? "active" : ""
                }`}
                onClick={() => setActiveTab("history")}
              >
                {language === "en"
                  ? "Transaction History"
                  : "Lịch sử giao dịch"}
              </button>
              <button
                className={`tab-btn-new ${
                  activeTab === "settings" ? "active" : ""
                }`}
                onClick={() => setActiveTab("settings")}
              >
                {language === "en" ? "Settings" : "Cài đặt"}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="tab-content-new">
            {activeTab === "overview" && (
              <div className="tab-panel-new">
                <h2 className="tab-title-new">
                  {language === "en"
                    ? "Account Overview"
                    : "Tổng quan tài khoản"}
                </h2>
                <div className="overview-grid-new">
                  <div className="overview-card-new">
                    <h3 className="overview-card-title">
                      {language === "en"
                        ? "Account Information"
                        : "Thông tin tài khoản"}
                    </h3>
                    <div className="info-list-new">
                      <div className="info-row-new">
                        <span className="info-label-new">
                          {language === "en" ? "Email:" : "Email:"}
                        </span>
                        <span className="info-value-new">{user?.email}</span>
                      </div>
                      <div className="info-divider"></div>
                      <div className="info-row-new">
                        <span className="info-label-new">
                          {language === "en" ? "Joined:" : "Tham gia:"}
                        </span>
                        <span className="info-value-new">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="info-divider"></div>
                      <div className="info-row-new">
                        <span className="info-label-new">
                          {language === "en" ? "Status:" : "Trạng thái:"}
                        </span>
                        <span className="status-verified-new">
                          ✓ {language === "en" ? "Verified" : "Đã xác thực"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {account && (
                    <div className="overview-card-new">
                      <h3 className="overview-card-title">
                        {language === "en"
                          ? "Wallet Information"
                          : "Thông tin ví"}
                      </h3>
                      <div className="info-list-new">
                        <div className="info-row-new">
                          <span className="info-label-new">
                            {language === "en" ? "Address:" : "Địa chỉ:"}
                          </span>
                          <span
                            className="wallet-address-clickable"
                            onClick={() => copyToClipboard(account)}
                          >
                            {account}
                          </span>
                        </div>
                        <div className="info-divider"></div>
                        <div className="info-row-new">
                          <span className="info-label-new">
                            {language === "en" ? "Network:" : "Mạng:"}
                          </span>
                          <span className="info-value-new">Ethereum</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "properties" && (
              <div className="tab-panel-new">
                <h2 className="tab-title-new">
                  {language === "en" ? "My Properties" : "Bất động sản của tôi"}
                </h2>
                {loading ? (
                  <div className="loading-state-new">
                    <p>{language === "en" ? "Loading..." : "Đang tải..."}</p>
                  </div>
                ) : myProperties.length > 0 ? (
                  <div className="properties-grid-new">
                    {myProperties.map((property) => (
                      <div key={property._id} className="property-card-new">
                        <div className="property-image-new">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={`https://ipfs.io/ipfs/${property.images[0]}`}
                              alt={property.name}
                            />
                          ) : (
                            <div className="no-image-new">🏠</div>
                          )}
                        </div>
                        <div className="property-info-new">
                          <h3>{property.name}</h3>
                          <p className="property-location-new">
                            📍 {property.address?.city || "N/A"}
                          </p>
                          <p className="property-type-new">
                            {property.propertyType}
                          </p>
                          <div className="property-meta-new">
                            <span>📏 {property.area} m²</span>
                            <span>🛌 {property.bedrooms} PN</span>
                            <span>🚿 {property.bathrooms} WC</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-new">
                    <span className="empty-icon-new">🏠</span>
                    <p className="empty-text-new">
                      {language === "en"
                        ? "No properties yet"
                        : "Chưa có bất động sản"}
                    </p>
                    <button
                      className="cta-btn-new"
                      onClick={() => navigate("/marketplace")}
                    >
                      {language === "en"
                        ? "Browse Marketplace"
                        : "Xem sàn giao dịch"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "nfts" && (
              <div className="tab-panel-new">
                <h2 className="tab-title-new">
                  {language === "en" ? "My NFTs" : "NFT của tôi"}
                </h2>
                {loading ? (
                  <div className="loading-state-new">
                    <p>{language === "en" ? "Loading..." : "Đang tải..."}</p>
                  </div>
                ) : myNFTs.length > 0 ? (
                  <div className="nfts-grid-new">
                    {myNFTs.map((nft) => (
                      <div key={nft.tokenId} className="nft-card-new">
                        <div className="nft-image-new">
                          {nft.metadata?.image ? (
                            <img
                              src={
                                nft.metadata.image.startsWith("ipfs://")
                                  ? `https://ipfs.io/ipfs/${nft.metadata.image.replace(
                                      "ipfs://",
                                      ""
                                    )}`
                                  : nft.metadata.image
                              }
                              alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                            />
                          ) : (
                            <div className="no-image-new">🎨</div>
                          )}
                          <div className="nft-badge-new">#{nft.tokenId}</div>
                        </div>
                        <div className="nft-info-new">
                          <h3>{nft.metadata?.name || `NFT #${nft.tokenId}`}</h3>
                          <p className="nft-description-new">
                            {nft.metadata?.description || "No description"}
                          </p>
                          {nft.price && (
                            <div className="nft-price-new">
                              💰 {(parseFloat(nft.price) / 1e18).toFixed(4)} ETH
                            </div>
                          )}
                          <div className="nft-status-new">
                            {nft.isListed ? (
                              <span className="status-listed">
                                📊 {language === "en" ? "Listed" : "Đang bán"}
                              </span>
                            ) : (
                              <span className="status-owned">
                                ✓ {language === "en" ? "Owned" : "Sở hữu"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-new">
                    <span className="empty-icon-new">🎨</span>
                    <p className="empty-text-new">
                      {language === "en" ? "No NFTs yet" : "Chưa có NFT"}
                    </p>
                    <button
                      className="cta-btn-new"
                      onClick={() => navigate("/marketplace")}
                    >
                      {language === "en" ? "Explore NFTs" : "Khám phá NFT"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="tab-panel-new">
                <h2 className="tab-title-new">
                  {language === "en"
                    ? "Transaction History"
                    : "Lịch sử giao dịch"}
                </h2>
                {loading ? (
                  <div className="loading-state-new">
                    <p>{language === "en" ? "Loading..." : "Đang tải..."}</p>
                  </div>
                ) : myTransactions.length > 0 ? (
                  <div className="transactions-list-new">
                    {myTransactions.map((tx, index) => (
                      <div
                        key={tx._id || index}
                        className="transaction-item-new"
                      >
                        <div className="transaction-icon-new">
                          {tx.type === "sale"
                            ? "💸"
                            : tx.type === "purchase"
                            ? "🛍️"
                            : "🔄"}
                        </div>
                        <div className="transaction-details-new">
                          <div className="transaction-header-new">
                            <h4>
                              {tx.type === "sale"
                                ? language === "en"
                                  ? "Sold"
                                  : "Đã bán"
                                : tx.type === "purchase"
                                ? language === "en"
                                  ? "Purchased"
                                  : "Đã mua"
                                : language === "en"
                                ? "Transfer"
                                : "Chuyển"}{" "}
                              NFT #{tx.tokenId}
                            </h4>
                            <span className="transaction-date-new">
                              {new Date(
                                tx.timestamp || tx.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="transaction-meta-new">
                            {tx.price && (
                              <span className="transaction-price-new">
                                💰 {(parseFloat(tx.price) / 1e18).toFixed(4)}{" "}
                                ETH
                              </span>
                            )}
                            {tx.from && (
                              <span className="transaction-address-new">
                                {language === "en" ? "From:" : "Từ:"}{" "}
                                {formatAddress(tx.from)}
                              </span>
                            )}
                            {tx.to && (
                              <span className="transaction-address-new">
                                {language === "en" ? "To:" : "Đến:"}{" "}
                                {formatAddress(tx.to)}
                              </span>
                            )}
                          </div>
                          {tx.transactionHash && (
                            <div className="transaction-hash-new">
                              <a
                                href={`https://etherscan.io/tx/${tx.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {language === "en"
                                  ? "View on Explorer"
                                  : "Xem trên Explorer"}{" "}
                                ↗️
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-new">
                    <span className="empty-icon-new">📊</span>
                    <p className="empty-text-new">
                      {language === "en"
                        ? "No transactions yet"
                        : "Chưa có giao dịch"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="tab-panel-new">
                <h2 className="tab-title-new">
                  {language === "en" ? "Account Settings" : "Cài đặt tài khoản"}
                </h2>
                <div className="settings-section-new">
                  <h3 className="settings-subtitle">
                    {language === "en" ? "Profile Settings" : "Cài đặt hồ sơ"}
                  </h3>
                  <div className="setting-item-new">
                    <label className="setting-label-new">
                      {language === "en" ? "Display Name" : "Tên hiển thị"}
                    </label>
                    <input
                      type="text"
                      className="setting-input-new"
                      placeholder={
                        language === "en"
                          ? "Enter display name"
                          : "Nhập tên hiển thị"
                      }
                      defaultValue={user?.profile?.displayName || ""}
                    />
                  </div>
                  <div className="setting-item-new">
                    <label className="setting-label-new">
                      {language === "en" ? "Bio" : "Giới thiệu"}
                    </label>
                    <textarea
                      className="setting-textarea-new"
                      placeholder={
                        language === "en"
                          ? "Tell us about yourself"
                          : "Giới thiệu về bạn"
                      }
                      rows="4"
                    />
                  </div>
                  <button className="save-btn-new">
                    {language === "en" ? "Save Changes" : "Lưu thay đổi"}
                  </button>
                </div>

                <div className="settings-section-new">
                  <h3 className="settings-subtitle">
                    {language === "en"
                      ? "Notification Settings"
                      : "Cài đặt thông báo"}
                  </h3>
                  <div className="setting-toggle-new">
                    <label className="toggle-label-new">
                      <input type="checkbox" className="toggle-checkbox" />
                      <span>
                        {language === "en"
                          ? "Email notifications"
                          : "Thông báo qua email"}
                      </span>
                    </label>
                  </div>
                  <div className="setting-toggle-new">
                    <label className="toggle-label-new">
                      <input type="checkbox" className="toggle-checkbox" />
                      <span>
                        {language === "en"
                          ? "Transaction alerts"
                          : "Cảnh báo giao dịch"}
                      </span>
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
