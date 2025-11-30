import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import "./Nft.css";

const Nft = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mintResult, setMintResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("verified");

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let url = `${API_ENDPOINTS.ADMIN.PROPERTIES}?limit=100`;

      if (filter === "verified") {
        url += "&verificationStatus=verified&blockchainStatus=none";
      } else if (filter === "minted") {
        url += "&blockchainStatus=minted";
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data.properties || data.data || []);
      } else {
        setMessage({ type: "error", text: "Không thể tải danh sách BĐS" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi kết nối: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFT = async (property) => {
    if (
      !window.confirm(
        `Xác nhận mint NFT cho: ${property.name || property.title}?`
      )
    ) {
      return;
    }

    try {
      setMinting(property._id);
      setMessage({ type: "", text: "" });

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}/${property._id}/mint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ metadataUri: null }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Không thể mint NFT");
      }

      setMintResult(data.data);
      setSelectedProperty(property);

      const custodialMsg = data.data.isCustodial
        ? `🏦 Mint vào ví Admin (Custodial)\nUser chưa liên kết ví, NFT sẽ được giữ hộ.`
        : `✅ Mint vào ví User\nNFT đã chuyển vào ví của chủ nhà.`;

      setMessage({
        type: "success",
        text: `🎉 Mint NFT thành công!\nToken ID: ${data.data.tokenId}\n\n${custodialMsg}`,
      });

      // Refresh danh sách
      fetchProperties();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Lỗi mint NFT: " + error.message,
      });
    } finally {
      setMinting(null);
    }
  };

  const getFilteredProperties = () => {
    if (!searchTerm) return properties;

    return properties.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    if (typeof price === "object" && price.amount) {
      return `${(price.amount / 1000000000).toFixed(2)} tỷ VND`;
    }
    return `${(price / 1000000000).toFixed(2)} tỷ VND`;
  };

  const getPropertyTypeIcon = (type) => {
    const icons = {
      apartment: "🏢",
      house: "🏡",
      villa: "🏰",
      land: "🌍",
      commercial: "🏪",
    };
    return icons[type] || "🏠";
  };

  const closeMintResult = () => {
    setMintResult(null);
    setSelectedProperty(null);
  };

  const filteredProperties = getFilteredProperties();

  if (loading) {
    return (
      <div className="nft-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-container">
      <div className="nft-header">
        <div className="header-content">
          <h1>⛏️ Mint NFT</h1>
          <p>Tạo NFT cho bất động sản đã được duyệt</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">
              {properties.filter((p) => !p.nft?.isMinted).length}
            </span>
            <span className="stat-label">Chờ mint</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {properties.filter((p) => p.nft?.isMinted).length}
            </span>
            <span className="stat-label">Đã mint</span>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <div className="alert-icon">
            {message.type === "success" ? "✅" : "❌"}
          </div>
          <div className="alert-content">
            {message.text.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <button
            className="alert-close"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            ×
          </button>
        </div>
      )}

      {mintResult && (
        <div className="mint-result-modal">
          <div className="modal-backdrop" onClick={closeMintResult}></div>
          <div className="modal-card">
            <button className="modal-close-btn" onClick={closeMintResult}>
              ×
            </button>

            <div className="modal-header">
              <div className="success-icon">🎉</div>
              <h2>Mint NFT thành công!</h2>
            </div>

            <div className="modal-body">
              <div className="result-grid">
                <div className="result-item">
                  <label>Token ID</label>
                  <div className="result-value token-id">
                    #{mintResult.tokenId}
                  </div>
                </div>

                <div className="result-item">
                  <label>Contract Address</label>
                  <div className="result-value code">
                    {mintResult.contractAddress}
                  </div>
                </div>

                <div className="result-item full-width">
                  <label>Owner Address</label>
                  <div className="result-value code">{mintResult.owner}</div>
                </div>

                {mintResult.isCustodial && (
                  <div className="result-item full-width custodial-notice">
                    <div className="notice-icon">🏦</div>
                    <div>
                      <strong>Ví giữ hộ (Custodial Wallet)</strong>
                      <p>
                        User chưa liên kết ví MetaMask. NFT được lưu tại ví
                        Admin và sẽ chuyển về cho user khi họ liên kết ví.
                      </p>
                    </div>
                  </div>
                )}

                <div className="result-item full-width">
                  <label>Transaction Hash</label>
                  <div className="result-value code small">
                    {mintResult.transactionHash}
                  </div>
                </div>

                {mintResult.tokenURI && (
                  <div className="result-item full-width">
                    <label>Metadata URI</label>
                    <a
                      href={mintResult.tokenURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-link"
                    >
                      {mintResult.tokenURI}
                    </a>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {mintResult.tokenURI && (
                  <a
                    href={mintResult.tokenURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    🔗 Xem Metadata
                  </a>
                )}
                <button className="btn btn-primary" onClick={closeMintResult}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="nft-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "verified" ? "active" : ""}`}
            onClick={() => setFilter("verified")}
          >
            <span className="tab-icon">⏳</span>
            Chờ mint
          </button>
          <button
            className={`filter-tab ${filter === "minted" ? "active" : ""}`}
            onClick={() => setFilter("minted")}
          >
            <span className="tab-icon">✅</span>
            Đã mint
          </button>
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <span className="tab-icon">📋</span>
            Tất cả
          </button>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Không tìm thấy bất động sản</h3>
          <p>
            {filter === "verified"
              ? "Chưa có BĐS nào đã duyệt chờ mint NFT"
              : "Không có BĐS nào phù hợp với bộ lọc"}
          </p>
        </div>
      ) : (
        <div className="properties-grid">
          {filteredProperties.map((property) => (
            <div key={property._id} className="property-card">
              <div className="property-image">
                <img
                  src={
                    property.media?.images?.[0]?.url ||
                    property.images?.[0] ||
                    "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={property.name || property.title}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
                <div className="property-type-badge">
                  {getPropertyTypeIcon(property.propertyType)}{" "}
                  {property.propertyType}
                </div>
                {property.nft?.isMinted && (
                  <div className="minted-badge">
                    🎨 NFT #{property.nft.tokenId}
                  </div>
                )}
              </div>

              <div className="property-body">
                <h3 className="property-title">
                  {property.name || property.title}
                </h3>

                <div className="property-location">
                  📍 {property.location?.address || property.address?.street},{" "}
                  {property.location?.district}
                </div>

                <div className="property-price">
                  💰 {formatPrice(property.price)}
                </div>

                <div className="property-meta">
                  <span className="meta-item">
                    🏷️ {property.propertyType || "N/A"}
                  </span>
                  <span className="meta-item">
                    📅{" "}
                    {new Date(property.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                {property.verificationStatus === "verified" &&
                  !property.nft?.isMinted && (
                    <button
                      className="btn-mint"
                      onClick={() => handleMintNFT(property)}
                      disabled={minting === property._id}
                    >
                      {minting === property._id ? (
                        <>
                          <span className="spinner-small"></span>
                          Đang mint...
                        </>
                      ) : (
                        <>⛏️ Mint NFT</>
                      )}
                    </button>
                  )}

                {property.nft?.isMinted && (
                  <div className="nft-info">
                    <div className="nft-detail">
                      <span>Token ID:</span>
                      <strong>#{property.nft.tokenId}</strong>
                    </div>
                    <div className="nft-detail">
                      <span>Contract:</span>
                      <code className="code-small">
                        {property.nft.contractAddress?.slice(0, 10)}...
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Nft;
