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

  useEffect(() => {
    fetchListings();
  }, [filter]);

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

      {/* Statistics */}
      <div className="marketplace-stats">
        <div className="stat-card">
          <div className="stat-number">{listings.length}</div>
          <div className="stat-label">Tổng Listings</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {listings.filter((l) => l.status === "active").length}
          </div>
          <div className="stat-label">Đang hoạt động</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {listings.filter((l) => l.listingType === "sale").length}
          </div>
          <div className="stat-label">Đang bán</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {listings.filter((l) => l.listingType === "rental").length}
          </div>
          <div className="stat-label">Cho thuê</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {
              listings.filter(
                (l) => l.status === "sold" || l.status === "rented"
              ).length
            }
          </div>
          <div className="stat-label">Đã giao dịch</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === "ALL" ? "active" : ""}
          onClick={() => setFilter("ALL")}
        >
          Tất cả
        </button>
        <button
          className={filter === "ACTIVE" ? "active" : ""}
          onClick={() => setFilter("ACTIVE")}
        >
          Đang hoạt động
        </button>
        <button
          className={filter === "FOR_SALE" ? "active" : ""}
          onClick={() => setFilter("FOR_SALE")}
        >
          💰 Bán
        </button>
        <button
          className={filter === "FOR_RENT" ? "active" : ""}
          onClick={() => setFilter("FOR_RENT")}
        >
          🏠 Cho thuê
        </button>
        <button
          className={filter === "SOLD" ? "active" : ""}
          onClick={() => setFilter("SOLD")}
        >
          ✅ Đã giao dịch
        </button>
        <button
          className={filter === "CANCELLED" ? "active" : ""}
          onClick={() => setFilter("CANCELLED")}
        >
          ❌ Đã hủy
        </button>
        <button onClick={fetchListings} className="btn-refresh">
          🔄 Làm mới
        </button>
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
              className="listing-card"
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
              </div>

              <div className="listing-body">
                <h3>{listing.property?.title || listing.title || "Unnamed"}</h3>

                <div className="listing-info">
                  <div className="info-row">
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
                    <span>
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
                    <strong>📅 Ngày tạo:</strong>
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>

                  {listing.nftTokenId && (
                    <div className="info-row">
                      <strong>🎨 NFT Token ID:</strong>
                      <span className="token-badge">#{listing.nftTokenId}</span>
                    </div>
                  )}
                </div>

                <div className="listing-footer">
                  <button className="btn-view">👁️ Xem chi tiết</button>
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
