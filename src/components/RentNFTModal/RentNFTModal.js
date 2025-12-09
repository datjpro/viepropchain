import React, { useState } from "react";
import { useWeb3 } from "../../contexts/GanacheWeb3Context";
import { useAuth } from "../../contexts/AuthContext";
import web3Service from "../../services/web3Service";
import LoadingSpinner from "../LoadingSpinner";
import "./RentNFTModal.css";

const RentNFTModal = ({ listing, nft, onClose, onSuccess }) => {
  const { web3Api, account } = useWeb3();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Chọn thời gian, 2: Processing, 3: Success

  // Form data
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [transactionHash, setTransactionHash] = useState("");

  // Xử lý cả 2 trường hợp: listing (từ Marketplace) hoặc nft (từ PropertyDetailModal)
  const data = listing || nft || {};

  // Tính giá thuê dựa trên số ngày
  const calculateRentalPrice = () => {
    let pricePerDay = 0;
    let propertyValue = 0;

    // Lấy giá trị BĐS
    if (data.price) {
      propertyValue =
        typeof data.price === "object"
          ? parseFloat(data.price.amount || 0)
          : parseFloat(data.price || 0);
    }

    if (data.rentalDetails?.monthlyRent) {
      // Từ rentalDetails (Admin Marketplace) - là giá/tháng, chia 30
      pricePerDay = parseFloat(data.rentalDetails.monthlyRent) / 30;
    } else if (data.pricePerDay) {
      // pricePerDay ĐÃ LÀ GIÁ/NGÀY
      pricePerDay =
        typeof data.pricePerDay === "object"
          ? parseFloat(data.pricePerDay.amount || 0)
          : parseFloat(data.pricePerDay || 0);
    } else if (data.rentalPrice) {
      // rentalPrice thường là giá/tháng, chia 30
      pricePerDay = parseFloat(data.rentalPrice || 0) / 30;
    } else if (propertyValue > 0) {
      // Fallback: Tính từ giá trị BĐS với lợi suất 4.5%/năm
      const monthlyRent = (propertyValue * 0.045) / 12;
      pricePerDay = monthlyRent / 30;
    }

    // Tính theo số ngày thuê
    return pricePerDay * durationDays;
  };

  const rentalPrice = calculateRentalPrice();
  const rentalPriceETH = rentalPrice / 1e18; // Wei to ETH

  const handleRentNFT = async () => {
    // Kiểm tra user đã kết nối ví chưa
    if (!account) {
      setError("⚠️ Vui lòng kết nối ví MetaMask để thuê NFT!");
      return;
    }

    if (!startDate) {
      setError("Vui lòng chọn ngày bắt đầu");
      return;
    }

    if (durationDays < 1) {
      setError("Thời gian thuê tối thiểu 1 ngày");
      return;
    }

    // Kiểm tra có tokenId không
    if (!data.tokenId && data.tokenId !== 0) {
      setError("❌ NFT này chưa có tokenId!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep(2);

      console.log("🏠 Renting NFT...", {
        tokenId: data.tokenId,
        renterAddress: account,
        durationDays,
        rentalPriceETH,
      });

      // Bước 1: Gửi ETH payment cho người cho thuê (seller/owner)
      const ownerAddress = data.seller?.walletAddress || data.ownerWallet;
      if (!ownerAddress) {
        throw new Error("Không tìm thấy địa chỉ người cho thuê");
      }

      const paymentTx = await web3Api.web3.eth.sendTransaction({
        from: account,
        to: ownerAddress,
        value: web3Api.web3.utils.toWei(rentalPriceETH.toString(), "ether"),
      });

      console.log("✅ Payment sent:", paymentTx.transactionHash);

      // Bước 2: Gọi setUser trên smart contract (owner phải approve trước)
      // Lưu ý: Owner cần gọi hàm này, không phải renter
      // Nên cần backend hoặc owner tự gọi sau khi nhận payment
      // Tạm thời để renter tự gọi (nếu được approve)

      const result = await web3Service.rentNFT(
        web3Api.web3,
        ownerAddress, // Owner address (cần owner signature)
        data.tokenId,
        account, // Renter address
        durationDays
      );

      console.log("✅ Rent NFT success:", result);
      setTransactionHash(result.transactionHash);
      setStep(3);

      // Gọi callback sau 2s
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 2000);
    } catch (err) {
      console.error("❌ Rent NFT error:", err);
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
            <div className="rent-nft-preview">
              <img
                src={
                  data.propertyImages?.[0] ||
                  data.media?.images?.[0]?.url ||
                  data.images?.[0] ||
                  data.image ||
                  "https://via.placeholder.com/400x300"
                }
                alt={data.propertyName || data.name || data.title}
                className="rent-nft-image"
              />
              <h3 className="rent-nft-title">
                {data.propertyName || data.name || data.title || "Property NFT"}
              </h3>
              <p className="rent-nft-location">
                📍{" "}
                {data.propertyAddress?.district ||
                  data.location?.district ||
                  data.address?.district ||
                  ""}
                {data.propertyAddress?.city ||
                data.location?.city ||
                data.address?.city
                  ? ", " +
                    (data.propertyAddress?.city ||
                      data.location?.city ||
                      data.address?.city)
                  : ""}
              </p>
            </div>

            {/* Ngày bắt đầu */}
            <div className="form-group">
              <label>
                <strong>📅 Ngày bắt đầu thuê:</strong>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="date-input"
              />
            </div>

            {/* Thời gian thuê */}
            <div className="form-group">
              <label>
                <strong>⏱️ Thời gian thuê:</strong>
              </label>
              <div className="duration-selector">
                <button
                  onClick={() => setDurationDays(7)}
                  className={durationDays === 7 ? "active" : ""}
                  type="button"
                >
                  7 ngày
                </button>
                <button
                  onClick={() => setDurationDays(30)}
                  className={durationDays === 30 ? "active" : ""}
                  type="button"
                >
                  1 tháng
                </button>
                <button
                  onClick={() => setDurationDays(90)}
                  className={durationDays === 90 ? "active" : ""}
                  type="button"
                >
                  3 tháng
                </button>
                <button
                  onClick={() => setDurationDays(180)}
                  className={durationDays === 180 ? "active" : ""}
                  type="button"
                >
                  6 tháng
                </button>
              </div>
              <input
                type="number"
                value={durationDays}
                onChange={(e) =>
                  setDurationDays(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="custom-duration"
                placeholder="Hoặc nhập số ngày"
                min="1"
              />
            </div>

            {/* Tổng tiền */}
            <div className="price-summary">
              <div className="price-row">
                <span>💎 Giá thuê ({durationDays} ngày):</span>
                <strong style={{ color: "#10b981", fontSize: "18px" }}>
                  {rentalPriceETH.toFixed(4)} ETH
                </strong>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginTop: "10px",
                }}
              >
                ℹ️ Giao dịch được thực hiện trực tiếp trên blockchain
              </p>
            </div>

            {/* Owner Info */}
            <div className="rent-nft-owner">
              <p>
                <strong>Người cho thuê:</strong>
              </p>
              <p className="owner-address">
                {data.seller?.walletAddress || data.ownerWallet || "Unknown"}
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
                  ⚠️ <strong>Vui lòng kết nối ví MetaMask</strong> để thuê NFT
                  này
                </p>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleRentNFT}
                className="btn-rent"
                disabled={loading || !account}
              >
                {loading
                  ? "Đang xử lý..."
                  : !account
                  ? "Kết nối ví để thuê"
                  : "🏠 Xác nhận thuê"}
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
            <h2>Thuê NFT thành công!</h2>

            <div className="order-info">
              <div className="order-info-row">
                <span className="order-info-label">Transaction Hash:</span>
                <span className="order-info-value order-id">
                  {transactionHash || "Đang xử lý..."}
                </span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Thời gian thuê:</span>
                <span className="order-info-value">{durationDays} ngày</span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Giá thuê:</span>
                <span className="order-info-value" style={{ color: "#10b981" }}>
                  {rentalPriceETH.toFixed(4)} ETH
                </span>
              </div>
            </div>

            <div className="success-message">
              <p className="status-crypto">
                ✅ Giao dịch đã được xác nhận trên blockchain
              </p>
              <p>Bạn đã có quyền sử dụng NFT này trong {durationDays} ngày.</p>
              <p>Kiểm tra trong mục "My NFTs" để xem chi tiết.</p>
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
