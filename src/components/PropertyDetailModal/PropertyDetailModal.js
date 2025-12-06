import React, { useState } from "react";
import BuyNFTModal from "../BuyNFTModal/BuyNFTModal";
import RentNFTModal from "../RentNFTModal/RentNFTModal";
import OfferNFTModal from "../OfferNFTModal/OfferNFTModal";
import { formatPrice, formatPriceVND } from "../../utils/priceUtils";
import "./PropertyDetailModal.css";

const PropertyDetailModal = ({ property, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerType, setOfferType] = useState("buy");

  if (!property) return null;

  // Support both marketplace listing and property data structures
  const images =
    property.propertyImages || property.images || property.media?.images || [];

  const currentImage =
    images[selectedImageIndex]?.url ||
    images[selectedImageIndex] ||
    "https://via.placeholder.com/800x600?text=No+Image";

  const formatPriceDisplay = (price) => {
    if (!price) return "N/A";

    // Sử dụng hàm chuẩn từ priceUtils
    if (typeof price === "object" && price.amount && price.currency === "ETH") {
      // Blockchain price (Wei)
      return {
        vnd: formatPriceVND(price),
        eth: formatPrice(price, "ETH"),
      };
    } else {
      // Traditional VND price
      return {
        vnd: formatPriceVND(price),
        eth: "N/A",
      };
    }
  };

  // Xác định loại action button
  const getPropertyInfo = () => {
    // Check if có giá blockchain (đã list trên marketplace)
    const hasBlockchainPrice =
      property.blockchainPrice ||
      (property.price &&
        (property.price.currency === "ETH" || property.price.amount)) ||
      property.listingId !== undefined; // Nếu có listingId thì đã list

    // Check listing type từ DB - default là sale nếu không có
    const listingType = property.listingType || property.type || "sale";

    return {
      hasBlockchainPrice,
      listingType,
      hasNFT: !!(property.tokenId || property.nft?.tokenId),
    };
  };

  const propertyInfo = getPropertyInfo();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBuyAction = () => {
    if (propertyInfo.hasBlockchainPrice && propertyInfo.hasNFT) {
      setShowBuyModal(true);
    } else {
      setOfferType("buy");
      setShowOfferModal(true);
    }
  };

  const handleRentAction = () => {
    if (propertyInfo.hasBlockchainPrice && propertyInfo.hasNFT) {
      setShowRentModal(true);
    } else {
      setOfferType("rent");
      setShowOfferModal(true);
    }
  };

  const propertyDetails = property.details || {};
  const propertyAddress =
    property.propertyAddress || property.address || property.location || {};

  // Get property name from various possible fields
  const propertyName =
    property.propertyName ||
    property.title ||
    property.name ||
    "Chi tiết bất động sản";

  return (
    <>
      <div
        className="property-detail-modal-overlay"
        onClick={handleOverlayClick}
      >
        <div className="property-detail-modal">
          {/* Header */}
          <div className="modal-header">
            <h2>{propertyName}</h2>
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
              {(property.tokenId !== undefined ||
                property.nft?.tokenId !== undefined) && (
                <span className="badge nft">
                  🎨 NFT #{property.tokenId ?? property.nft?.tokenId}
                </span>
              )}
              {(property.listingId !== undefined ||
                property.listingId === 0) && (
                <span className="badge verified">⚡ Listed on Blockchain</span>
              )}
              {property.verificationStatus === "verified" && (
                <span className="badge verified">✅ Đã xác minh</span>
              )}
            </div>

            {/* Price */}
            <div className="price-section">
              <div className="price-label">💰 Giá bán</div>
              <div className="price-value">
                {formatPriceDisplay(property.price).vnd}
              </div>
              <div className="price-eth">
                ≈ {formatPriceDisplay(property.price).eth}
              </div>
              <p
                style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}
              >
                ℹ️ Giao dịch trực tiếp trên blockchain bằng ETH
              </p>
            </div>

            {/* Property Info Grid */}
            <div className="property-info-grid">
              <div className="info-card">
                <div className="info-label">📏 Diện tích</div>
                <div className="info-value">
                  {property.propertyArea ||
                    property.area ||
                    propertyDetails.area ||
                    "N/A"}{" "}
                  m²
                </div>
              </div>

              <div className="info-card">
                <div className="info-label">🛏️ Phòng ngủ</div>
                <div className="info-value">
                  {property.propertyBedrooms ||
                    property.bedrooms ||
                    propertyDetails.bedrooms ||
                    "N/A"}
                </div>
              </div>

              <div className="info-card">
                <div className="info-label">🚿 Phòng tắm</div>
                <div className="info-value">
                  {property.propertyBathrooms ||
                    property.bathrooms ||
                    propertyDetails.bathrooms ||
                    "N/A"}
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
            {(property.propertyDescription || property.description) && (
              <div className="description-section">
                <h3>📝 Mô tả</h3>
                <p className="description-text">
                  {property.propertyDescription || property.description}
                </p>
              </div>
            )}

            {/* Address */}
            <div className="description-section">
              <h3>📍 Địa chỉ</h3>
              <p className="description-text">
                {propertyAddress.street || propertyAddress.address || ""}
                {(propertyAddress.street || propertyAddress.address) && ", "}
                {propertyAddress.ward && `${propertyAddress.ward}, `}
                {propertyAddress.district}
                {propertyAddress.district && ", "}
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

          {/* Action Buttons - Thông minh */}
          <div className="action-buttons">
            {propertyInfo.listingType === "sale" ||
            !propertyInfo.listingType ? (
              // Nút mua
              <button
                className="btn-action btn-buy"
                onClick={handleBuyAction}
                style={{
                  background: propertyInfo.hasBlockchainPrice
                    ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                    : "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
              >
                {propertyInfo.hasBlockchainPrice
                  ? "🛒 Mua Ngay"
                  : "💰 Gửi Đề Nghị Mua"}
              </button>
            ) : (
              // Nút thuê
              <button
                className="btn-action btn-rent"
                onClick={handleRentAction}
                style={{
                  background: propertyInfo.hasBlockchainPrice
                    ? "linear-gradient(135deg, #10b981, #047857)"
                    : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                }}
              >
                {propertyInfo.hasBlockchainPrice
                  ? "🏠 Thuê Ngay"
                  : "📅 Đề Nghị Thuê"}
              </button>
            )}

            {/* Nếu là dual listing thì hiện cả 2 nút */}
            {(!propertyInfo.listingType ||
              propertyInfo.listingType === "both") && (
              <button
                className="btn-action btn-rent"
                onClick={handleRentAction}
                style={{
                  background: propertyInfo.hasBlockchainPrice
                    ? "linear-gradient(135deg, #10b981, #047857)"
                    : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                }}
              >
                {propertyInfo.hasBlockchainPrice
                  ? "🏠 Thuê Ngay"
                  : "📅 Đề Nghị Thuê"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && propertyInfo.hasNFT && (
        <BuyNFTModal
          listing={{
            listingId: property.listingId,
            tokenId: property.tokenId || property.nft?.tokenId,
            name: property.propertyName || property.title || property.name,
            price: property.price,
            status: property.status,
            images: images,
            // Truyền toàn bộ property để BuyNFTModal có đủ thông tin
            ...property,
          }}
          onClose={() => setShowBuyModal(false)}
        />
      )}

      {/* Rent Modal */}
      {showRentModal && propertyInfo.hasNFT && (
        <RentNFTModal
          listing={{
            listingId: property.listingId,
            tokenId: property.tokenId || property.nft?.tokenId,
            name: property.propertyName || property.title || property.name,
            pricePerDay: property.rentalPrice
              ? property.rentalPrice / 30
              : ((property.price?.amount || property.price || 0) * 0.045) / 365,
            price: property.price,
            status: property.status,
            images: images,
            // Truyền toàn bộ property
            ...property,
          }}
          onClose={() => setShowRentModal(false)}
        />
      )}

      {/* Offer Modal - Cho property chưa list hoặc chưa có giá cố định */}
      {showOfferModal && (
        <OfferNFTModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          property={property}
          type={offerType}
        />
      )}
    </>
  );
};

export default PropertyDetailModal;
