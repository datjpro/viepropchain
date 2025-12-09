import React, { useState } from "react";
import { useWeb3 } from "../../contexts/GanacheWeb3Context";
import { useAuth } from "../../contexts/AuthContext";
import web3Service from "../../services/web3Service";
import LoadingSpinner from "../LoadingSpinner";
import "./OfferNFTModal.css";

const OfferNFTModal = ({ isOpen, onClose, property, type = "buy" }) => {
  const { web3Api } = useWeb3();
  const { user } = useAuth();
  const [offerAmount, setOfferAmount] = useState("");
  const [duration, setDuration] = useState(7); // Default 7 days for auction
  const [rentalDays, setRentalDays] = useState(30); // For rental offers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState("form");

  if (!isOpen) return null;

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!web3Api.web3 || !user) {
      setError("Vui lòng kết nối ví để tiếp tục");
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      setError("Vui lòng nhập giá hợp lệ");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCurrentStep("processing");

      const account = web3Api.account;
      const offerAmountWei = web3Api.web3.utils.toWei(offerAmount, "ether");

      if (type === "buy") {
        // Tạo auction cho việc mua
        await web3Service.createAuction(
          web3Api.web3,
          account,
          property.nft.tokenId,
          offerAmountWei,
          duration * 24 * 60 * 60 // Convert days to seconds
        );
      } else {
        // Tạo rental auction cho việc thuê
        await web3Service.createRentalAuction(
          web3Api.web3,
          account,
          property.nft.tokenId,
          offerAmountWei,
          duration * 24 * 60 * 60,
          rentalDays
        );
      }

      setCurrentStep("success");
    } catch (error) {
      console.error("Error creating offer:", error);
      setError(
        error.message ||
          `Không thể tạo ${
            type === "buy" ? "đề xuất mua" : "đề xuất thuê"
          }. Vui lòng thử lại.`
      );
      setCurrentStep("form");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep("form");
    setOfferAmount("");
    setDuration(7);
    setRentalDays(30);
    setError("");
    onClose();
  };

  const renderForm = () => {
    return (
      <div className="offer-form">
        <h3 style={{ marginBottom: "24px", color: "#1f2937" }}>
          {type === "buy" ? "🏷️ Đặt giá mua NFT" : "📅 Đặt giá thuê NFT"}
        </h3>

        <div className="property-info">
          <img
            src={
              property.media?.images?.[0]?.url ||
              property.images?.[0] ||
              "https://via.placeholder.com/100x80"
            }
            alt={property.name || property.title}
            style={{
              width: "80px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "6px",
            }}
          />
          <div style={{ marginLeft: "12px" }}>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
              {property.name || property.title}
            </h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
              Token ID: {property.nft?.tokenId}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitOffer}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              {type === "buy"
                ? "Giá đề xuất (ETH):"
                : "Giá thuê mỗi ngày (ETH):"}
            </label>
            <input
              type="number"
              step="0.001"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder={type === "buy" ? "Ví dụ: 0.5" : "Ví dụ: 0.01"}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {type === "rent" && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Số ngày thuê:
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={rentalDays}
                onChange={(e) => setRentalDays(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                required
              />
              <small style={{ color: "#6b7280" }}>
                Tổng: {(parseFloat(offerAmount || 0) * rentalDays).toFixed(4)}{" "}
                ETH
              </small>
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Thời hạn đấu giá (ngày):
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <option value={1}>1 ngày</option>
              <option value={3}>3 ngày</option>
              <option value={7}>7 ngày</option>
              <option value={14}>14 ngày</option>
              <option value={30}>30 ngày</option>
            </select>
          </div>

          {error && (
            <div
              style={{
                color: "#dc2626",
                background: "#fee2e2",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: "12px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px",
                background: type === "buy" ? "#3b82f6" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {loading
                ? "Đang xử lý..."
                : type === "buy"
                ? "Đặt giá mua"
                : "Đặt giá thuê"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderProcessing = () => {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <LoadingSpinner />
        <h3 style={{ margin: "20px 0 10px 0" }}>Đang xử lý giao dịch</h3>
        <p style={{ color: "#6b7280", margin: 0 }}>
          {type === "buy"
            ? "Đang tạo đấu giá mua NFT trên blockchain..."
            : "Đang tạo đấu giá thuê NFT trên blockchain..."}
        </p>
      </div>
    );
  };

  const renderSuccess = () => {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
        <h3 style={{ margin: "0 0 16px 0", color: "#10b981" }}>
          {type === "buy" ? "Đã tạo đấu giá mua!" : "Đã tạo đấu giá thuê!"}
        </h3>

        <div
          style={{
            background: "#f9fafb",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "left",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong>Giá đề xuất:</strong> {offerAmount} ETH
          </div>
          {type === "rent" && (
            <div style={{ marginBottom: "8px" }}>
              <strong>Thời gian thuê:</strong> {rentalDays} ngày
            </div>
          )}
          <div style={{ marginBottom: "8px" }}>
            <strong>Thời hạn đấu giá:</strong> {duration} ngày
          </div>
        </div>

        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #10b981",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: "#065f46" }}>
            ✅ Đấu giá đã được tạo trên blockchain. Chủ sở hữu NFT có thể xem và
            chấp nhận đề xuất của bạn.
          </p>
        </div>

        <button
          onClick={handleClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Đóng
        </button>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: "480px", width: "90%" }}
      >
        <div className="modal-header">
          <h2>{type === "buy" ? "💰 Mua NFT" : "📅 Thuê NFT"}</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {currentStep === "form" && renderForm()}
          {currentStep === "processing" && renderProcessing()}
          {currentStep === "success" && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default OfferNFTModal;
