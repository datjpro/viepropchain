import React, { useState } from "react";
import BuyNFTModal from "../BuyNFTModal";
import RentNFTModal from "../RentNFTModal";
import "./PropertyDetailModal.css";

const PropertyDetailModal = ({ property, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);

  if (!property) return null;

  const images = property.images || property.media?.images || [];
  const currentImage =
    images[selectedImageIndex]?.url ||
    images[selectedImageIndex] ||
    "https://via.placeholder.com/800x600?text=No+Image";

  const formatPrice = (price) => {
    if (!price) return "N/A";
    const billions = price / 1000000000;
    return `${billions.toFixed(2)} tỷ VND`;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const propertyDetails = property.details || {};
  const propertyAddress = property.address || property.location || {};

  return (
    <>
      <div
        className="property-detail-modal-overlay"
        onClick={handleOverlayClick}
      >
        <div className="property-detail-modal">
          {/* Header */}
          <div className="modal-header">
            <h2>
              {property.title || property.name || "Chi tiết bất động sản"}
            </h2>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="modal-content">
            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="image-gallery">
                <img
                  src={currentImage}
                  alt={property.title}
                  className="main-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/800x600?text=No+Image";
                  }}
                />
                {images.length > 1 && (
                  <div className="thumbnail-list">
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={img.url || img}
                        alt={`Ảnh ${index + 1}`}
                        className={`thumbnail ${
                          index === selectedImageIndex ? "active" : ""
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/80x80?text=No+Image";
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Badges */}
            <div className="badges">
              {property.nft?.isMinted && (
                <span className="badge nft">
                  🎨 NFT #{property.nft.tokenId}
                </span>
              )}
              {property.verificationStatus === "verified" && (
                <span className="badge verified">✅ Đã xác minh</span>
              )}
              {property.status && (
                <span className="badge status">
                  {property.status === "active"
                    ? "🏷️ Đang bán"
                    : property.status}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="price-section">
              <div className="price-label">💰 Giá bán</div>
              <div className="price-value">{formatPrice(property.price)}</div>
            </div>

            {/* Property Info Grid */}
            <div className="property-info-grid">
              <div className="info-card">
                <div className="info-label">📏 Diện tích</div>
                <div className="info-value">
                  {property.area || propertyDetails.area || "N/A"} m²
                </div>
              </div>

              <div className="info-card">
                <div className="info-label">🛏️ Phòng ngủ</div>
                <div className="info-value">
                  {property.bedrooms || propertyDetails.bedrooms || "N/A"}
                </div>
              </div>

              <div className="info-card">
                <div className="info-label">🚿 Phòng tắm</div>
                <div className="info-value">
                  {property.bathrooms || propertyDetails.bathrooms || "N/A"}
                </div>
              </div>

              <div className="info-card">
                <div className="info-label">🏠 Loại hình</div>
                <div className="info-value">
                  {property.propertyType === "house"
                    ? "Nhà ở"
                    : property.propertyType === "apartment"
                    ? "Căn hộ"
                    : property.propertyType === "land"
                    ? "Đất"
                    : property.propertyType || "N/A"}
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="description-section">
                <h3>📝 Mô tả</h3>
                <p className="description-text">{property.description}</p>
              </div>
            )}

            {/* Address */}
            <div className="description-section">
              <h3>📍 Địa chỉ</h3>
              <p className="description-text">
                {propertyAddress.street || propertyAddress.address},{" "}
                {propertyAddress.ward && `${propertyAddress.ward}, `}
                {propertyAddress.district},{" "}
                {propertyAddress.city === "HoChiMinh"
                  ? "TP. Hồ Chí Minh"
                  : propertyAddress.city}
                {propertyAddress.country && `, ${propertyAddress.country}`}
              </p>
            </div>

            {/* Legal Info */}
            {property.legalDocumentId && (
              <div className="description-section">
                <h3>📄 Thông tin pháp lý</h3>
                <p className="description-text">
                  <strong>Mã sổ đỏ:</strong> {property.legalDocumentId}
                  <br />
                  <strong>Trạng thái:</strong>{" "}
                  {property.legalStatus || "Red Book (Sổ Đỏ)"}
                </p>
              </div>
            )}

            {/* Owner Info */}
            {property.owner && (
              <div className="owner-info">
                <strong>👤 Chủ sở hữu:</strong> {property.owner}
                {property.ownerWallet && (
                  <>
                    <br />
                    <strong>💎 Ví:</strong> {property.ownerWallet.slice(0, 6)}
                    ...
                    {property.ownerWallet.slice(-4)}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn-action btn-buy"
              onClick={() => setShowBuyModal(true)}
              disabled={!property.nft?.isMinted}
            >
              🛒 Mua ngay
            </button>
            <button
              className="btn-action btn-rent"
              onClick={() => setShowRentModal(true)}
              disabled={!property.nft?.isMinted}
            >
              🏠 Thuê
            </button>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && property.nft?.tokenId && (
        <BuyNFTModal
          nft={{
            tokenId: property.nft.tokenId,
            name: property.title || property.name,
            price: property.price,
            image: images[0]?.url || images[0],
          }}
          onClose={() => setShowBuyModal(false)}
        />
      )}

      {/* Rent Modal */}
      {showRentModal && property.nft?.tokenId && (
        <RentNFTModal
          nft={{
            tokenId: property.nft.tokenId,
            name: property.title || property.name,
            pricePerDay: property.rentalPrice || property.price / 365,
            image: images[0]?.url || images[0],
          }}
          onClose={() => setShowRentModal(false)}
        />
      )}
    </>
  );
};

export default PropertyDetailModal;
