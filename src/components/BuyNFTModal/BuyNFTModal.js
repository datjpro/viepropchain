import React, { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { useAuth } from "../../contexts/AuthContext";
import { API_GATEWAY_URL } from "../../config/api";
import web3Service from "../../services/web3Service";
import marketplaceService from "../../services/marketplaceService";
import { formatPrice } from "../../utils/priceUtils";
import LoadingSpinner from "../LoadingSpinner";
import "./BuyNFTModal.css";

const BuyNFTModal = ({ listing, nft, onClose, onSuccess }) => {
  const { web3Api, account } = useWeb3();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Chọn payment, 2: Processing, 3: Success
  const [paymentMethod, setPaymentMethod] = useState(""); // "bank_transfer" hoặc "crypto"
  const [orderId, setOrderId] = useState("");

  // Xử lý cả 2 trường hợp: listing (từ Marketplace) hoặc nft (từ PropertyDetailModal)
  const data = listing || nft || {};

  // Tính giá và phí
  const basePrice =
    typeof data.price === "object"
      ? parseFloat(data.price.amount)
      : parseFloat(data.price) || 0;

  // SALE FEE: Fiat 1%, Crypto 0.1%
  const platformFee =
    paymentMethod === "crypto" ? basePrice * 0.001 : basePrice * 0.01;
  const totalPrice = basePrice + platformFee;
  const totalPriceETH = totalPrice / 100000000; // 1 ETH ≈ 100M VND

  const handleBankTransfer = async () => {
    try {
      setLoading(true);
      setError("");
      setStep(2);

      const token = localStorage.getItem("viepropchain_token");
      const response = await fetch(
        `${API_GATEWAY_URL}/api/marketplace/orders/buy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-email": user?.email,
          },
          body: JSON.stringify({
            propertyId: data.propertyId || data._id,
            tokenId: data.tokenId,
            totalPrice: totalPrice,
            paymentMethod: "bank_transfer",
            buyerEmail: user?.email,
            sellerWallet: data.seller?.walletAddress || data.ownerWallet,
          }),
        }
      );

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || "Không thể tạo đơn mua");
      }

      setOrderId(responseData.data?.orderId || "");
      setStep(3);
    } catch (err) {
      console.error("❌ Bank transfer error:", err);
      setError(err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoPayment = async () => {
    // Kiểm tra user đã kết nối ví chưa
    if (!account) {
      setError(
        "⚠️ Vui lòng kết nối ví MetaMask trước khi thanh toán bằng ETH!"
      );
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep(2);

      console.log("💰 Sending ETH payment...", {
        tokenId: data.tokenId,
        amount: totalPriceETH,
      });

      // Bước 1: Gửi ETH đến ví Admin
      const adminWallet = "0x6c8c0796886c5e91f95ec04af7d06e6a7da0e7a8";

      const txResult = await web3Api.web3.eth.sendTransaction({
        from: account,
        to: adminWallet,
        value: web3Api.web3.utils.toWei(totalPriceETH.toString(), "ether"),
      });

      console.log("✅ ETH payment success:", txResult.transactionHash);

      // Bước 2: Gửi thông tin lên Backend để chuyển NFT
      const token = localStorage.getItem("viepropchain_token");
      const response = await fetch(
        `${API_GATEWAY_URL}/api/marketplace/orders/buy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-email": user?.email,
          },
          body: JSON.stringify({
            propertyId: data.propertyId || data._id,
            tokenId: data.tokenId,
            totalPrice: totalPrice,
            paymentMethod: "crypto",
            transactionHash: txResult.transactionHash,
            buyerEmail: user?.email,
            buyerWallet: account,
            sellerWallet: data.seller?.walletAddress || data.ownerWallet,
            // Backend sẽ dùng thông tin này để chuyển NFT
            transferParams: {
              tokenId: data.tokenId,
              from: data.seller?.walletAddress || data.ownerWallet,
              to: account,
            },
          }),
        }
      );

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || "Không thể tạo đơn mua");
      }

      console.log("✅ Backend processed, NFT transferred:", responseData);

      setOrderId(responseData.data?.orderId || txResult.transactionHash);
      setStep(3);
    } catch (err) {
      console.error("❌ Crypto payment error:", err);
      setError(err.message);
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
                <span>Giá bất động sản:</span>
                <strong>{(basePrice / 1000000).toFixed(2)} triệu VND</strong>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="payment-methods">
              {/* Bank Transfer */}
              <div
                className={`payment-option ${
                  paymentMethod === "bank_transfer" ? "selected" : ""
                }`}
                onClick={() => {
                  setError("");
                  setPaymentMethod("bank_transfer");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="payment-icon">🏦</div>
                <div className="payment-info">
                  <h4>Chuyển khoản Ngân hàng</h4>
                  <div className="fee-breakdown">
                    <p className="fee-item">
                      Giá: {(basePrice / 1000000).toFixed(2)}M VND
                    </p>
                    <p className="fee-item platform-fee-bank">
                      Phí Platform (1%):
                      <span className="fee-amount">
                        +{(platformFee / 1000000).toFixed(2)}M VND
                      </span>
                    </p>
                    <p className="fee-total">
                      Tổng thanh toán:
                      <strong>{(totalPrice / 1000000).toFixed(2)}M VND</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Crypto */}
              <div
                className={`payment-option crypto-option ${
                  paymentMethod === "crypto" ? "selected" : ""
                }`}
                onClick={() => {
                  if (!account) {
                    setError(
                      "⚠️ Vui lòng kết nối ví MetaMask trước khi chọn thanh toán bằng ETH!"
                    );
                    return;
                  }
                  setError("");
                  setPaymentMethod("crypto");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="savings-badge">💰 SIÊU ƯU ĐÃI 0.9%</div>
                <div className="payment-icon">💎</div>
                <div className="payment-info">
                  <h4>
                    Tiền điện tử (ETH)
                    {!account && (
                      <span
                        style={{
                          color: "#ef4444",
                          fontSize: "12px",
                          marginLeft: "8px",
                        }}
                      >
                        (Cần kết nối ví)
                      </span>
                    )}
                    {account && (
                      <span
                        style={{
                          color: "#10b981",
                          fontSize: "12px",
                          marginLeft: "8px",
                        }}
                      >
                        ✓ Đã kết nối
                      </span>
                    )}
                  </h4>
                  <div className="fee-breakdown">
                    <p className="fee-item">
                      Giá: {(basePrice / 1000000).toFixed(2)}M VND
                    </p>
                    <p className="fee-item platform-fee-crypto">
                      Phí Platform (0.1%):
                      <span className="fee-amount crypto">
                        +{(platformFee / 1000000).toFixed(2)}M VND
                      </span>
                    </p>
                    <p className="fee-savings">
                      ✨ Tiết kiệm:{" "}
                      <strong>
                        {((basePrice * 0.009) / 1000000).toFixed(2)}M VND
                      </strong>
                    </p>
                    <p className="fee-total">
                      Tổng thanh toán:
                      <strong>{(totalPrice / 1000000).toFixed(2)}M VND</strong>
                    </p>
                    <p className="eth-amount">
                      ≈ {totalPriceETH.toFixed(4)} ETH
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="buy-nft-seller">
              <p>
                <strong>Người bán:</strong>
              </p>
              <p className="seller-address">
                {data.seller?.walletAddress ||
                  data.ownerWallet ||
                  data.blockchain?.seller ||
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
                onClick={
                  paymentMethod === "bank_transfer"
                    ? handleBankTransfer
                    : handleCryptoPayment
                }
                className="btn-buy"
                disabled={loading || !paymentMethod}
              >
                {loading
                  ? "Đang xử lý..."
                  : paymentMethod
                  ? "Xác nhận mua"
                  : "Chọn phương thức thanh toán"}
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
            <h2>
              {paymentMethod === "crypto"
                ? "Thanh toán thành công!"
                : "Đơn hàng đã được tạo!"}
            </h2>

            <div className="order-info">
              <div className="order-info-row">
                <span className="order-info-label">Mã đơn hàng:</span>
                <span className="order-info-value order-id">
                  {orderId || "Đang xử lý..."}
                </span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Phương thức:</span>
                <span className="order-info-value payment-method-display">
                  {paymentMethod === "crypto"
                    ? "💎 Crypto (ETH)"
                    : "🏦 Chuyển khoản"}
                </span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Tổng thanh toán:</span>
                <span className="order-info-value">
                  {(totalPrice / 1000000).toFixed(2)}M VND
                  {paymentMethod === "crypto" && (
                    <span style={{ color: "#10b981", marginLeft: "8px" }}>
                      (≈ {totalPriceETH.toFixed(4)} ETH)
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="success-message">
              {paymentMethod === "crypto" ? (
                <>
                  <p className="status-crypto">
                    ✅ Giao dịch đã được xác nhận trên blockchain
                  </p>
                  <p>NFT sẽ được chuyển vào ví của bạn trong vài phút.</p>
                  <p>Bạn có thể kiểm tra trong mục "My NFTs".</p>
                </>
              ) : (
                <>
                  <p className="status-pending">
                    ⏳ Đơn hàng đang chờ xác nhận từ người bán
                  </p>
                  <p>
                    Người bán sẽ xem xét và phản hồi đơn hàng của bạn sớm nhất
                    có thể.
                  </p>
                  <p className="note">
                    ℹ️ Bạn sẽ nhận được thông báo qua email khi đơn hàng được xử
                    lý.
                  </p>
                </>
              )}
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
