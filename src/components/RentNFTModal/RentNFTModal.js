import React, { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import web3Service from "../../services/web3Service";
import marketplaceService from "../../services/marketplaceService";
import { formatPrice } from "../../utils/priceUtils";
import LoadingSpinner from "../LoadingSpinner";
import "./RentNFTModal.css";

const RentNFTModal = ({ listing, onClose, onSuccess }) => {
  const { web3Api, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [rentalDays, setRentalDays] = useState(30); // Mặc định 30 ngày

  // Tính giá thuê dựa trên số ngày
  const calculateRentalPrice = () => {
    const pricePerDay =
      typeof listing.pricePerDay === "object"
        ? parseFloat(listing.pricePerDay.amount)
        : parseFloat(listing.pricePerDay || 0);

    return pricePerDay * rentalDays;
  };

  const handleRent = async () => {
    if (!account) {
      setError("Vui lòng kết nối MetaMask");
      return;
    }

    if (!listing.blockchain?.auctionId && !listing.blockchain?.listingId) {
      setError("Listing này chưa có trên blockchain");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep(2);

      // Đối với rental, có thể dùng Auction contract hoặc custom logic
      // Tạm thời giả sử sử dụng placeBid trên Auction contract
      console.log("🏠 Renting NFT...");

      const rentalPrice = calculateRentalPrice();
      const rentalPriceInEth = rentalPrice / 1e18;

      // Nếu có auctionId, dùng placeBid
      if (listing.blockchain?.auctionId) {
        const txResult = await web3Service.placeBid(
          web3Api.web3,
          account,
          listing.blockchain.auctionId,
          rentalPriceInEth
        );

        if (!txResult.success) {
          throw new Error(txResult.error || "Giao dịch thất bại");
        }

        console.log("✅ Bid placed successfully");

        // Cập nhật database
        await marketplaceService.updateListing(listing._id, {
          status: "rented",
          transactionHash: txResult.transactionHash,
          rentedAt: new Date().toISOString(),
          rentedBy: account,
          rentalDuration: rentalDays,
        });
      } else {
        // Nếu không có auction, tạo rental transaction trực tiếp
        throw new Error(
          "Rental auction chưa được tạo cho NFT này. Vui lòng liên hệ chủ sở hữu."
        );
      }

      setStep(3);
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("❌ Rent error:", err);
      setError(err.message || "Có lỗi xảy ra khi thuê NFT");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            {/* NFT Preview */}
            <div className="rent-nft-preview">
              <img
                src={
                  listing.media?.images?.[0]?.url ||
                  listing.images?.[0] ||
                  "https://via.placeholder.com/400x300"
                }
                alt={listing.name || listing.title}
                className="rent-nft-image"
              />
              <h3 className="rent-nft-title">
                {listing.name || listing.title || "Property NFT"}
              </h3>
              <p className="rent-nft-location">
                📍 {listing.location?.district || listing.address?.district},{" "}
                {listing.location?.city || listing.address?.city || "TP.HCM"}
              </p>
            </div>

            {/* Rental Duration */}
            <div className="rent-duration">
              <label>
                <strong>Thời gian thuê:</strong>
              </label>
              <div className="duration-selector">
                <button
                  onClick={() => setRentalDays(7)}
                  className={rentalDays === 7 ? "active" : ""}
                >
                  7 ngày
                </button>
                <button
                  onClick={() => setRentalDays(30)}
                  className={rentalDays === 30 ? "active" : ""}
                >
                  30 ngày
                </button>
                <button
                  onClick={() => setRentalDays(90)}
                  className={rentalDays === 90 ? "active" : ""}
                >
                  90 ngày
                </button>
                <button
                  onClick={() => setRentalDays(180)}
                  className={rentalDays === 180 ? "active" : ""}
                >
                  180 ngày
                </button>
              </div>
              <input
                type="number"
                min="1"
                max="365"
                value={rentalDays}
                onChange={(e) =>
                  setRentalDays(
                    Math.max(1, Math.min(365, parseInt(e.target.value) || 1))
                  )
                }
                className="custom-days-input"
                placeholder="Hoặc nhập số ngày"
              />
            </div>

            {/* Price Details */}
            <div className="rent-nft-details">
              <div className="rent-detail-row">
                <span>Giá mỗi ngày:</span>
                <strong>{formatPrice(listing.pricePerDay)}</strong>
              </div>
              <div className="rent-detail-row">
                <span>Số ngày thuê:</span>
                <span>{rentalDays} ngày</span>
              </div>
              <div className="rent-detail-row">
                <span>Phí marketplace (2%):</span>
                <span>
                  {formatPrice((calculateRentalPrice() * 0.02).toString())}
                </span>
              </div>
              <div className="rent-detail-row rent-total">
                <span>Tổng thanh toán:</span>
                <strong>
                  {formatPrice((calculateRentalPrice() * 1.02).toString())}
                </strong>
              </div>
            </div>

            {/* Owner Info */}
            <div className="rent-nft-owner">
              <p>
                <strong>Chủ sở hữu:</strong>
              </p>
              <p className="owner-address">
                {listing.seller?.walletAddress ||
                  listing.blockchain?.seller ||
                  "Unknown"}
              </p>
            </div>

            {error && <div className="rent-error">❌ {error}</div>}

            {/* Actions */}
            <div className="rent-actions">
              <button
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleRent}
                className="btn-rent"
                disabled={loading || !account}
              >
                {loading ? "Đang xử lý..." : "Xác nhận thuê"}
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <div className="rent-processing">
            <LoadingSpinner />
            <h3>Đang xử lý giao dịch...</h3>
            <p>Vui lòng xác nhận giao dịch trên MetaMask</p>
            <p className="processing-note">
              ⚠️ Không đóng cửa sổ này cho đến khi hoàn tất
            </p>
          </div>
        );

      case 3:
        return (
          <div className="rent-success">
            <div className="success-icon">✅</div>
            <h3>Thuê thành công!</h3>
            <p>Bạn đã thuê NFT trong {rentalDays} ngày</p>
            <p className="success-note">
              Quyền sử dụng NFT đã được cấp cho ví của bạn
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rent-nft-modal-overlay" onClick={onClose}>
      <div className="rent-nft-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">🏠 Thuê NFT</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default RentNFTModal;
