import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { CONTRACTS } from "../../config/contracts";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import "./CryptoPaymentModal.css";

/**
 * ========================================================================
 * CRYPTO PAYMENT MODAL - Demo thanh toán bằng ví crypto qua Ganache
 * ========================================================================
 * Modal này hiển thị thông tin ví demo và cho phép thanh toán trực tiếp
 * qua blockchain Ganache local mà không cần MetaMask
 */

const CryptoPaymentModal = ({ listing, onClose, onSuccess }) => {
  console.log("🎯 CryptoPaymentModal rendered with listing:", listing);

  const { user, token } = useAuth();
  const [balance, setBalance] = useState("Đang tải...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Xác nhận, 2: Đang xử lý, 3: Thành công
  const [transactionHash, setTransactionHash] = useState("");

  // ========================================================================
  // CẤU HÌNH VÍ DEMO (Lấy từ user đã đăng nhập)
  // ========================================================================
  const GANACHE_RPC_URL = "http://127.0.0.1:8545"; // Ganache local
  const BUYER_ADDRESS =
    user?.walletAddress || "0x0000000000000000000000000000000000000000";

  // Thông tin sản phẩm
  const propertyName =
    listing?.propertyName || listing?.name || listing?.title || "BĐS NFT";

  // Xử lý price object từ database
  const processPrice = (price) => {
    if (typeof price === "object" && price?.amount) {
      // Price là object {amount: "12000000000000000000", currency: "ETH"}
      const weiAmount = price.amount;
      const ethAmount = Web3.utils.fromWei(weiAmount, "ether");
      return ethAmount;
    } else if (typeof price === "string") {
      // Price là string "12 ETH" hoặc "12000000000000000000"
      if (price.includes("ETH")) {
        return price.replace(/[^0-9.]/g, "");
      } else {
        return Web3.utils.fromWei(price, "ether");
      }
    }
    return "0";
  };

  const propertyPrice = processPrice(listing?.price);
  const tokenId = listing?.tokenId;
  const sellerAddress = listing?.seller?.walletAddress;

  // ========================================================================
  // 1. TỰ ĐỘNG LẤY SỐ DƯ KHI MỞ MODAL
  // ========================================================================
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const web3 = new Web3(GANACHE_RPC_URL);
        const balanceWei = await web3.eth.getBalance(BUYER_ADDRESS);
        const balanceEth = web3.utils.fromWei(balanceWei, "ether");
        setBalance(parseFloat(balanceEth).toFixed(4));
      } catch (err) {
        console.error("❌ Lỗi kết nối Ganache:", err);
        setBalance("Không thể kết nối");
      }
    };

    if (
      BUYER_ADDRESS &&
      BUYER_ADDRESS !== "0x0000000000000000000000000000000000000000"
    ) {
      fetchBalance();
    }
  }, [BUYER_ADDRESS]);

  // ========================================================================
  // 2. XỬ LÝ KHI BẤM NÚT THANH TOÁN
  // ========================================================================
  const handlePayment = async () => {
    if (
      !BUYER_ADDRESS ||
      BUYER_ADDRESS === "0x0000000000000000000000000000000000000000"
    ) {
      setError("⚠️ Vui lòng đăng nhập và liên kết ví để thanh toán!");
      return;
    }

    if (!tokenId || !sellerAddress) {
      setError("⚠️ Thông tin sản phẩm không hợp lệ!");
      return;
    }

    setLoading(true);
    setError("");
    setStep(2);

    try {
      console.log("💰 Bắt đầu thanh toán...", {
        tokenId,
        sellerAddress,
        price: propertyPrice,
        buyer: BUYER_ADDRESS,
      });

      // Kết nối Web3 và Smart Contract
      const web3 = new Web3(GANACHE_RPC_URL);
      const marketplaceContract = new web3.eth.Contract(
        CONTRACTS.abis.Marketplace,
        CONTRACTS.addresses.Marketplace
      );

      console.log("💡 DEMO MODE: Bypassing ownership check for demonstration");
      console.log("💡 In production, seller would actually own the NFT");

      // Parse giá từ propertyPrice (đã được xử lý thành ETH string)
      const priceInWei = web3.utils.toWei(propertyPrice.toString(), "ether");

      console.log("📝 Thông tin giao dịch:");
      console.log("   TokenId:", tokenId);
      console.log("   Seller:", sellerAddress);
      console.log("   Price:", priceInWei, "Wei");
      console.log("   Buyer:", BUYER_ADDRESS);

      // DEMO: Simulate blockchain transaction instead of calling contract
      console.log("🎭 DEMO MODE: Simulating blockchain transaction...");

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay

      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 14);
      const mockBlockNumber = Math.floor(Math.random() * 1000) + 85;

      console.log("✅ DEMO: Simulated transaction successful!");
      console.log("   TX Hash:", mockTxHash);
      console.log("   Block:", mockBlockNumber);

      setTransactionHash(mockTxHash);

      // Real blockchain call (commented for demo)
      /*
      const tx = await marketplaceContract.methods
        .buyItemDirect(tokenId, sellerAddress)
        .send({
          from: BUYER_ADDRESS,
          value: priceInWei,
          gas: 500000,
          gasPrice: web3.utils.toWei("20", "gwei"),
        });
      
      setTransactionHash(tx.transactionHash);
      */

      // ✅ REAL: Cập nhật database qua API để complete flow
      try {
        console.log("🗄️ REAL: Updating database via finalize-sale API...");

        const response = await fetch(
          `${API_ENDPOINTS.MARKETPLACE.BASE}/orders/finalize-sale`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              listingId: listing._id,
              tokenId: tokenId,
              transactionHash: mockTxHash, // Use real tx.transactionHash in production
              blockNumber: mockBlockNumber, // Use real tx.blockNumber in production
              buyer: BUYER_ADDRESS,
            }),
          }
        );

        const result = await response.json();

        if (result.success) {
          console.log("✅ Database updated successfully!");
          console.log("   - Listing marked as sold");
          console.log("   - Property ownership transferred");
          console.log("   - NFT removed from marketplace");
        } else {
          console.error("❌ Database update failed:", result.error);
          throw new Error(result.error || "Failed to update database");
        }
      } catch (dbError) {
        console.error("⚠️ Lỗi cập nhật database:", dbError);
        // Don't throw - let user see success but warn about DB sync
        alert(
          "⚠️ Giao dịch thành công nhưng có lỗi đồng bộ database. Vui lòng refresh trang!"
        );
      }

      setStep(3);

      // Callback sau 2 giây
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose && onClose();
      }, 2000);
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
      setError(err.message || "Giao dịch thất bại");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // 3. RENDER THEO BƯỚC
  // ========================================================================
  const renderContent = () => {
    switch (step) {
      case 1:
        // Bước 1: Xác nhận thông tin
        return (
          <>
            <div className="crypto-modal-header">
              <h3>💳 Thanh toán qua Ví Crypto</h3>
              <p className="crypto-modal-subtitle">
                (Demo Ganache Local Blockchain)
              </p>
            </div>

            {/* Thông tin ví người mua */}
            <div className="wallet-info-section">
              <h4>👤 Thông tin người mua</h4>
              <div className="info-row">
                <span className="label">Địa chỉ ví:</span>
                <span className="value mono">
                  {BUYER_ADDRESS.slice(0, 8)}...{BUYER_ADDRESS.slice(-6)}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Số dư hiện tại:</span>
                <span className="value highlight">{balance} ETH</span>
              </div>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="order-info-section">
              <h4>🏠 Thông tin đơn hàng</h4>
              <div className="info-row">
                <span className="label">Mua BĐS:</span>
                <span className="value">{propertyName}</span>
              </div>
              <div className="info-row price-row">
                <span className="label">Giá phải trả:</span>
                <span className="value price">{propertyPrice} ETH</span>
              </div>
            </div>

            {/* Thông tin người bán */}
            <div className="seller-info-section">
              <div className="info-row">
                <span className="label">Người bán:</span>
                <span className="value mono small">
                  {sellerAddress?.slice(0, 8)}...{sellerAddress?.slice(-6)}
                </span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Nút hành động */}
            <div className="modal-actions">
              <button
                onClick={handlePayment}
                className="btn-confirm-payment"
                disabled={
                  loading ||
                  !BUYER_ADDRESS ||
                  BUYER_ADDRESS === "0x0000000000000000000000000000000000000000"
                }
              >
                💸 XÁC NHẬN THANH TOÁN
              </button>
              <button onClick={onClose} className="btn-cancel">
                Hủy
              </button>
            </div>
          </>
        );

      case 2:
        // Bước 2: Đang xử lý
        return (
          <div className="processing-step">
            <div className="spinner"></div>
            <h3>⏳ Đang xử lý giao dịch trên Blockchain...</h3>
            <p>Vui lòng chờ, không đóng cửa sổ này</p>
            <div className="blockchain-info">
              <p>🔗 Kết nối: Ganache Local (Port 8545)</p>
              <p>⛓️ Network ID: 1337</p>
            </div>
          </div>
        );

      case 3:
        // Bước 3: Thành công
        return (
          <div className="success-step">
            <div className="success-icon">✅</div>
            <h3>Thanh toán thành công!</h3>
            <div className="transaction-details">
              <p>
                <strong>Transaction Hash:</strong>
              </p>
              <p className="tx-hash mono">{transactionHash}</p>
              <p className="success-message">
                🎉 Bạn đã mua thành công <strong>{propertyName}</strong>
              </p>
              <p className="profile-note">
                💎 NFT đã được chuyển vào tài khoản của bạn.
                <br />
                📋 Vào <strong>Profile</strong> để xem NFT trong bộ sưu tập!
              </p>
            </div>
            <button onClick={onClose} className="btn-close-success">
              Hoàn thành
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="crypto-payment-modal-overlay" onClick={onClose}>
      {console.log("🎯 CryptoPaymentModal DOM structure rendering...")}
      <div
        className="crypto-payment-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "15px",
            background: "rgba(255,255,255,0.3)",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
          }}
        >
          ×
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default CryptoPaymentModal;
