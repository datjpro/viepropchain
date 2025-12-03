import React, { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import web3Service from "../../services/web3Service";
import marketplaceService from "../../services/marketplaceService";
import { formatPrice } from "../../utils/priceUtils";
import LoadingSpinner from "../LoadingSpinner";
import "./BuyNFTModal.css";

const BuyNFTModal = ({ listing, onClose, onSuccess }) => {
  const { web3Api, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Confirm, 2: Processing, 3: Success

  const handleBuy = async () => {
    if (!account) {
      setError("Vui lòng kết nối MetaMask");
      return;
    }

    if (!listing.blockchain?.listingId) {
      setError("Listing này chưa có trên blockchain");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep(2);

      // Step 1: Gọi smart contract để mua NFT
      console.log("🛒 Calling smart contract buyItem...");
      const priceInEth =
        typeof listing.price === "object"
          ? parseFloat(listing.price.amount) / 1e18
          : parseFloat(listing.price) / 1e18;

      const txResult = await web3Service.buyNFT(
        web3Api.web3,
        account,
        listing.blockchain.listingId,
        priceInEth
      );

      if (!txResult.success) {
        throw new Error(txResult.error || "Giao dịch thất bại");
      }

      console.log("✅ Blockchain transaction successful");

      // Step 2: Cập nhật database thông qua backend
      console.log("💾 Updating database...");
      await marketplaceService.updateListing(listing._id, {
        status: "sold",
        transactionHash: txResult.transactionHash,
        soldAt: new Date().toISOString(),
        buyer: account,
      });

      setStep(3);
      setTimeout(() => {
        onSuccess && onSuccess(txResult);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("❌ Buy error:", err);
      setError(err.message || "Có lỗi xảy ra khi mua NFT");
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
            <div className="buy-nft-preview">
              <img
                src={
                  listing.media?.images?.[0]?.url ||
                  listing.images?.[0] ||
                  "https://via.placeholder.com/400x300"
                }
                alt={listing.name || listing.title}
                className="buy-nft-image"
              />
              <h3 className="buy-nft-title">
                {listing.name || listing.title || "Property NFT"}
              </h3>
              <p className="buy-nft-location">
                📍 {listing.location?.district || listing.address?.district},{" "}
                {listing.location?.city || listing.address?.city || "TP.HCM"}
              </p>
            </div>

            {/* Price Details */}
            <div className="buy-nft-details">
              <div className="buy-detail-row">
                <span>Giá niêm yết:</span>
                <strong>{formatPrice(listing.price)}</strong>
              </div>
              <div className="buy-detail-row">
                <span>Phí marketplace (2%):</span>
                <span>
                  {formatPrice(
                    typeof listing.price === "object"
                      ? (parseFloat(listing.price.amount) * 0.02).toString()
                      : (parseFloat(listing.price) * 0.02).toString()
                  )}
                </span>
              </div>
              <div className="buy-detail-row buy-total">
                <span>Tổng thanh toán:</span>
                <strong>
                  {formatPrice(
                    typeof listing.price === "object"
                      ? (parseFloat(listing.price.amount) * 1.02).toString()
                      : (parseFloat(listing.price) * 1.02).toString()
                  )}
                </strong>
              </div>
            </div>

            {/* Seller Info */}
            <div className="buy-nft-seller">
              <p>
                <strong>Người bán:</strong>
              </p>
              <p className="seller-address">
                {listing.seller?.walletAddress ||
                  listing.blockchain?.seller ||
                  "Unknown"}
              </p>
            </div>

            {error && <div className="buy-error">❌ {error}</div>}

            {/* Actions */}
            <div className="buy-actions">
              <button
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleBuy}
                className="btn-buy"
                disabled={loading || !account}
              >
                {loading ? "Đang xử lý..." : "Xác nhận mua"}
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <div className="buy-processing">
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
          <div className="buy-success">
            <div className="success-icon">✅</div>
            <h3>Mua thành công!</h3>
            <p>NFT đã được chuyển vào ví của bạn</p>
            <p className="success-note">
              Bạn có thể xem NFT trong mục "My NFTs"
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="buy-nft-modal-overlay" onClick={onClose}>
      <div className="buy-nft-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">🛒 Mua NFT</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default BuyNFTModal;
