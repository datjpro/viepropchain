import React, { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { useAuth } from "../../contexts/AuthContext";
import { API_GATEWAY_URL } from "../../config/api";
import LoadingSpinner from "../LoadingSpinner";
import "./RentNFTModal.css";

const RentNFTModal = ({ listing, nft, onClose, onSuccess }) => {
  const { web3Api, account } = useWeb3();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Chọn thời gian, 2: Chọn thanh toán, 3: Xử lý, 4: Success

  // Form data
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState(""); // "bank_transfer" hoặc "crypto"
  const [bankReceipt, setBankReceipt] = useState(null);
  const [orderId, setOrderId] = useState(""); // Lưu mã đơn hàng

  // Xử lý cả 2 trường hợp: listing (từ Marketplace) hoặc nft (từ PropertyDetailModal)
  const data = listing || nft || {};

  // Debug: Log data để kiểm tra
  console.log("🔍 RentNFTModal Data:", {
    listing,
    nft,
    data,
    price: data.price,
    pricePerDay: data.pricePerDay,
    rentalPrice: data.rentalPrice,
    rentalDetails: data.rentalDetails,
  });

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
      console.log(
        "📊 Source: rentalDetails.monthlyRent/30 =",
        pricePerDay,
        "/day"
      );
    } else if (data.pricePerDay) {
      // ⚠️ pricePerDay ĐÃ LÀ GIÁ/NGÀY, KHÔNG nhân 30!
      pricePerDay =
        typeof data.pricePerDay === "object"
          ? parseFloat(data.pricePerDay.amount || 0)
          : parseFloat(data.pricePerDay || 0);
      console.log("📊 Source: pricePerDay (already per day) =", pricePerDay);
    } else if (data.rentalPrice) {
      // rentalPrice thường là giá/tháng, chia 30
      pricePerDay = parseFloat(data.rentalPrice || 0) / 30;
      console.log("📊 Source: rentalPrice/30 =", pricePerDay, "/day");
    } else if (propertyValue > 0) {
      // Fallback: Tính từ giá trị BĐS với lợi suất 4.5%/năm
      const monthlyRent = (propertyValue * 0.045) / 12;
      pricePerDay = monthlyRent / 30;
      console.log(
        "📊 Source: Calculated from property value",
        propertyValue,
        "→",
        pricePerDay,
        "/day"
      );
    }

    // Tính theo số ngày thuê
    const totalPrice = pricePerDay * durationDays;
    console.log("💰 Final calculation:", {
      pricePerDay: pricePerDay.toFixed(2),
      durationDays,
      totalPrice: totalPrice.toFixed(2),
    });
    return totalPrice;
  };

  const basePrice = calculateRentalPrice();

  // Tính phí dịch vụ theo phương thức thanh toán (Utility-First Model)
  // Phải tính lại mỗi khi paymentMethod thay đổi
  const getPlatformFee = () => {
    return paymentMethod === "crypto" ? basePrice * 0.01 : basePrice * 0.1;
  };

  const platformFee = getPlatformFee();
  const totalPriceVND = basePrice + platformFee;
  const savingsVND = paymentMethod === "crypto" ? basePrice * 0.09 : 0;

  // Quy đổi sang ETH (1 ETH ≈ 100 triệu VND)
  const ETH_RATE = 100000000;
  const totalPriceETH = totalPriceVND / ETH_RATE;

  // Handle next to payment selection
  const handleSelectPayment = () => {
    if (!startDate) {
      setError("Vui lòng chọn ngày bắt đầu");
      return;
    }
    if (durationDays < 1) {
      setError("Thời gian thuê tối thiểu 1 ngày");
      return;
    }
    setError("");
    setStep(2);
  };

  // Handle bank transfer payment
  const handleBankTransfer = async () => {
    if (!bankReceipt) {
      setError("Vui lòng upload biên lai chuyển khoản");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep(3);

      const token = localStorage.getItem("viepropchain_token");
      const formData = new FormData();
      formData.append("propertyId", data.propertyId || data._id);
      formData.append("tokenId", data.tokenId);
      formData.append("startDate", startDate);
      formData.append("durationDays", durationDays);
      formData.append("totalPrice", totalPriceVND);
      formData.append("paymentMethod", "bank_transfer");
      formData.append("receipt", bankReceipt);
      formData.append("tenantEmail", user?.email);

      const response = await fetch(
        `${API_GATEWAY_URL}/api/marketplace/orders/rent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-email": user?.email,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Không thể tạo đơn thuê");
      }

      setOrderId(data.data.orderId || "N/A");
      setStep(4); // Chuyển sang màn hình Success

      // alert(
      //   `✅ Đã tạo đơn thuê thành công!\nMã đơn: ${data.data.orderId}\nAdmin sẽ xác nhận sau khi kiểm tra biên lai.`
      // );

      // setTimeout(() => {
      //   onSuccess && onSuccess();
      //   onClose();
      // }, 2000);
    } catch (err) {
      console.error("❌ Bank transfer error:", err);
      setError(err.message);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Handle crypto payment
  const handleCryptoPayment = async () => {
    if (!account) {
      setError("Vui lòng kết nối MetaMask trước");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep(3);

      const tokenId = data.tokenId;
      const rentalDuration = durationDays; // Số ngày thuê

      console.log("💰 Sending ETH payment...", {
        tokenId,
        amount: totalPriceETH,
        duration: rentalDuration,
      });

      // Bước 1: Gửi ETH đến ví Admin (Admin sẽ nhận tiền và gọi setUser từ backend)
      const adminWallet = "0x6c8C0796886C5e91f95eC04aF7d06E6a7DA0E7A8";

      const txResult = await web3Api.web3.eth.sendTransaction({
        from: account,
        to: adminWallet,
        value: web3Api.web3.utils.toWei(totalPriceETH.toString(), "ether"),
      });

      console.log("✅ ETH payment success:", txResult.transactionHash);

      // Bước 2: Gửi thông tin lên Backend để gọi setUser từ Admin wallet
      const token = localStorage.getItem("viepropchain_token");
      const response = await fetch(
        `${API_GATEWAY_URL}/api/marketplace/orders/rent`,
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
            startDate,
            durationDays,
            totalPrice: totalPriceVND,
            paymentMethod: "crypto",
            transactionHash: txResult.transactionHash,
            tenantEmail: user?.email,
            tenantWallet: account,
            // Backend sẽ dùng thông tin này để gọi smart contract setUser
            setUserParams: {
              tokenId: data.tokenId,
              userAddress: account,
              expiresInDays: rentalDuration,
            },
          }),
        }
      );

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || "Không thể tạo đơn thuê");
      }

      console.log("✅ Backend processed, setUser called:", responseData);

      setOrderId(responseData.data?.orderId || txResult.transactionHash);
      setStep(4); // Chuyển sang màn hình Success
    } catch (err) {
      console.error("❌ Crypto payment error:", err);
      setError(err.message);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File không được vượt quá 5MB");
        return;
      }
      setBankReceipt(file);
      setError("");
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        // Bước 1: Chọn thời gian thuê
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
                <span>Giá thuê ({durationDays} ngày):</span>
                <span className="price-value">
                  {(basePrice / 1000000).toFixed(2)} triệu VND
                </span>
              </div>
              <div className="price-info-note">
                <p>
                  💡 <strong>Lưu ý:</strong> Phí dịch vụ sẽ được tính ở bước
                  thanh toán
                </p>
                <ul>
                  <li>🏦 Chuyển khoản: +10% phí platform</li>
                  <li>
                    💎 Crypto (ETH): +1% phí platform{" "}
                    <span className="savings-highlight">(Tiết kiệm 9%!)</span>
                  </li>
                </ul>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button onClick={onClose} className="btn-cancel">
                Hủy
              </button>
              <button onClick={handleSelectPayment} className="btn-next">
                Tiếp tục →
              </button>
            </div>
          </>
        );

      case 2:
        // Bước 2: Chọn phương thức thanh toán
        return (
          <>
            <div className="payment-header">
              <h3>💳 Chọn phương thức thanh toán</h3>
              <div className="base-price-display">
                Giá thuê:{" "}
                <strong>{(basePrice / 1000000).toFixed(2)} triệu VND</strong>
              </div>
            </div>

            <div className="payment-methods">
              {/* Bank Transfer */}
              <div
                className={`payment-option ${
                  paymentMethod === "bank_transfer" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("bank_transfer")}
              >
                <div className="payment-icon">🏦</div>
                <div className="payment-info">
                  <h4>Chuyển khoản Ngân hàng</h4>
                  <div className="fee-breakdown">
                    <p className="fee-item">
                      Giá thuê: {(basePrice / 1000000).toFixed(2)}M VND
                    </p>
                    <p className="fee-item platform-fee-bank">
                      Phí Platform (10%):{" "}
                      <span className="fee-amount">
                        +{((basePrice * 0.1) / 1000000).toFixed(2)}M VND
                      </span>
                    </p>
                    <p className="fee-total">
                      Tổng thanh toán:{" "}
                      <strong>
                        {((basePrice * 1.1) / 1000000).toFixed(2)}M VND
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Crypto */}
              <div
                className={`payment-option crypto-option ${
                  paymentMethod === "crypto" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("crypto")}
              >
                <div className="savings-badge">💰 TIẾT KIỆM 9%</div>
                <div className="payment-icon">💎</div>
                <div className="payment-info">
                  <h4>Tiền điện tử (ETH)</h4>
                  <div className="fee-breakdown">
                    <p className="fee-item">
                      Giá thuê: {(basePrice / 1000000).toFixed(2)}M VND
                    </p>
                    <p className="fee-item platform-fee-crypto">
                      Phí Platform (1%):{" "}
                      <span className="fee-amount crypto">
                        +{((basePrice * 0.01) / 1000000).toFixed(2)}M VND
                      </span>
                    </p>
                    <p className="fee-savings">
                      ✨ Tiết kiệm so với chuyển khoản:{" "}
                      <strong className="highlight">
                        {((basePrice * 0.09) / 1000000).toFixed(2)}M VND
                      </strong>
                    </p>
                    <p className="fee-total">
                      Tổng thanh toán:{" "}
                      <strong>
                        {((basePrice * 1.01) / 1000000).toFixed(2)}M VND
                      </strong>
                    </p>
                    <p className="eth-equivalent">
                      ≈ {totalPriceETH.toFixed(4)} ETH
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer Details */}
            {paymentMethod === "bank_transfer" && (
              <div className="bank-transfer-section">
                <div className="bank-info-box">
                  <h4>Thông tin chuyển khoản</h4>
                  <div className="bank-details">
                    <p>
                      <strong>Ngân hàng:</strong> VietcomBank
                    </p>
                    <p>
                      <strong>Số tài khoản:</strong> 1234567890
                    </p>
                    <p>
                      <strong>Chủ tài khoản:</strong> CONG TY VIEPROPCHAIN
                    </p>
                    <p>
                      <strong>Số tiền:</strong> {totalPriceVND.toLocaleString()}{" "}
                      VND
                    </p>
                    <p>
                      <strong>Nội dung:</strong> RENT {data.tokenId}{" "}
                      {user?.email}
                    </p>
                  </div>
                  <div className="qr-code-placeholder">
                    <p>📱 QR Code VietQR sẽ hiển thị ở đây</p>
                  </div>
                </div>

                <div className="upload-receipt">
                  <label>
                    <strong>📎 Upload biên lai chuyển khoản:</strong>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {bankReceipt && (
                    <p className="file-name">✅ {bankReceipt.name}</p>
                  )}
                </div>
              </div>
            )}

            {/* Crypto Payment Info */}
            {paymentMethod === "crypto" && (
              <div className="crypto-payment-section">
                <div className="crypto-info-box success">
                  <h4>
                    🎉 Chúc mừng! Bạn tiết kiệm được{" "}
                    {((basePrice * 0.09) / 1000000).toFixed(2)}M VND
                  </h4>
                  <div className="crypto-breakdown">
                    <div className="breakdown-row">
                      <span>Giá thuê:</span>
                      <span>{(basePrice / 1000000).toFixed(2)}M VND</span>
                    </div>
                    <div className="breakdown-row platform-fee">
                      <span>Phí Platform (1%):</span>
                      <span>
                        +{((basePrice * 0.01) / 1000000).toFixed(2)}M VND
                      </span>
                    </div>
                    <div className="breakdown-row total">
                      <span>
                        <strong>Tổng thanh toán:</strong>
                      </span>
                      <span>
                        <strong>
                          {(totalPriceVND / 1000000).toFixed(2)}M VND
                        </strong>
                      </span>
                    </div>
                    <div className="breakdown-row eth-amount">
                      <span>Tương đương (1 ETH ≈ 100M VND):</span>
                      <span className="eth-value">
                        ≈ {totalPriceETH.toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                  <p className="wallet-note">
                    ⚠️ Đảm bảo ví MetaMask đã kết nối và có đủ{" "}
                    {totalPriceETH.toFixed(4)} ETH
                  </p>
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button onClick={() => setStep(1)} className="btn-back">
                ← Quay lại
              </button>
              {paymentMethod === "bank_transfer" ? (
                <button
                  onClick={handleBankTransfer}
                  className="btn-confirm"
                  disabled={!bankReceipt || loading}
                >
                  {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </button>
              ) : paymentMethod === "crypto" ? (
                <button
                  onClick={handleCryptoPayment}
                  className="btn-confirm"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Thanh toán bằng ETH"}
                </button>
              ) : (
                <button className="btn-confirm" disabled>
                  Chọn phương thức thanh toán
                </button>
              )}
            </div>
          </>
        );

      case 3:
        // Bước 3: Đang xử lý
        return (
          <div className="rent-processing">
            <LoadingSpinner />
            <h3>⏳ Đang xử lý thanh toán...</h3>
            <p>Vui lòng đợi trong giây lát</p>
            <p className="processing-note">
              {paymentMethod === "crypto"
                ? "⚠️ Vui lòng xác nhận giao dịch trên MetaMask"
                : "📝 Đang tạo đơn thuê và upload biên lai"}
            </p>
          </div>
        );

      case 4:
        // Bước 4: Thành công - Chờ duyệt
        return (
          <div className="rent-success">
            <div className="success-icon">✅</div>
            <h3>Yêu cầu thuê nhà đã được gửi!</h3>

            <div className="order-info">
              <p className="order-id">
                <strong>Mã đơn hàng:</strong> #{orderId}
              </p>
              <p className="payment-method-display">
                <strong>Phương thức:</strong>{" "}
                {paymentMethod === "crypto"
                  ? "💎 Crypto (ETH)"
                  : "🏦 Chuyển khoản"}
              </p>
              <p className="rental-period">
                <strong>Thời gian thuê:</strong> {durationDays} ngày (từ{" "}
                {startDate})
              </p>
            </div>

            <div className="success-message">
              {paymentMethod === "crypto" ? (
                <>
                  <p className="status-crypto">
                    🎉 <strong>Thanh toán thành công!</strong>
                  </p>
                  <p>Giao dịch blockchain đã được xác nhận.</p>
                  <p>Quyền thuê sẽ được kích hoạt trong vài phút.</p>
                </>
              ) : (
                <>
                  <p className="status-pending">
                    ⏳ <strong>Đang chờ xác nhận thanh toán</strong>
                  </p>
                  <p>Chúng tôi đang xác minh biên lai chuyển khoản của bạn.</p>
                  <p>
                    Kết quả sẽ được cập nhật trong <strong>24 giờ</strong>.
                  </p>
                  <p className="note">
                    💡 Bạn sẽ nhận được email thông báo khi đơn hàng được duyệt.
                  </p>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  onSuccess && onSuccess();
                  onClose();
                }}
                className="btn-confirm"
              >
                Về trang chủ
              </button>
            </div>
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
        <div className="modal-header">
          <h2 className="modal-title">🏠 Thuê NFT</h2>
          <div className="step-indicator">
            <span className={step >= 1 ? "active" : ""}>1. Chọn thời gian</span>
            <span className={step >= 2 ? "active" : ""}>2. Thanh toán</span>
            <span className={step >= 3 ? "active" : ""}>3. Xử lý</span>
            <span className={step >= 4 ? "active" : ""}>4. Hoàn tất</span>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default RentNFTModal;
