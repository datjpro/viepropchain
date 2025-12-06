import React, { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { useAuth } from "../../contexts/AuthContext";
import web3Service from "../../services/web3Service";
import LoadingSpinner from "../LoadingSpinner";
import "./BuyNFTModal.css";

const BuyNFTModal = ({ listing, nft, onClose, onSuccess }) => {
  const { web3Api, account } = useWeb3();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Confirm, 2: Processing, 3: Success
  const [transactionHash, setTransactionHash] = useState("");

  // Xử lý cả 2 trường hợp: listing (từ Marketplace) hoặc nft (từ PropertyDetailModal)
  const data = listing || nft || {};

  // Tính giá (NFT đã list trên blockchain, giá đang là Wei)
  const price =
    typeof data.price === "object"
      ? parseFloat(data.price.amount)
      : parseFloat(data.price) || 0;

  const priceInETH = price / 1e18; // Wei to ETH: chia 10^18

  const handleBuyNFT = async () => {
    // Kiểm tra user đã kết nối ví chưa
    if (!account) {
      setError("⚠️ Vui lòng kết nối ví MetaMask để mua NFT!");
      return;
    }

    // Kiểm tra có listingId không (NFT phải được list trên blockchain)
    if (!data.listingId && data.listingId !== 0) {
      setError("❌ NFT này chưa được list trên marketplace!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep(2);

      console.log("🛒 Buying NFT from blockchain...", {
        listingId: data.listingId,
        priceInETH,
        account,
      });

      // Gọi buyNFT function từ smart contract Marketplace
      const result = await web3Service.buyNFT(
        web3Api.web3,
        account,
        data.listingId,
        priceInETH
      );

      console.log("✅ Buy NFT success:", result);
      setTransactionHash(result.transactionHash);
      setStep(3);

      // Gọi callback sau 2s
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 2000);
    } catch (err) {
      console.error("❌ Buy NFT error:", err);
      setError(err.error || err.message || "Giao dịch thất bại");
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
                  data.propertyImages?.[0] ||
                  data.media?.images?.[0]?.url ||
                  data.images?.[0] ||
                  data.image ||
                  "https://via.placeholder.com/400x300"
                }
                alt={data.propertyName || data.name || data.title}
                className="buy-nft-image"
              />
              <h3 className="buy-nft-title">
                {data.propertyName || data.name || data.title || "Property NFT"}
              </h3>
              <p className="buy-nft-location">
                📍{" "}
                {data.propertyAddress?.district ||
                  data.location?.district ||
                  data.address?.district}
                ,{" "}
                {data.propertyAddress?.city ||
                  data.location?.city ||
                  data.address?.city ||
                  "TP.HCM"}
              </p>
            </div>

            {/* Price Summary */}
            <div className="price-summary">
              <div className="price-row">
                <span>💎 Giá NFT:</span>
                <strong style={{ fontSize: "20px", color: "#10b981" }}>
                  {priceInETH.toFixed(4)} ETH
                </strong>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginTop: "10px",
                }}
              >
                ℹ️ Giao dịch được thực hiện trực tiếp trên blockchain, không qua
                trung gian
              </p>
            </div>

            {/* Seller Info */}
            <div className="buy-nft-seller">
              <p style={{ marginBottom: "5px" }}>
                <strong>💼 Người bán:</strong>
              </p>
              <p
                className="seller-address"
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  wordBreak: "break-all",
                }}
              >
                {data.seller?.walletAddress ||
                  data.ownerWallet ||
                  data.blockchain?.seller ||
                  "Unknown"}
              </p>
            </div>

            {/* Wallet Connection Warning */}
            {!account && (
              <div
                style={{
                  background: "#fef3c7",
                  border: "2px solid #fbbf24",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <p style={{ margin: 0, color: "#92400e" }}>
                  ⚠️ <strong>Vui lòng kết nối ví MetaMask</strong> để mua NFT
                  này
                </p>
              </div>
            )}

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
                onClick={handleBuyNFT}
                className="btn-buy"
                disabled={loading || !account}
              >
                {loading
                  ? "Đang xử lý..."
                  : !account
                  ? "Kết nối ví để mua"
                  : "🛒 Xác nhận mua"}
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
            <h2>Mua NFT thành công!</h2>

            <div className="order-info">
              <div className="order-info-row">
                <span className="order-info-label">Transaction Hash:</span>
                <span className="order-info-value order-id">
                  {transactionHash || "Đang xử lý..."}
                </span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Giá thanh toán:</span>
                <span className="order-info-value">
                  <strong style={{ color: "#10b981" }}>
                    {priceInETH.toFixed(4)} ETH
                  </strong>
                </span>
              </div>
            </div>

            <div className="success-message">
              <p className="status-crypto">
                ✅ Giao dịch đã được xác nhận trên blockchain
              </p>
              <p>NFT đã được chuyển vào ví của bạn.</p>
              <p>Bạn có thể kiểm tra trong mục "My NFTs".</p>
            </div>

            <button onClick={onClose} className="btn-close-success">
              Đóng
            </button>
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
