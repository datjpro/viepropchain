import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import "./PendingProperties.css";

const PendingProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING_KYC, PENDING_APPROVAL

  useEffect(() => {
    fetchPendingProperties();
  }, [filter]);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);

      let url = `${API_ENDPOINTS.ADMIN.PROPERTIES}?verificationStatus=pending`;

      // Filter by specific status
      if (filter === "PENDING_KYC") {
        url = `${API_ENDPOINTS.ADMIN.PROPERTIES}?verificationStatus=pending_kyc`;
      } else if (filter === "PENDING_APPROVAL") {
        url = `${API_ENDPOINTS.ADMIN.PROPERTIES}?verificationStatus=pending_approval`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data.properties || data.data || []);
        setError("");
      } else {
        setError("Không thể tải danh sách BĐS chờ duyệt");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewPropertyDetail = async (propertyId) => {
    try {
      // Admin view - có quyền xem giấy tờ
      const response = await fetch(
        API_ENDPOINTS.ADMIN.PROPERTY_BY_ID(propertyId)
      );
      const data = await response.json();

      if (data.success) {
        setSelectedProperty(data.data);
      } else {
        alert("Không thể tải chi tiết BĐS");
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleApprove = async (propertyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn DUYỆT bất động sản này?")) {
      return;
    }

    try {
      setActionLoading(true);

      const token = localStorage.getItem("viepropchain_token");
      if (!token) {
        alert("⚠️ Vui lòng đăng nhập lại!");
        return;
      }

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}/${propertyId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            note: "Giấy tờ hợp lệ, đã duyệt",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("✅ Đã duyệt BĐS thành công!");
        // Remove from pending list
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
        setSelectedProperty(null);
      } else {
        alert("Lỗi: " + (data.message || data.error));
      }
    } catch (error) {
      alert("Lỗi kết nối: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMintNFT = async (propertyId) => {
    if (!window.confirm("Mint NFT cho bất động sản này? (Tự động chọn ví)")) {
      return;
    }

    try {
      setActionLoading(true);

      const token = localStorage.getItem("viepropchain_token");
      if (!token) {
        alert("⚠️ Vui lòng đăng nhập lại!");
        return;
      }

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}/${propertyId}/mint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            metadataUri: null, // Auto-generate
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const isCustodial = data.data.isCustodial;
        const message = isCustodial
          ? `🏦 Mint NFT thành công!\nNFT được lưu vào ví Admin (Custodial)\nToken ID: ${data.data.tokenId}\n\nUser chưa liên kết ví, NFT sẽ được giữ hộ.`
          : `✅ Mint NFT thành công!\nNFT đã chuyển vào ví User\nToken ID: ${data.data.tokenId}`;

        alert(message);

        // Refresh property detail
        if (selectedProperty && selectedProperty._id === propertyId) {
          viewPropertyDetail(propertyId);
        }

        // Remove from pending list
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
      } else {
        alert("Lỗi: " + (data.message || data.error));
      }
    } catch (error) {
      alert("Lỗi kết nối: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (propertyId) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
      setActionLoading(true);

      const token = localStorage.getItem("viepropchain_token");
      if (!token) {
        alert("⚠️ Vui lòng đăng nhập lại!");
        return;
      }

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}/${propertyId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("❌ Đã từ chối BĐS");
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
        setSelectedProperty(null);
      } else {
        alert("Lỗi: " + (data.message || data.error));
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async (propertyId) => {
    const message = prompt("Nhập thông tin cần bổ sung:");
    if (!message) return;

    try {
      setActionLoading(true);

      const token = localStorage.getItem("viepropchain_token");
      if (!token) {
        alert("⚠️ Vui lòng đăng nhập lại!");
        return;
      }

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}/${propertyId}/request-info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("📝 Đã yêu cầu bổ sung thông tin");
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
        setSelectedProperty(null);
      } else {
        alert("Lỗi: " + (data.message || data.error));
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setActionLoading(false);
    }
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
    return `${(price / 1000000000).toFixed(2)} tỷ VND`;
  };

  const getStatusBadge = (verificationStatus, kycStatus) => {
    if (verificationStatus === "pending_kyc") {
      return <span className="status-badge kyc-pending">⏳ Chờ KYC</span>;
    }
    if (verificationStatus === "pending_approval") {
      return (
        <span className="status-badge approval-pending">👀 Chờ duyệt</span>
      );
    }
    return <span className="status-badge">{verificationStatus}</span>;
  };

  if (loading) {
    return (
      <div className="pending-container">
        <LoadingSpinner message="Đang tải BĐS chờ duyệt..." />
      </div>
    );
  }

  return (
    <div className="pending-container">
      <div className="pending-header">
        <h1>👮 Duyệt Bất động sản</h1>
        <p>Danh sách BĐS chờ xác minh và duyệt</p>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={fetchPendingProperties} className="btn-retry">
            Thử lại
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === "ALL" ? "active" : ""}
          onClick={() => setFilter("ALL")}
        >
          Tất cả ({properties.length})
        </button>
        <button
          className={filter === "PENDING_KYC" ? "active" : ""}
          onClick={() => setFilter("PENDING_KYC")}
        >
          ⏳ Chờ KYC
        </button>
        <button
          className={filter === "PENDING_APPROVAL" ? "active" : ""}
          onClick={() => setFilter("PENDING_APPROVAL")}
        >
          👀 Chờ duyệt
        </button>
        <button onClick={fetchPendingProperties} className="btn-refresh">
          🔄 Làm mới
        </button>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="empty-state">
          <p>📭 Không có BĐS nào chờ duyệt</p>
        </div>
      ) : (
        <div className="pending-grid">
          {properties.map((property) => (
            <div key={property._id} className="pending-card">
              <div className="pending-image">
                <img
                  src={
                    property.images?.[0] ||
                    "https://via.placeholder.com/300?text=No+Image"
                  }
                  alt={property.title}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300?text=No+Image";
                  }}
                />
                {getStatusBadge(
                  property.verificationStatus,
                  property.kycStatus
                )}
              </div>

              <div className="pending-body">
                <h3>{property.title || "Unnamed Property"}</h3>
                <div className="property-info">
                  <div className="info-item">
                    <strong>📍 Địa chỉ:</strong>
                    <span>
                      {property.address?.street}, {property.address?.ward},{" "}
                      {property.address?.district}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>💰 Giá:</strong>
                    <span>{formatPrice(property.price)}</span>
                  </div>
                  <div className="info-item">
                    <strong>🏠 Loại:</strong>
                    <span>{property.propertyType}</span>
                  </div>
                  <div className="info-item">
                    <strong>👤 Chủ nhà:</strong>
                    <span>{property.owner}</span>
                  </div>
                  <div className="info-item">
                    <strong>📅 Ngày tạo:</strong>
                    <span>{formatDate(property.createdAt)}</span>
                  </div>
                  <div className="info-item">
                    <strong>📄 Số GCN:</strong>
                    <span>{property.legalDocumentId}</span>
                  </div>
                </div>

                <div className="pending-actions">
                  <button
                    onClick={() => viewPropertyDetail(property._id)}
                    className="btn-view"
                  >
                    👁️ Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleApprove(property._id)}
                    className="btn-approve"
                    disabled={actionLoading}
                  >
                    ✅ Duyệt
                  </button>
                  <button
                    onClick={() => handleMintNFT(property._id)}
                    className="btn-mint"
                    disabled={actionLoading}
                  >
                    🎨 Mint NFT
                  </button>
                  <button
                    onClick={() => handleReject(property._id)}
                    className="btn-reject"
                    disabled={actionLoading}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProperty(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedProperty(null)}
            >
              ×
            </button>

            <div className="modal-body">
              <h2>Chi tiết Bất động sản</h2>

              {/* Images */}
              <div className="detail-section">
                <h3>🖼️ Hình ảnh</h3>
                <div className="images-grid">
                  {selectedProperty.images &&
                  selectedProperty.images.length > 0 ? (
                    selectedProperty.images.map((image, idx) => (
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
                  <strong>ID:</strong>
                  <code>{selectedProperty._id}</code>
                </div>
                <div className="detail-item">
                  <strong>Tên:</strong>
                  <span>{selectedProperty.title}</span>
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
                  <strong>Giá:</strong>
                  <span>{formatPrice(selectedProperty.price)}</span>
                </div>
                <div className="detail-item">
                  <strong>Diện tích:</strong>
                  <span>{selectedProperty.area} m²</span>
                </div>
                <div className="detail-item">
                  <strong>Số phòng ngủ:</strong>
                  <span>{selectedProperty.bedrooms}</span>
                </div>
                <div className="detail-item">
                  <strong>Số phòng tắm:</strong>
                  <span>{selectedProperty.bathrooms}</span>
                </div>
              </div>

              {/* Address */}
              <div className="detail-section">
                <h3>📍 Địa chỉ</h3>
                <div className="detail-item">
                  <strong>Đường:</strong>
                  <span>{selectedProperty.address?.street}</span>
                </div>
                <div className="detail-item">
                  <strong>Phường/Xã:</strong>
                  <span>{selectedProperty.address?.ward}</span>
                </div>
                <div className="detail-item">
                  <strong>Quận/Huyện:</strong>
                  <span>{selectedProperty.address?.district}</span>
                </div>
                <div className="detail-item">
                  <strong>Thành phố:</strong>
                  <span>{selectedProperty.address?.city}</span>
                </div>
              </div>

              {/* Legal Documents - ADMIN ONLY */}
              <div className="detail-section legal-section">
                <h3>📄 Giấy tờ pháp lý (RIÊNG TƯ - CHỈ ADMIN)</h3>
                <div className="detail-item">
                  <strong>Số GCN:</strong>
                  <code>{selectedProperty.legalDocumentId}</code>
                </div>
                <div className="detail-item">
                  <strong>Tình trạng pháp lý:</strong>
                  <span>{selectedProperty.legalStatus}</span>
                </div>
                {selectedProperty.legalDocuments &&
                selectedProperty.legalDocuments.length > 0 ? (
                  <div className="documents-list">
                    <strong>Tài liệu đính kèm:</strong>
                    {selectedProperty.legalDocuments.map((doc, idx) => (
                      <div key={idx} className="document-item">
                        <a
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-doc"
                        >
                          📎 Tài liệu {idx + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="warning">⚠️ Chưa có giấy tờ đính kèm</p>
                )}
              </div>

              {/* Verification Status */}
              <div className="detail-section">
                <h3>🔐 Trạng thái</h3>
                <div className="detail-item">
                  <strong>Verification Status:</strong>
                  {getStatusBadge(
                    selectedProperty.verificationStatus,
                    selectedProperty.kycStatus
                  )}
                </div>
                <div className="detail-item">
                  <strong>KYC Status:</strong>
                  <span className="status-badge">
                    {selectedProperty.kycStatus}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Blockchain Status:</strong>
                  <span className="status-badge">
                    {selectedProperty.blockchainStatus}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Custodial:</strong>
                  <span>{selectedProperty.isCustodial ? "Yes" : "No"}</span>
                </div>
                <div className="detail-item">
                  <strong>Owner Wallet:</strong>
                  <code>
                    {selectedProperty.ownerWallet || "Chưa liên kết ví"}
                  </code>
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  onClick={() => handleApprove(selectedProperty._id)}
                  className="btn-action approve"
                  disabled={actionLoading}
                >
                  ✅ Duyệt BĐS
                </button>
                <button
                  onClick={() => handleMintNFT(selectedProperty._id)}
                  className="btn-action mint"
                  disabled={actionLoading}
                >
                  🎨 Mint NFT
                </button>
                <button
                  onClick={() => handleRequestInfo(selectedProperty._id)}
                  className="btn-action info"
                  disabled={actionLoading}
                >
                  📝 Yêu cầu bổ sung
                </button>
                <button
                  onClick={() => handleReject(selectedProperty._id)}
                  className="btn-action reject"
                  disabled={actionLoading}
                >
                  ❌ Từ chối
                </button>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="btn-action cancel"
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

export default PendingProperties;
