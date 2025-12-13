import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import { formatPrice } from "../../../utils/priceUtils";
import "./Marketplace.css";

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedListing, setSelectedListing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    cancelledListings: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MARKETPLACE.LISTINGS);
      const data = await response.json();

      if (data.success) {
        const allListings = data.data.listings || data.data || [];
        const active = allListings.filter((l) => l.status === "active").length;
        const sold = allListings.filter((l) => l.status === "sold").length;
        const cancelled = allListings.filter(
          (l) => l.status === "cancelled"
        ).length;
        const totalValue = allListings
          .filter((l) => l.status === "active")
          .reduce((sum, l) => sum + parseFloat(l.price?.amount || 0), 0);

        setStats({
          totalListings: allListings.length,
          activeListings: active,
          soldListings: sold,
          cancelledListings: cancelled,
          totalValue: totalValue,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);

      let url = API_ENDPOINTS.MARKETPLACE.LISTINGS;

      // Apply filter
      if (filter === "FOR_SALE") {
        url += "?listingType=sale";
      } else if (filter === "FOR_RENT") {
        url += "?listingType=rental";
      } else if (filter === "ACTIVE") {
        url += "?status=active";
      } else if (filter === "SOLD") {
        url += "?status=sold";
      } else if (filter === "CANCELLED") {
        url += "?status=cancelled";
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setListings(data.data.listings || data.data || []);
        setError("");
      } else {
        setError("Không thể tải danh sách niêm yết");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewListingDetail = async (listingId) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.MARKETPLACE.LISTINGS}/${listingId}`
      );
      const data = await response.json();

      if (data.success) {
        setSelectedListing(data.data);
      } else {
        alert("Không thể tải chi tiết listing");
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleCancelListing = async (listingId) => {
    if (!window.confirm("Bạn có chắc muốn HỦY listing này?")) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_ENDPOINTS.MARKETPLACE.LISTINGS}/${listingId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("✅ Đã hủy listing thành công!");
        fetchListings();
        setSelectedListing(null);
      } else {
        alert("Lỗi: " + (data.message || data.error));
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveListing = async (listingId) => {
    if (!window.confirm("Duyệt listing này?")) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_ENDPOINTS.MARKETPLACE.LISTINGS}/${listingId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("✅ Đã duyệt listing!");
        fetchListings();
        if (selectedListing && selectedListing._id === listingId) {
          viewListingDetail(listingId);
        }
      } else {
        alert("Lỗi: " + (data.message || data.error));
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // formatPrice được import từ utils/priceUtils.js

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: "Đang hoạt động", class: "status-active" },
      pending: { text: "Chờ duyệt", class: "status-pending" },
      sold: { text: "Đã bán", class: "status-sold" },
      rented: { text: "Đã cho thuê", class: "status-rented" },
      cancelled: { text: "Đã hủy", class: "status-cancelled" },
      expired: { text: "Hết hạn", class: "status-expired" },
    };

    const statusInfo = statusMap[status] || { text: status, class: "" };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getListingTypeBadge = (type) => {
    const typeMap = {
      sale: { text: "Bán", class: "type-sale", icon: "💰" },
      rental: { text: "Cho thuê", class: "type-rental", icon: "🏠" },
    };

    const typeInfo = typeMap[type] || { text: type, class: "", icon: "📋" };
    return (
      <span className={`type-badge ${typeInfo.class}`}>
        {typeInfo.icon} {typeInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="marketplace-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1>🏪 Quản lý Sàn Niêm yết</h1>
        <p>Quản lý listings mua bán và cho thuê BĐS</p>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={fetchListings} className="btn-retry">
            Thử lại
          </button>
        </div>
      )}

      {/* Enhanced Statistics Dashboard */}
      <div className="marketplace-stats">
        <div className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalListings}</div>
            <div className="stat-label">Tổng Listings</div>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeListings}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card sale">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">
              {listings.filter((l) => l.listingType === "sale").length}
            </div>
            <div className="stat-label">Đang bán</div>
          </div>
        </div>
        <div className="stat-card rental">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <div className="stat-number">
              {listings.filter((l) => l.listingType === "rental").length}
            </div>
            <div className="stat-label">Cho thuê</div>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">🎉</div>
          <div className="stat-content">
            <div className="stat-number">{stats.soldListings}</div>
            <div className="stat-label">Đã giao dịch</div>
          </div>
        </div>
        <div className="stat-card value">
          <div className="stat-icon">💎</div>
          <div className="stat-content">
            <div className="stat-number">
              {formatPrice({ amount: stats.totalValue, currency: "ETH" })}
            </div>
            <div className="stat-label">Tổng giá trị</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-actions">
        <button
          className="btn-action refresh"
          onClick={() => {
            fetchListings();
            fetchStats();
          }}
        >
          🔄 Làm mới tất cả
        </button>
        <button
          className="btn-action export"
          onClick={() => {
            const dataStr = JSON.stringify(listings, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `marketplace-listings-${
              new Date().toISOString().split("T")[0]
            }.json`;
            link.click();
          }}
        >
          📥 Xuất dữ liệu
        </button>
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm listings..."
            className="search-input"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              if (searchTerm === "") {
                fetchListings();
              } else {
                const filtered = listings.filter(
                  (listing) =>
                    listing.property?.title
                      ?.toLowerCase()
                      .includes(searchTerm) ||
                    listing.property?.address?.district
                      ?.toLowerCase()
                      .includes(searchTerm) ||
                    listing.property?.address?.city
                      ?.toLowerCase()
                      .includes(searchTerm) ||
                    listing._id.toLowerCase().includes(searchTerm)
                );
                setListings(filtered);
              }
            }}
          />
        </div>
      </div>

      {/* Enhanced Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === "ALL" ? "active" : ""}
          onClick={() => setFilter("ALL")}
        >
          📋 Tất cả ({listings.length})
        </button>
        <button
          className={filter === "ACTIVE" ? "active" : ""}
          onClick={() => setFilter("ACTIVE")}
        >
          ✅ Đang hoạt động (
          {listings.filter((l) => l.status === "active").length})
        </button>
        <button
          className={filter === "FOR_SALE" ? "active" : ""}
          onClick={() => setFilter("FOR_SALE")}
        >
          💰 Bán ({listings.filter((l) => l.listingType === "sale").length})
        </button>
        <button
          className={filter === "FOR_RENT" ? "active" : ""}
          onClick={() => setFilter("FOR_RENT")}
        >
          🏠 Cho thuê (
          {listings.filter((l) => l.listingType === "rental").length})
        </button>
        <button
          className={filter === "SOLD" ? "active" : ""}
          onClick={() => setFilter("SOLD")}
        >
          🎉 Đã giao dịch (
          {
            listings.filter((l) => l.status === "sold" || l.status === "rented")
              .length
          }
          )
        </button>
        <button
          className={filter === "CANCELLED" ? "active" : ""}
          onClick={() => setFilter("CANCELLED")}
        >
          ❌ Đã hủy ({listings.filter((l) => l.status === "cancelled").length})
        </button>
      </div>

      {/* Sorting Options */}
      <div className="sort-controls">
        <label>Sắp xếp theo:</label>
        <select
          onChange={(e) => {
            const sortBy = e.target.value;
            const sorted = [...listings].sort((a, b) => {
              switch (sortBy) {
                case "price-asc":
                  return (
                    (parseFloat(a.price?.amount) || 0) -
                    (parseFloat(b.price?.amount) || 0)
                  );
                case "price-desc":
                  return (
                    (parseFloat(b.price?.amount) || 0) -
                    (parseFloat(a.price?.amount) || 0)
                  );
                case "date-new":
                  return new Date(b.createdAt) - new Date(a.createdAt);
                case "date-old":
                  return new Date(a.createdAt) - new Date(b.createdAt);
                case "status":
                  return a.status.localeCompare(b.status);
                default:
                  return 0;
              }
            });
            setListings(sorted);
          }}
          className="sort-select"
        >
          <option value="">Chọn cách sắp xếp</option>
          <option value="date-new">📅 Mới nhất</option>
          <option value="date-old">📅 Cũ nhất</option>
          <option value="price-asc">💰 Giá thấp → cao</option>
          <option value="price-desc">💰 Giá cao → thấp</option>
          <option value="status">🔄 Theo trạng thái</option>
        </select>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="empty-state">
          <p>📭 Không có listing nào</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className={`listing-card ${listing.status}`}
              onClick={() => viewListingDetail(listing._id)}
            >
              <div className="listing-image">
                <img
                  src={
                    listing.property?.images?.[0] ||
                    listing.images?.[0] ||
                    "https://via.placeholder.com/300?text=No+Image"
                  }
                  alt={listing.property?.title || "Property"}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300?text=No+Image";
                  }}
                />
                <div className="listing-badges">
                  {getStatusBadge(listing.status)}
                  {getListingTypeBadge(listing.listingType)}
                </div>
                <div className="listing-id-badge">
                  ID: {listing._id.slice(-6)}
                </div>
              </div>

              <div className="listing-body">
                <h3>{listing.property?.title || listing.title || "Unnamed"}</h3>

                <div className="listing-info">
                  <div className="info-row priority">
                    <strong>💰 Giá:</strong>
                    <span className="price-highlight">
                      {formatPrice(listing.price)}
                    </span>
                  </div>

                  {listing.listingType === "rental" &&
                    listing.rentalDetails && (
                      <div className="info-row">
                        <strong>📅 Thời hạn:</strong>
                        <span>{listing.rentalDetails.duration} tháng</span>
                      </div>
                    )}

                  <div className="info-row">
                    <strong>📍 Địa chỉ:</strong>
                    <span>
                      {listing.property?.address?.district},{" "}
                      {listing.property?.address?.city}
                    </span>
                  </div>

                  <div className="info-row">
                    <strong>👤 Seller:</strong>
                    <span className="seller-address">
                      {typeof listing.seller === "string"
                        ? `${listing.seller.slice(
                            0,
                            6
                          )}...${listing.seller.slice(-4)}`
                        : listing.seller?.walletAddress
                        ? `${listing.seller.walletAddress.slice(
                            0,
                            6
                          )}...${listing.seller.walletAddress.slice(-4)}`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="info-row">
                    <strong>📅 Tạo:</strong>
                    <span className="date-small">
                      {formatDate(listing.createdAt)}
                    </span>
                  </div>

                  {listing.nftTokenId && (
                    <div className="info-row">
                      <strong>🎨 NFT:</strong>
                      <span className="token-badge">#{listing.nftTokenId}</span>
                    </div>
                  )}

                  {/* Admin specific info */}
                  <div className="admin-info">
                    <div className="info-row">
                      <strong>🔗 Property ID:</strong>
                      <span className="property-id">
                        {listing.propertyId?.slice(-8) || "N/A"}
                      </span>
                    </div>

                    {listing.viewCount && (
                      <div className="info-row">
                        <strong>👁️ Lượt xem:</strong>
                        <span>{listing.viewCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="listing-footer">
                  <button
                    className="btn-view primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewListingDetail(listing._id);
                    }}
                  >
                    👁️ Chi tiết
                  </button>

                  {/* Quick admin actions */}
                  <div className="quick-actions">
                    {listing.status === "pending" && (
                      <button
                        className="btn-quick approve"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveListing(listing._id);
                        }}
                        disabled={actionLoading}
                      >
                        ✅
                      </button>
                    )}

                    {(listing.status === "active" ||
                      listing.status === "pending") && (
                      <button
                        className="btn-quick cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelListing(listing._id);
                        }}
                        disabled={actionLoading}
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedListing(null)}
            >
              ×
            </button>

            <div className="modal-body">
              <h2>Chi tiết Listing</h2>

              {/* Status & Type */}
              <div className="modal-badges">
                {getStatusBadge(selectedListing.status)}
                {getListingTypeBadge(selectedListing.listingType)}
              </div>

              {/* Images */}
              <div className="detail-section">
                <h3>🖼️ Hình ảnh</h3>
                <div className="images-grid">
                  {selectedListing.property?.images &&
                  selectedListing.property.images.length > 0 ? (
                    selectedListing.property.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Property ${idx + 1}`}
                        className="detail-image"
                        onClick={() => window.open(image, "_blank")}
                      />
                    ))
                  ) : (
                    <p>Chưa có ảnh</p>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="detail-section">
                <h3>📋 Thông tin cơ bản</h3>
                <div className="detail-item">
                  <strong>Listing ID:</strong>
                  <code>{selectedListing._id}</code>
                </div>
                <div className="detail-item">
                  <strong>Property ID:</strong>
                  <code>{selectedListing.propertyId}</code>
                </div>
                <div className="detail-item">
                  <strong>Loại giao dịch:</strong>
                  {getListingTypeBadge(selectedListing.listingType)}
                </div>
                <div className="detail-item">
                  <strong>Trạng thái:</strong>
                  {getStatusBadge(selectedListing.status)}
                </div>
                <div className="detail-item">
                  <strong>Giá:</strong>
                  <span className="price-large">
                    {formatPrice(selectedListing.price)}
                  </span>
                </div>
              </div>

              {/* Rental Details */}
              {selectedListing.listingType === "rental" &&
                selectedListing.rentalDetails && (
                  <div className="detail-section">
                    <h3>🏠 Chi tiết cho thuê</h3>
                    <div className="detail-item">
                      <strong>Thời hạn:</strong>
                      <span>
                        {selectedListing.rentalDetails.duration} tháng
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Giá/tháng:</strong>
                      <span>
                        {formatPrice(selectedListing.rentalDetails.monthlyRent)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Tiền đặt cọc:</strong>
                      <span>
                        {formatPrice(selectedListing.rentalDetails.deposit)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Ngày bắt đầu:</strong>
                      <span>
                        {formatDate(selectedListing.rentalDetails.startDate)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Ngày kết thúc:</strong>
                      <span>
                        {formatDate(selectedListing.rentalDetails.endDate)}
                      </span>
                    </div>
                  </div>
                )}

              {/* Seller Info */}
              <div className="detail-section">
                <h3>👤 Thông tin người bán</h3>
                <div className="detail-item">
                  <strong>Seller Address:</strong>
                  <code>
                    {typeof selectedListing.seller === "string"
                      ? selectedListing.seller
                      : selectedListing.seller?.walletAddress || "N/A"}
                  </code>
                  <button
                    className="btn-copy"
                    onClick={() => {
                      const sellerAddress =
                        typeof selectedListing.seller === "string"
                          ? selectedListing.seller
                          : selectedListing.seller?.walletAddress;
                      if (sellerAddress) {
                        navigator.clipboard.writeText(sellerAddress);
                        alert("Đã copy!");
                      }
                    }}
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* NFT Info */}
              {selectedListing.nftTokenId && (
                <div className="detail-section">
                  <h3>🎨 Thông tin NFT</h3>
                  <div className="detail-item">
                    <strong>NFT Token ID:</strong>
                    <span className="token-badge">
                      #{selectedListing.nftTokenId}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Contract Address:</strong>
                    <code>{selectedListing.nftContract}</code>
                  </div>
                </div>
              )}

              {/* Blockchain Info */}
              {selectedListing.blockchainData && (
                <div className="detail-section">
                  <h3>⛓️ Thông tin Blockchain</h3>
                  <div className="detail-item">
                    <strong>Transaction Hash:</strong>
                    <code>
                      {selectedListing.blockchainData.transactionHash}
                    </code>
                    <button
                      className="btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          selectedListing.blockchainData.transactionHash
                        );
                        alert("Đã copy!");
                      }}
                    >
                      📋
                    </button>
                  </div>
                  <div className="detail-item">
                    <strong>Block Number:</strong>
                    <span>{selectedListing.blockchainData.blockNumber}</span>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="detail-section">
                <h3>📅 Thời gian</h3>
                <div className="detail-item">
                  <strong>Ngày tạo:</strong>
                  <span>{formatDate(selectedListing.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <strong>Cập nhật lần cuối:</strong>
                  <span>{formatDate(selectedListing.updatedAt)}</span>
                </div>
                {selectedListing.expiresAt && (
                  <div className="detail-item">
                    <strong>Ngày hết hạn:</strong>
                    <span>{formatDate(selectedListing.expiresAt)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="modal-actions">
                {selectedListing.status === "pending" && (
                  <button
                    onClick={() => handleApproveListing(selectedListing._id)}
                    className="btn-action approve"
                    disabled={actionLoading}
                  >
                    ✅ Duyệt Listing
                  </button>
                )}
                {(selectedListing.status === "active" ||
                  selectedListing.status === "pending") && (
                  <button
                    onClick={() => handleCancelListing(selectedListing._id)}
                    className="btn-action cancel-listing"
                    disabled={actionLoading}
                  >
                    ❌ Hủy Listing
                  </button>
                )}
                <button
                  onClick={() => setSelectedListing(null)}
                  className="btn-action close"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
