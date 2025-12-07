import React, { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { useAuth } from "../../contexts/AuthContext";
import web3Service from "../../services/web3Service";
import { API_ENDPOINTS } from "../../config/api";
import { CONTRACTS } from "../../config/contracts";
import LoadingSpinner from "../LoadingSpinner";
import "./BuyNFTModal.css";

const BuyNFTModal = ({ data, listing, nft, onClose, onSuccess }) => {
  const { web3Api, account } = useWeb3();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Confirm, 2: Processing, 3: Success
  const [transactionHash, setTransactionHash] = useState("");

  // Xử lý cả 3 trường hợp: data (unified), listing (từ Marketplace), hoặc nft (từ PropertyDetailModal)
  const itemData = data || listing || nft || {};

  // Lấy token từ AuthContext hoặc localStorage
  const getAuthToken = () => {
    if (token) return token;
    return localStorage.getItem("viepropchain_token");
  };

  console.log("🛒 BuyNFTModal received data:", itemData);

  // Tính giá (NFT đã list trên blockchain, giá đang là Wei)
  const price =
    typeof itemData.price === "object"
      ? parseFloat(itemData.price.amount)
      : parseFloat(itemData.price) || 0;

  const priceInETH = price / 1e18; // Wei to ETH

  const handleBuyNFT = async () => {
    if (!account) {
      setError("⚠️ Vui lòng kết nối ví MetaMask để mua NFT!");
      return;
    }

    if (!web3Api.web3) {
      setError("⚠️ Web3 chưa được khởi tạo!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep(2);

      console.log("💰 Buying NFT directly via smart contract...", {
        tokenId: itemData.tokenId,
        seller: itemData.seller?.walletAddress,
        priceInETH,
        priceInWei: price,
        buyer: account,
      });

      // ========================================================================
      // OFF-CHAIN LISTING MODEL:
      // Frontend gọi trực tiếp smart contract buyItemDirect()
      // Không cần listingId on-chain, chỉ cần tokenId + seller address từ DB
      // ========================================================================

      const marketplaceContract = new web3Api.web3.eth.Contract(
        CONTRACTS.abis.Marketplace,
        CONTRACTS.addresses.Marketplace
      );

      console.log("📝 Calling Marketplace.buyItemDirect()...");
      console.log("   TokenId:", itemData.tokenId);
      console.log("   Seller:", itemData.seller?.walletAddress);
      console.log("   Sending:", priceInETH, "ETH");

      // Gọi buyItemDirect(tokenId, sellerAddress) với ETH payment
      const tx = await marketplaceContract.methods
        .buyItemDirect(itemData.tokenId, itemData.seller?.walletAddress)
        .send({
          from: account,
          value: price.toString(),
        });

      console.log("✅ Blockchain transaction successful!");
      console.log("   TX Hash:", tx.transactionHash);
      console.log("   Block:", tx.blockNumber);

      setTransactionHash(tx.transactionHash);

      // Gọi backend để cập nhật database (status = sold)
      try {
        const authToken = getAuthToken();
        await fetch(`${API_ENDPOINTS.MARKETPLACE.BASE}/orders/finalize-sale`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            listingId: itemData._id, // MongoDB listing ID
            tokenId: itemData.tokenId,
            transactionHash: tx.transactionHash,
            blockNumber: tx.blockNumber,
            buyer: account,
          }),
        });
        console.log("✅ Database updated");
      } catch (dbError) {
        console.warn("⚠️ Database update failed:", dbError);
        // Không fail transaction vì blockchain đã thành công
      }

      setStep(3);

      // Gọi callback sau 2s
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 2000);
    } catch (err) {
      console.error("❌ Buy NFT error:", err);
      setError(err.message || "Giao dịch thất bại");
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
                  itemData.propertyImages?.[0] ||
                  itemData.media?.images?.[0]?.url ||
                  itemData.images?.[0] ||
                  itemData.image ||
                  "https://via.placeholder.com/400x300"
                }
                alt={itemData.propertyName || itemData.name || itemData.title}
                className="buy-nft-image"
              />
              <h3 className="buy-nft-title">
                {itemData.propertyName ||
                  itemData.name ||
                  itemData.title ||
                  "Property NFT"}
              </h3>
              <p className="buy-nft-location">
                📍{" "}
                {itemData.propertyAddress?.district ||
                  itemData.location?.district ||
                  itemData.address?.district}
                ,{" "}
                {itemData.propertyAddress?.city ||
                  itemData.location?.city ||
                  itemData.address?.city ||
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
