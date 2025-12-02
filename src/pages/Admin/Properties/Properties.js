import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import "./Properties.css";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [nftDetails, setNftDetails] = useState(null);
  const [loadingNft, setLoadingNft] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProperties();
  }, [pagination.page, filter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      let url = `${API_ENDPOINTS.ADMIN.PROPERTIES}?page=${pagination.page}&limit=${pagination.limit}`;

      // Add filter to URL if not ALL
      if (filter !== "ALL") {
        const statusMap = {
          DRAFT: "draft",
          PUBLISHED: "active",
          MINTED: "minted",
          FOR_SALE: "for_sale",
          SOLD: "sold",
        };
        const status = statusMap[filter];
        if (status) {
          url += `&status=${status}`;
        }
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data.properties || data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.data.total || data.data.length,
          totalPages:
            data.data.totalPages ||
            Math.ceil((data.data.total || data.data.length) / prev.limit),
        }));
        setError("");
      } else {
        setError("Không thể tải danh sách bất động sản");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    let filtered = properties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          property.location?.address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          property.propertyType
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "Chưa có giá";
    if (typeof price === "object" && price.amount) {
      return `${(price.amount / 1000000000).toFixed(2)} tỷ ${
        price.currency || "VND"
      }`;
    }
    return `${(price / 1000000000).toFixed(2)} tỷ VND`;
  };

  const getStatusBadge = (status, nft) => {
    let displayStatus = status;
    let className = `status-badge status-${status}`;

    // Override status if NFT is minted
    if (nft?.isMinted) {
      displayStatus = "minted";
      className = "status-badge status-minted";
    }

    const statusMap = {
      draft: { text: "Nháp", icon: "📝" },
      active: { text: "Đang hoạt động", icon: "✅" },
      published: { text: "Đã xuất bản", icon: "📢" },
      minted: { text: "Đã mint NFT", icon: "🎨" },
      for_sale: { text: "Đang bán", icon: "🏪" },
      in_transaction: { text: "Đang giao dịch", icon: "🔄" },
      sold: { text: "Đã bán", icon: "💰" },
      archived: { text: "Lưu trữ", icon: "📦" },
    };

    const statusInfo = statusMap[displayStatus] || {
      text: displayStatus,
      icon: "❓",
    };

    return (
      <span className={className}>
        {statusInfo.icon} {statusInfo.text}
      </span>
    );
  };

  const getPropertyTypeIcon = (type) => {
    const typeMap = {
      apartment: "🏢",
      house: "🏡",
      villa: "🏰",
      land: "🌍",
      commercial: "🏪",
    };
    return typeMap[type] || "🏠";
  };

  const openPropertyDetail = async (property) => {
    setSelectedProperty(property);
    setNftDetails(null);

    // If property has NFT, fetch full NFT details
    if (property.nft?.isMinted && property.nft?.tokenId !== undefined) {
      await fetchNftDetails(property.nft.tokenId);
    }
  };

  const fetchNftDetails = async (tokenId) => {
    try {
      setLoadingNft(true);
      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}?limit=1000`
      );
      const data = await response.json();

      // Search through all properties to find NFT collection data
      // This is temporary - ideally backend should have NFT endpoint
      // For now, we'll use what we have in property.nft
      setLoadingNft(false);
    } catch (error) {
      console.error("Error fetching NFT details:", error);
      setLoadingNft(false);
    }
  };

  const closePropertyDetail = () => {
    setSelectedProperty(null);
    setNftDetails(null);
  };

  const deleteProperty = async (propertyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bất động sản này?")) {
      return;
    }

    try {
      const response = await fetch(
        API_ENDPOINTS.ADMIN.PROPERTY_BY_ID(propertyId),
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setProperties((prevProperties) =>
          prevProperties.filter((p) => p._id !== propertyId)
        );

        if (selectedProperty && selectedProperty._id === propertyId) {
          setSelectedProperty(null);
        }

        alert("Xóa bất động sản thành công!");
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối: " + error.message);
    }
  };

  const changePage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const filteredProperties = getFilteredProperties();

  if (loading) {
    return (
      <div className="properties-container">
        <LoadingSpinner message="Đang tải danh sách bất động sản..." />
      </div>
    );
  }

  return (
    <div className="properties-container">
      <div className="properties-header">
        <h1>Quản lý Bất động sản</h1>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={fetchProperties} className="btn-retry">
            Thử lại
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="properties-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{pagination.total}</div>
            <div className="stat-label">TỔNG BĐS</div>
          </div>
        </div>
        <div className="stat-card stat-minted">
          <div className="stat-icon">🎨</div>
          <div className="stat-content">
            <div className="stat-number">
              {properties.filter((p) => p.nft?.isMinted).length}
            </div>
            <div className="stat-label">ĐÃ MINT NFT</div>
          </div>
        </div>
        <div className="stat-card stat-for-sale">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <div className="stat-number">
              {properties.filter((p) => p.status === "for_sale").length}
            </div>
            <div className="stat-label">ĐANG BÁN</div>
          </div>
        </div>
        <div className="stat-card stat-sold">
          <div className="stat-icon">🔵</div>
          <div className="stat-content">
            <div className="stat-number">
              {properties.filter((p) => p.status === "sold").length}
            </div>
            <div className="stat-label">ĐÃ BÁN</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, địa chỉ, loại BĐS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button
            className={filter === "ALL" ? "tab-btn active" : "tab-btn"}
            onClick={() => setFilter("ALL")}
          >
            Tất cả
          </button>
          <button
            className={filter === "DRAFT" ? "tab-btn active" : "tab-btn"}
            onClick={() => setFilter("DRAFT")}
          >
            Nháp
          </button>
          <button
            className={filter === "PUBLISHED" ? "tab-btn active" : "tab-btn"}
            onClick={() => setFilter("PUBLISHED")}
          >
            Đã xuất bản
          </button>
          <button
            className={filter === "MINTED" ? "tab-btn active" : "tab-btn"}
            onClick={() => setFilter("MINTED")}
          >
            Đã mint
          </button>
          <button
            className={filter === "FOR_SALE" ? "tab-btn active" : "tab-btn"}
            onClick={() => setFilter("FOR_SALE")}
          >
            Đang bán
          </button>
          <button
            className={filter === "SOLD" ? "tab-btn active" : "tab-btn"}
            onClick={() => setFilter("SOLD")}
          >
            Đã bán
          </button>
          <button
            className="btn-add-property"
            onClick={() => (window.location.href = "/admin/nft")}
          >
            Thêm Bất động sản
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="empty-state">
          <p>📭 Không tìm thấy bất động sản nào</p>
        </div>
      ) : (
        <div className="properties-grid">
          {filteredProperties.map((property) => (
            <div
              key={property._id}
              className="property-card"
              onClick={() => openPropertyDetail(property)}
            >
              <div className="property-image-wrapper">
                <img
                  src={
                    property.media?.images?.[0]?.url ||
                    property.images?.[0] ||
                    "https://via.placeholder.com/300"
                  }
                  alt={property.name || property.title}
                  className="property-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300?text=No+Image";
                  }}
                />
                <div className="property-badges">
                  {getStatusBadge(property.status, property.nft)}
                </div>
                <div className="property-type-badge">
                  <span>{getPropertyTypeIcon(property.propertyType)}</span>
                  <span>{property.propertyType || "house"}</span>
                </div>
              </div>

              <div className="property-card-body">
                <h3 className="property-title">
                  {property.name || property.title || "Unnamed Property"}
                </h3>

                <div className="property-location">
                  <span>📍</span>
                  <span>
                    {property.location?.address ||
                      property.address?.street ||
                      "N/A"}
                    ,{" "}
                    {property.location?.district ||
                      property.address?.district ||
                      ""}
                  </span>
                </div>

                <div className="property-price">
                  💰 {formatPrice(property.price)}
                </div>

                <div className="property-meta">
                  {property.nft?.tokenId && (
                    <span>🎨 #{property.nft.tokenId}</span>
                  )}
                  <span>
                    {new Date(property.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => changePage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-pagination"
          >
            ← Trước
          </button>

          <span className="pagination-info">
            Trang {pagination.page} / {pagination.totalPages} (
            {pagination.total} BĐS)
          </span>

          <button
            onClick={() => changePage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn-pagination"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={closePropertyDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePropertyDetail}>
              ×
            </button>

            <div className="modal-body">
              <div className="property-detail-header">
                <div className="property-detail-image">
                  <img
                    src={
                      selectedProperty.media?.images?.[0]?.url ||
                      selectedProperty.images?.[0] ||
                      "https://via.placeholder.com/400"
                    }
                    alt={selectedProperty.name || selectedProperty.title}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400?text=No+Image";
                    }}
                  />
                </div>
                <div className="property-detail-info">
                  <h2>{selectedProperty.name || selectedProperty.title}</h2>
                  <div className="property-type">
                    {getPropertyTypeIcon(selectedProperty.propertyType)}{" "}
                    {selectedProperty.propertyType}
                  </div>
                  {getStatusBadge(
                    selectedProperty.status,
                    selectedProperty.nft
                  )}
                  <div className="property-price-large">
                    💰 {formatPrice(selectedProperty.price)}
                  </div>
                </div>
              </div>

              <div className="property-detail-sections">
                <div className="detail-section">
                  <h3>📝 Thông tin cơ bản</h3>
                  <div className="detail-item">
                    <strong>ID:</strong>
                    <code>{selectedProperty._id}</code>
                  </div>
                  <div className="detail-item">
                    <strong>Tên:</strong>
                    <span>
                      {selectedProperty.name || selectedProperty.title}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Mô tả:</strong>
                    <span>{selectedProperty.description}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Loại BĐS:</strong>
                    <span>{selectedProperty.propertyType}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Trạng thái:</strong>
                    {getStatusBadge(
                      selectedProperty.status,
                      selectedProperty.nft
                    )}
                  </div>
                  <div className="detail-item">
                    <strong>Ngày tạo:</strong>
                    <span>{formatDate(selectedProperty.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Cập nhật:</strong>
                    <span>{formatDate(selectedProperty.updatedAt)}</span>
                  </div>
                </div>

                {selectedProperty.location && (
                  <div className="detail-section">
                    <h3>📍 Vị trí</h3>
                    <div className="detail-item">
                      <strong>Địa chỉ:</strong>
                      <span>
                        {selectedProperty.location.address ||
                          selectedProperty.address?.street}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Phường/Xã:</strong>
                      <span>
                        {selectedProperty.location.ward ||
                          selectedProperty.address?.ward}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Quận/Huyện:</strong>
                      <span>
                        {selectedProperty.location.district ||
                          selectedProperty.address?.district}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Thành phố:</strong>
                      <span>
                        {selectedProperty.location.city ||
                          selectedProperty.address?.city}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Quốc gia:</strong>
                      <span>
                        {selectedProperty.location.country ||
                          selectedProperty.address?.country ||
                          "Việt Nam"}
                      </span>
                    </div>
                  </div>
                )}

                {selectedProperty.nft?.isMinted && (
                  <div className="detail-section nft-section">
                    <h3>🎨 Thông tin NFT</h3>

                    {/* Token ID & Contract */}
                    <div className="detail-item highlight">
                      <strong>Token ID:</strong>
                      <span className="token-id-badge">
                        #{selectedProperty.nft.tokenId}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Contract Address:</strong>
                      <code className="contract-code">
                        {selectedProperty.nft.contractAddress}
                      </code>
                      <button
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedProperty.nft.contractAddress
                          );
                          alert("Đã copy contract address!");
                        }}
                      >
                        📋
                      </button>
                    </div>

                    {/* Ownership Info */}
                    {(selectedProperty.nft.currentOwner ||
                      selectedProperty.nft.owner) && (
                      <div className="detail-item">
                        <strong>Current Owner:</strong>
                        <code className="owner-code">
                          {selectedProperty.nft.currentOwner ||
                            selectedProperty.nft.owner}
                        </code>
                        <button
                          className="btn-copy"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedProperty.nft.currentOwner ||
                                selectedProperty.nft.owner
                            );
                            alert("Đã copy current owner address!");
                          }}
                        >
                          📋
                        </button>
                      </div>
                    )}

                    {selectedProperty.nft.originalOwner && (
                      <div className="detail-item">
                        <strong>Original Owner:</strong>
                        <code className="owner-code">
                          {selectedProperty.nft.originalOwner}
                        </code>
                        <button
                          className="btn-copy"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedProperty.nft.originalOwner
                            );
                            alert("Đã copy original owner address!");
                          }}
                        >
                          📋
                        </button>
                      </div>
                    )}

                    {selectedProperty.nft.mintedBy && (
                      <div className="detail-item">
                        <strong>Minted By:</strong>
                        <code className="owner-code">
                          {selectedProperty.nft.mintedBy}
                        </code>
                        <button
                          className="btn-copy"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedProperty.nft.mintedBy
                            );
                            alert("Đã copy minted by address!");
                          }}
                        >
                          📋
                        </button>
                      </div>
                    )}

                    {/* Metadata URIs */}
                    {selectedProperty.nft.metadataUri && (
                      <div className="detail-item highlight-ipfs">
                        <strong>Metadata URI:</strong>
                        <code className="ipfs-code">
                          {selectedProperty.nft.metadataUri}
                        </code>
                        <a
                          href={selectedProperty.nft.metadataUri.replace(
                            "ipfs://",
                            "https://gateway.pinata.cloud/ipfs/"
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-link"
                        >
                          🔗
                        </a>
                      </div>
                    )}

                    {(selectedProperty.nft.metadataCID ||
                      selectedProperty.ipfsMetadataCid) && (
                      <div className="detail-item highlight-ipfs">
                        <strong>Metadata CID:</strong>
                        <code className="ipfs-code">
                          {selectedProperty.nft.metadataCID ||
                            selectedProperty.ipfsMetadataCid}
                        </code>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${
                            selectedProperty.nft.metadataCID ||
                            selectedProperty.ipfsMetadataCid
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-link"
                        >
                          🔗
                        </a>
                      </div>
                    )}

                    {/* Mint Transaction Details */}
                    <div className="detail-item">
                      <strong>Mint Transaction Hash:</strong>
                      <code className="tx-code">
                        {selectedProperty.nft.mintTransactionHash ||
                          selectedProperty.nft.transactionHash}
                      </code>
                      <button
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedProperty.nft.mintTransactionHash ||
                              selectedProperty.nft.transactionHash
                          );
                          alert("Đã copy mint transaction hash!");
                        }}
                      >
                        📋
                      </button>
                    </div>

                    {selectedProperty.nft.mintBlockNumber && (
                      <div className="detail-item">
                        <strong>Mint Block Number:</strong>
                        <span className="block-badge">
                          #{selectedProperty.nft.mintBlockNumber}
                        </span>
                      </div>
                    )}

                    {selectedProperty.nft.mintedAt && (
                      <div className="detail-item">
                        <strong>Minted At:</strong>
                        <span>{formatDate(selectedProperty.nft.mintedAt)}</span>
                      </div>
                    )}

                    {/* Transfer & Sale Stats */}
                    <div className="detail-item">
                      <strong>Total Transfers:</strong>
                      <span className="stat-badge">
                        {selectedProperty.nft.totalTransfers || 0}
                      </span>
                    </div>

                    <div className="detail-item">
                      <strong>Total Sales:</strong>
                      <span className="stat-badge">
                        {selectedProperty.nft.totalSales || 0}
                      </span>
                    </div>

                    {selectedProperty.nft.lastTransferAt && (
                      <div className="detail-item">
                        <strong>Last Transfer At:</strong>
                        <span>
                          {formatDate(selectedProperty.nft.lastTransferAt)}
                        </span>
                      </div>
                    )}

                    {/* Views & Favorites */}
                    <div className="detail-item">
                      <strong>Views:</strong>
                      <span className="stat-badge">
                        {selectedProperty.nft.views || 0} 👁️
                      </span>
                    </div>

                    <div className="detail-item">
                      <strong>Favorites:</strong>
                      <span className="stat-badge">
                        {selectedProperty.nft.favorites || 0} ❤️
                      </span>
                    </div>

                    {/* NFT Status */}
                    {selectedProperty.nft.status && (
                      <div className="detail-item">
                        <strong>NFT Status:</strong>
                        <span className="nft-status-badge">
                          {selectedProperty.nft.status}
                        </span>
                      </div>
                    )}

                    {/* Listing Info */}
                    {selectedProperty.nft.listing && (
                      <div className="detail-item">
                        <strong>Listing:</strong>
                        <span className="listing-info">
                          {selectedProperty.nft.listing.listingType || "N/A"} -
                          {selectedProperty.nft.listing.status || "N/A"}
                        </span>
                      </div>
                    )}

                    {/* Transfer History */}
                    {selectedProperty.nft.transferHistory &&
                      selectedProperty.nft.transferHistory.length > 0 && (
                        <div className="detail-item full-width">
                          <strong>Transfer History:</strong>
                          <div className="transfer-history">
                            {selectedProperty.nft.transferHistory.map(
                              (transfer, idx) => (
                                <div key={idx} className="transfer-item">
                                  <span>#{idx + 1}</span>
                                  <span>
                                    From: {transfer.from?.slice(0, 10)}...
                                  </span>
                                  <span>
                                    To: {transfer.to?.slice(0, 10)}...
                                  </span>
                                  <span>
                                    {transfer.timestamp
                                      ? formatDate(transfer.timestamp)
                                      : "N/A"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Sale History */}
                    {selectedProperty.nft.saleHistory &&
                      selectedProperty.nft.saleHistory.length > 0 && (
                        <div className="detail-item full-width">
                          <strong>Sale History:</strong>
                          <div className="sale-history">
                            {selectedProperty.nft.saleHistory.map(
                              (sale, idx) => (
                                <div key={idx} className="sale-item">
                                  <span>#{idx + 1}</span>
                                  <span>Price: {formatPrice(sale.price)}</span>
                                  <span>
                                    Buyer: {sale.buyer?.slice(0, 10)}...
                                  </span>
                                  <span>
                                    {sale.timestamp
                                      ? formatDate(sale.timestamp)
                                      : "N/A"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {selectedProperty.details &&
                  Object.keys(selectedProperty.details).length > 0 && (
                    <div className="detail-section">
                      <h3>🏷️ Chi tiết kỹ thuật</h3>
                      <div className="attributes-grid">
                        {Object.entries(selectedProperty.details).map(
                          ([key, value], idx) => (
                            <div key={idx} className="attribute-item">
                              <div className="attribute-type">{key}</div>
                              <div className="attribute-value">{value}</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {selectedProperty.features &&
                  selectedProperty.features.length > 0 && (
                    <div className="detail-section">
                      <h3>✨ Tiện ích</h3>
                      <div className="features-list">
                        {selectedProperty.features.map((feature, idx) => (
                          <span key={idx} className="feature-item">
                            ✅ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedProperty.media?.images &&
                  selectedProperty.media.images.length > 1 && (
                    <div className="detail-section">
                      <h3>🖼️ Hình ảnh</h3>
                      <div className="images-grid">
                        {selectedProperty.media.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image.url || image}
                            alt={`Property ${idx + 1}`}
                            className="detail-image"
                            onClick={() =>
                              window.open(image.url || image, "_blank")
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="property-detail-actions">
                {selectedProperty.ipfsMetadataCid && (
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${selectedProperty.ipfsMetadataCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action primary"
                  >
                    🔗 Xem Metadata
                  </a>
                )}

                <button
                  onClick={() => deleteProperty(selectedProperty._id)}
                  className="btn-action danger"
                >
                  🗑️ Xóa BĐS
                </button>

                <button
                  onClick={closePropertyDetail}
                  className="btn-action secondary"
                >
                  ✖️ Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
