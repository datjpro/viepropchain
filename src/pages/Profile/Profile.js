import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useWeb3 } from "../../contexts/Web3Context";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { API_GATEWAY_URL } from "../../config/api";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";
import KYCModal from "../../components/KYCModal/KYCModal";
import kycService from "../../services/kycService";
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

  // KYC State
  const [kycStatus, setKycStatus] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycLoading, setKycLoading] = useState(true);

  // Wallet Selection State
  const [availableWallets, setAvailableWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log("🔍 State updated - myProperties:", myProperties.length);
  }, [myProperties]);

  useEffect(() => {
    console.log("🔍 State updated - myNFTs:", myNFTs.length);
  }, [myNFTs]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Check KYC status when user logs in
  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!user?.id) {
        setKycLoading(false);
        return;
      }

      try {
        console.log("🔍 Checking KYC status for user:", user.id);
        const response = await kycService.getKYCStatus();

        if (response.success) {
          setKycStatus(response.data);
          console.log("✅ KYC Status:", response.data);

          // Show modal if not verified (check isVerified field from API)
          if (!response.data.isVerified) {
            setShowKYCModal(true);
          }
        }
      } catch (error) {
        console.error("❌ Error checking KYC:", error);
        // If KYC not found (404), show modal to submit KYC
        if (error.message && error.message.includes("404")) {
          setKycStatus({ isVerified: false, status: "not_submitted" });
          setShowKYCModal(true);
        } else {
          // Other errors - allow access (service might be down)
          console.warn("⚠️ KYC service error, allowing access");
          setKycStatus({ isVerified: true });
        }
      } finally {
        setKycLoading(false);
      }
    };

    checkKYCStatus();
  }, [user?.id]);

  // Fetch available wallets from MetaMask
  const fetchWallets = async () => {
    if (window.ethereum && user && !user.walletAddress) {
      try {
        // Get current account
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("👛 Current account:", accounts);
        setAvailableWallets(accounts);
        if (accounts.length > 0) {
          setSelectedWallet(accounts[0]);
        }
      } catch (error) {
        console.error("❌ Error fetching wallets:", error);
      }
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [user]);

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        console.log("🔄 MetaMask account changed:", accounts);
        if (accounts.length > 0) {
          setAvailableWallets(accounts);
          setSelectedWallet(accounts[0]);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, []);

  // Function to link selected wallet
  const linkWallet = async (walletAddress) => {
    // Check KYC first
    const isVerified =
      kycStatus?.status === "verified" || kycStatus?.isVerified === true;

    if (!isVerified) {
      console.log("⚠️ Cannot link wallet - KYC not verified");
      setShowKYCModal(true);
      return;
    }

    console.log("✅ KYC verified, proceeding to link wallet:", walletAddress);

    try {
      // Gọi API link wallet
      const message = `Link wallet ${walletAddress.toLowerCase()} to ViePropChain account ${
        user.email
      }`;

      console.log("📝 Requesting signature for message:", message);

      // Request signature from MetaMask
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      console.log("✍️ Signature obtained:", signature.substring(0, 20) + "...");

      // Call link wallet API
      console.log("📡 Calling link wallet API...");
      const response = await fetch(`${API_GATEWAY_URL}/api/auth/link-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("viepropchain_token")}`,
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          signature: signature,
        }),
      });

      const data = await response.json();
      console.log("📥 API Response:", data);

      if (data.success) {
        console.log("✅ Wallet linked successfully");
        // Update token with new one that includes wallet
        if (data.token) {
          localStorage.setItem("viepropchain_token", data.token);
          console.log("🔑 Token updated");
        }
        // Reload to get new user data
        console.log("🔄 Reloading page...");
        window.location.reload();
      } else {
        console.error("❌ Failed to link wallet:", data.error);
        alert(`Failed to link wallet: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error linking wallet:", error);
      alert(`Error linking wallet: ${error.message}`);
    }
  };

  // Show wallet selector when KYC is verified and no wallet linked
  useEffect(() => {
    if (
      !kycLoading &&
      (kycStatus?.status === "verified" || kycStatus?.isVerified === true) &&
      user &&
      !user.walletAddress &&
      availableWallets.length > 0
    ) {
      setShowWalletSelector(true);
    }
  }, [kycLoading, kycStatus, user, availableWallets]);

  // Fetch user data khi có wallet hoặc user thay đổi
  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount

    const fetchUserData = async () => {
      console.log("🔄 useEffect triggered - fetchUserData starting...");

      // Debug: Log toàn bộ user object
      console.log("👤 Full user object:", JSON.stringify(user, null, 2));

      const userId = user?.id || user?.userId || user?._id;
      if (!userId) {
        console.log("⚠️ No user ID found:", user);
        console.log("   Available keys:", user ? Object.keys(user) : "no user");
        if (isMounted) setLoading(false);
        return;
      }

      console.log("✅ Found userId:", userId);
      if (isMounted) setLoading(true);
      try {
        console.log("🔍 Fetching data for user:", userId);
        console.log("   Wallet:", user?.walletAddress);
        console.log("   Email:", user?.email);

        // 1️⃣ Fetch Properties from Database (by userId)
        const propertiesResponse = await fetch(
          `${API_GATEWAY_URL}/api/user/users/${userId}/properties`
        );
        const propertiesData = await propertiesResponse.json();
        console.log("📦 Properties Response:", propertiesData);

        if (isMounted) {
          if (propertiesData.success) {
            console.log(
              "✅ Setting properties:",
              propertiesData.data?.length,
              "items"
            );
            setMyProperties(propertiesData.data || []);
          } else {
            console.warn(
              "⚠️ Failed to fetch properties:",
              propertiesData.error
            );
            setMyProperties([]);
          }
        }

        // 2️⃣ Fetch NFTs from Blockchain (by walletAddress)
        let nftsData = { success: false, data: { nfts: [], balance: 0 } };
        if (user?.walletAddress) {
          const nftsResponse = await fetch(
            `${API_GATEWAY_URL}/api/marketplace/my-nfts/${user.walletAddress.toLowerCase()}`
          );
          nftsData = await nftsResponse.json();
          console.log("🎨 NFTs Response:", nftsData);

          if (isMounted) {
            if (nftsData.success && nftsData.data) {
              console.log(
                "✅ Setting NFTs:",
                nftsData.data.nfts?.length,
                "items"
              );
              setMyNFTs(nftsData.data.nfts || []);
            } else {
              console.warn("⚠️ Failed to fetch NFTs:", nftsData.error);
              setMyNFTs([]);
            }
          }
        } else {
          console.log("ℹ️ No wallet address linked, skipping NFTs fetch");
          if (isMounted) setMyNFTs([]);
        }

        // 3️⃣ Fetch Transactions (by walletAddress) - wrapped in try-catch
        let txData = { success: false, data: [] };
        if (user?.walletAddress) {
          try {
            const txResponse = await fetch(
              `${API_GATEWAY_URL}/api/marketplace/transactions/${user.walletAddress.toLowerCase()}`
            );

            if (txResponse.ok) {
              txData = await txResponse.json();
              console.log("📊 Transactions Response:", txData);

              if (isMounted) {
                if (txData.success) {
                  setMyTransactions(txData.data || []);
                } else {
                  console.warn(
                    "⚠️ Failed to fetch transactions:",
                    txData.error
                  );
                  setMyTransactions([]);
                }
              }
            } else {
              console.warn(
                "⚠️ Transactions endpoint not found (404) - skipping"
              );
              if (isMounted) setMyTransactions([]);
            }
          } catch (txError) {
            console.warn(
              "⚠️ Transactions error (non-critical):",
              txError.message
            );
            if (isMounted) setMyTransactions([]);
          }
        } else {
          console.log(
            "ℹ️ No wallet address linked, skipping transactions fetch"
          );
          if (isMounted) setMyTransactions([]);
        }

        // Calculate total value from NFTs
        const totalValue = (nftsData?.data?.nfts || []).reduce((sum, nft) => {
          const price = parseFloat(nft.price) || 0;
          return sum + price;
        }, 0);

        // Update stats
        if (isMounted) {
          setUserStats({
            totalProperties: propertiesData.data?.length || 0,
            ownedNFTs: nftsData?.data?.nfts?.length || 0,
            transactions: txData?.data?.length || 0,
            totalValue: totalValue / 1e18, // Convert wei to ETH
          });
        }

        console.log("✅ All data loaded successfully");
        console.log("📊 Stats:", {
          properties: propertiesData.data?.length || 0,
          nfts: nftsData?.data?.nfts?.length || 0,
          transactions: txData?.data?.length || 0,
          totalValue: (totalValue / 1e18).toFixed(4) + " ETH",
        });
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        if (isMounted) {
          setMyProperties([]);
          setMyNFTs([]);
          setMyTransactions([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      console.log("🧹 Cleanup - preventing state updates");
    };
  }, [user]); // Re-run when user object changes

  // Handle KYC submission
  const handleKYCSubmit = async (formData) => {
    try {
      console.log("📤 Submitting KYC data...");
      const response = await kycService.submitKYC(formData);

      if (response.success) {
        console.log("✅ KYC submitted successfully");
        setKycStatus(response.data);
        setShowKYCModal(false);

        // Reload user data after KYC submission
        window.location.reload();
      } else {
        console.error("❌ KYC submission failed:", response.error);
        throw new Error(response.error || "Failed to submit KYC");
      }
    } catch (error) {
      console.error("❌ Error submitting KYC:", error);
      throw error;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const convertIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl) return "";
    if (ipfsUrl.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${ipfsUrl.replace("ipfs://", "")}`;
    }
    if (ipfsUrl.startsWith("http")) {
      return ipfsUrl;
    }
    return `https://ipfs.io/ipfs/${ipfsUrl}`;
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

                {user?.walletAddress && (
                  <div className="wallet-badge">
                    <span className="wallet-icon">💼</span>
                    <span className="wallet-label-new">
                      {language === "en" ? "Wallet:" : "Ví:"}
                    </span>
                    <span
                      className="wallet-address-new"
                      onClick={() => copyToClipboard(user.walletAddress)}
                      title={
                        language === "en" ? "Click to copy" : "Nhấn để sao chép"
                      }
                    >
                      {formatAddress(user.walletAddress)}
                    </span>
                    <button
                      className="copy-btn-new"
                      onClick={() => copyToClipboard(user.walletAddress)}
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>
              <div className="profile-actions">
                {!user?.walletAddress ? (
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

                {/* DEBUG INFO */}
                <div
                  style={{
                    background: "#f0f0f0",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <h4>🔍 Debug Info:</h4>
                  <pre style={{ overflow: "auto", maxHeight: "200px" }}>
                    {JSON.stringify(
                      {
                        userId:
                          user?.id || user?.userId || user?._id || "NOT FOUND",
                        availableKeys: user ? Object.keys(user) : [],
                        walletAddress: user?.walletAddress,
                        email: user?.email,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>

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

                  {user?.walletAddress && (
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
                            onClick={() => copyToClipboard(user.walletAddress)}
                          >
                            {user.walletAddress}
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

                {/* Check KYC verification */}
                {!kycLoading &&
                kycStatus?.status !== "verified" &&
                kycStatus?.isVerified !== true ? (
                  <div
                    style={{
                      padding: "3rem",
                      textAlign: "center",
                      background: "#fff3cd",
                      borderRadius: "12px",
                      border: "2px dashed #ffc107",
                    }}
                  >
                    <h3 style={{ color: "#856404", marginBottom: "1rem" }}>
                      🔒{" "}
                      {language === "en"
                        ? "KYC Verification Required"
                        : "Yêu cầu xác thực KYC"}
                    </h3>
                    <p style={{ color: "#856404", marginBottom: "1.5rem" }}>
                      {language === "en"
                        ? "You need to complete KYC verification to view your properties."
                        : "Bạn cần hoàn thành xác thực KYC để xem bất động sản của mình."}
                    </p>
                    <button
                      onClick={() => setShowKYCModal(true)}
                      style={{
                        padding: "0.75rem 2rem",
                        background: "#ffc107",
                        color: "#000",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {language === "en" ? "Verify Now" : "Xác thực ngay"}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Debug info */}
                    <div
                      style={{
                        padding: "1rem",
                        background: "#f0f0f0",
                        marginBottom: "1rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <strong>Debug:</strong> Loading:{" "}
                      {loading ? "true" : "false"}, Properties count:{" "}
                      {myProperties.length}
                    </div>

                    {loading ? (
                      <div className="loading-state-new">
                        <p>
                          {language === "en" ? "Loading..." : "Đang tải..."}
                        </p>
                      </div>
                    ) : myProperties.length > 0 ? (
                      <div className="properties-grid-new">
                        {myProperties.map((property) => (
                          <div key={property._id} className="property-card-new">
                            <div className="property-image-new">
                              {property.images && property.images.length > 0 ? (
                                <img
                                  src={convertIpfsUrl(property.images[0])}
                                  alt={property.title || property.name}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML =
                                      '<div class="no-image-new">🏠</div>';
                                  }}
                                />
                              ) : (
                                <div className="no-image-new">🏠</div>
                              )}
                              {property.status && (
                                <div className="property-status-badge">
                                  {property.status === "draft"
                                    ? "📝 " +
                                      (language === "en" ? "Draft" : "Nháp")
                                    : property.status === "published"
                                    ? "✅ " +
                                      (language === "en"
                                        ? "Published"
                                        : "Đã đăng")
                                    : "📌 " + property.status}
                                </div>
                              )}
                              {property.nft?.isMinted && (
                                <div className="property-nft-badge">
                                  🎨 NFT #{property.nft.tokenId}
                                </div>
                              )}
                            </div>
                            <div className="property-info-new">
                              <h3>
                                {property.title ||
                                  property.name ||
                                  "Unnamed Property"}
                              </h3>
                              <p className="property-description-new">
                                {property.description ||
                                  (language === "en"
                                    ? "No description"
                                    : "Không có mô tả")}
                              </p>
                              <p className="property-type-new">
                                🏘️ {property.propertyType || "N/A"}
                              </p>
                              {property.address && (
                                <p className="property-location-new">
                                  📍 {property.address.district},{" "}
                                  {property.address.city}
                                </p>
                              )}
                              <div className="property-meta-new">
                                <span>📏 {property.area || 0} m²</span>
                                {property.bedrooms > 0 && (
                                  <span>🛌 {property.bedrooms} PN</span>
                                )}
                                {property.bathrooms > 0 && (
                                  <span>🚿 {property.bathrooms} WC</span>
                                )}
                              </div>
                              {property.price > 0 && (
                                <div className="property-price-new">
                                  💰 {property.price.toLocaleString()}{" "}
                                  {property.currency || "VND"}
                                </div>
                              )}
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
                  </>
                )}
              </div>
            )}

            {activeTab === "nfts" && (
              <div className="tab-panel-new">
                <h2 className="tab-title-new">
                  {language === "en" ? "My NFTs" : "NFT của tôi"}
                </h2>

                {/* Check KYC verification */}
                {!kycLoading &&
                kycStatus?.status !== "verified" &&
                kycStatus?.isVerified !== true ? (
                  <div
                    style={{
                      padding: "3rem",
                      textAlign: "center",
                      background: "#fff3cd",
                      borderRadius: "12px",
                      border: "2px dashed #ffc107",
                    }}
                  >
                    <h3 style={{ color: "#856404", marginBottom: "1rem" }}>
                      🔒{" "}
                      {language === "en"
                        ? "KYC Verification Required"
                        : "Yêu cầu xác thực KYC"}
                    </h3>
                    <p style={{ color: "#856404", marginBottom: "1.5rem" }}>
                      {language === "en"
                        ? "You need to complete KYC verification to view your NFTs."
                        : "Bạn cần hoàn thành xác thực KYC để xem NFT của mình."}
                    </p>
                    <button
                      onClick={() => setShowKYCModal(true)}
                      style={{
                        padding: "0.75rem 2rem",
                        background: "#ffc107",
                        color: "#000",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {language === "en" ? "Verify Now" : "Xác thực ngay"}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Debug info */}
                    <div
                      style={{
                        padding: "1rem",
                        background: "#f0f0f0",
                        marginBottom: "1rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <strong>Debug:</strong> Loading:{" "}
                      {loading ? "true" : "false"}, NFTs count: {myNFTs.length},
                      Wallet: {user?.walletAddress || "none"}
                    </div>

                    {!user?.walletAddress && !account ? (
                      <div className="empty-state-new">
                        <span className="empty-icon-new">🔗</span>
                        <p className="empty-text-new">
                          {language === "en"
                            ? "Please connect your wallet to view NFTs"
                            : "Vui lòng kết nối ví để xem NFT"}
                        </p>
                        <button className="cta-btn-new" onClick={connectWallet}>
                          {language === "en" ? "Connect Wallet" : "Kết nối ví"}
                        </button>
                      </div>
                    ) : loading ? (
                      <div className="loading-state-new">
                        <p>
                          {language === "en" ? "Loading..." : "Đang tải..."}
                        </p>
                      </div>
                    ) : myNFTs.length > 0 ? (
                      <div className="nfts-grid-new">
                        {myNFTs.map((nft) => (
                          <div key={nft.tokenId} className="nft-card-new">
                            <div className="nft-image-new">
                              {nft.metadata?.image ? (
                                <img
                                  src={convertIpfsUrl(nft.metadata.image)}
                                  alt={
                                    nft.metadata?.name || `NFT #${nft.tokenId}`
                                  }
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML =
                                      '<div class="no-image-new">🎨</div>';
                                  }}
                                />
                              ) : (
                                <div className="no-image-new">🎨</div>
                              )}
                              <div className="nft-badge-new">
                                #{nft.tokenId}
                              </div>
                              {nft.hasMetadata && (
                                <div className="nft-metadata-badge">
                                  ✅ Metadata
                                </div>
                              )}
                            </div>
                            <div className="nft-info-new">
                              <h3>
                                {nft.metadata?.name || `NFT #${nft.tokenId}`}
                              </h3>
                              <p className="nft-description-new">
                                {nft.metadata?.description ||
                                  (language === "en"
                                    ? "No description"
                                    : "Không có mô tả")}
                              </p>

                              {/* Display attributes from metadata */}
                              {nft.metadata?.attributes &&
                                nft.metadata.attributes.length > 0 && (
                                  <div className="nft-attributes-new">
                                    {nft.metadata.attributes
                                      .slice(0, 4)
                                      .map((attr, idx) => (
                                        <div
                                          key={idx}
                                          className="nft-attribute-new"
                                        >
                                          <span className="attr-label">
                                            {attr.trait_type}:
                                          </span>
                                          <span className="attr-value">
                                            {attr.value}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                )}

                              {/* Token URI for debugging */}
                              {nft.tokenURI && (
                                <div
                                  className="nft-uri-new"
                                  title={nft.tokenURI}
                                >
                                  📄{" "}
                                  {language === "en"
                                    ? "Token URI available"
                                    : "Có Token URI"}
                                </div>
                              )}

                              {nft.price && (
                                <div className="nft-price-new">
                                  💰 {(parseFloat(nft.price) / 1e18).toFixed(4)}{" "}
                                  ETH
                                </div>
                              )}
                              <div className="nft-status-new">
                                {nft.isListed ? (
                                  <span className="status-listed">
                                    📊{" "}
                                    {language === "en"
                                      ? "Listed for Sale"
                                      : "Đang bán"}
                                  </span>
                                ) : nft.readyToList ? (
                                  <span className="status-ready">
                                    ⚡{" "}
                                    {language === "en"
                                      ? "Ready to List"
                                      : "Sẵn sàng bán"}
                                  </span>
                                ) : (
                                  <span className="status-owned">
                                    ✓{" "}
                                    {language === "en"
                                      ? "Owned"
                                      : "Đang sở hữu"}
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
                  </>
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

      {/* KYC Modal */}
      {showKYCModal && (
        <KYCModal
          isOpen={showKYCModal}
          onClose={() => setShowKYCModal(false)}
          onSubmit={handleKYCSubmit}
          language={language}
        />
      )}

      {/* Wallet Selector Modal */}
      {showWalletSelector && (
        <div
          className="modal-overlay"
          onClick={() => setShowWalletSelector(false)}
        >
          <div
            className="modal-content wallet-selector-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {language === "en"
                  ? "🔗 Link Your Wallet"
                  : "🔗 Liên kết ví của bạn"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowWalletSelector(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: "1rem", color: "#666" }}>
                {language === "en"
                  ? "Currently selected account in MetaMask:"
                  : "Tài khoản hiện tại được chọn trong MetaMask:"}
              </p>

              <div
                style={{
                  padding: "1rem",
                  background: "#f0f9ff",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  border: "1px solid #bfdbfe",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#1e40af",
                    marginBottom: "0.5rem",
                  }}
                >
                  💡{" "}
                  {language === "en"
                    ? "To select a different wallet:"
                    : "Để chọn ví khác:"}
                </div>
                <ol
                  style={{
                    margin: "0.5rem 0 0 1.5rem",
                    fontSize: "0.875rem",
                    color: "#1e3a8a",
                  }}
                >
                  <li>
                    {language === "en"
                      ? "Open MetaMask extension"
                      : "Mở tiện ích MetaMask"}
                  </li>
                  <li>
                    {language === "en"
                      ? "Click on your account icon (top right)"
                      : "Click vào biểu tượng tài khoản (góc trên bên phải)"}
                  </li>
                  <li>
                    {language === "en"
                      ? "Select the wallet you want to link"
                      : "Chọn ví bạn muốn liên kết"}
                  </li>
                  <li>
                    {language === "en"
                      ? "This page will update automatically"
                      : "Trang này sẽ cập nhật tự động"}
                  </li>
                </ol>
              </div>

              <div className="wallet-list">
                {availableWallets.map((wallet, index) => (
                  <div
                    key={wallet}
                    className={`wallet-item ${
                      selectedWallet === wallet ? "selected" : ""
                    }`}
                    onClick={() => setSelectedWallet(wallet)}
                  >
                    <div className="wallet-icon">👛</div>
                    <div className="wallet-info">
                      <div className="wallet-label">
                        {language === "en" ? "Wallet" : "Ví"} #{index + 1}
                      </div>
                      <div className="wallet-address">{wallet}</div>
                    </div>
                    <div className="wallet-radio">
                      {selectedWallet === wallet ? "●" : "○"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowWalletSelector(false)}
              >
                {language === "en" ? "Cancel" : "Hủy"}
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (selectedWallet) {
                    linkWallet(selectedWallet);
                    setShowWalletSelector(false);
                  }
                }}
                disabled={!selectedWallet}
              >
                {language === "en" ? "Link Wallet" : "Liên kết ví"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Profile;
