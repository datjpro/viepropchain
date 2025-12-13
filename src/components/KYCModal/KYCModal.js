import React, { useState } from "react";
import "./KYCModal.css";

const KYCModal = ({ isOpen, onClose, onSubmit, language = "en" }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.fullName.trim()) {
      setError(
        language === "en" ? "Full name is required" : "Vui lòng nhập họ tên"
      );
      return;
    }

    if (!formData.idNumber.trim()) {
      setError(
        language === "en" ? "ID number is required" : "Vui lòng nhập số CCCD"
      );
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError(
        err.message ||
          (language === "en" ? "Failed to submit KYC" : "Gửi KYC thất bại")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="kyc-modal-overlay" onClick={onClose}>
      <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="kyc-modal-header">
          <h2>🔐 {language === "en" ? "KYC Verification" : "Xác thực KYC"}</h2>
          <button className="kyc-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="kyc-form">
          <div className="kyc-alert-info">
            <p>
              {language === "en"
                ? "Complete KYC verification to access all features including viewing properties, NFTs, and linking wallet."
                : "Hoàn thành xác thực KYC để truy cập tất cả tính năng bao gồm xem bất động sản, NFT và liên kết ví."}
            </p>
          </div>

          {error && <div className="kyc-alert-error">{error}</div>}

          <div className="kyc-form-group">
            <label htmlFor="fullName">
              {language === "en" ? "Full Name" : "Họ và tên"} *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder={
                language === "en"
                  ? "Enter your full name"
                  : "Nhập họ tên đầy đủ"
              }
              required
            />
          </div>

          <div className="kyc-form-group">
            <label htmlFor="idNumber">
              {language === "en" ? "ID Card Number (CCCD)" : "Số CCCD"} *
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder={
                language === "en"
                  ? "Enter 12-digit ID number"
                  : "Nhập 12 số CCCD"
              }
              maxLength="12"
              pattern="\d{12}"
              required
            />
            <small className="kyc-field-hint">
              {language === "en" ? "12 digits" : "12 chữ số"}
            </small>
          </div>

          <div className="kyc-form-actions">
            <button
              type="button"
              className="kyc-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              {language === "en" ? "Maybe Later" : "Để sau"}
            </button>
            <button
              type="submit"
              className="kyc-btn-primary"
              disabled={loading}
            >
              {loading
                ? language === "en"
                  ? "Submitting..."
                  : "Đang gửi..."
                : language === "en"
                ? "Submit & Verify"
                : "Gửi & Xác thực"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KYCModal;
