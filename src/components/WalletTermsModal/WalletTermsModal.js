import React from "react";
import "./WalletTermsModal.css";

const WalletTermsModal = ({ onAgree, onLater }) => {
  return (
    <div className="wallet-terms-modal-overlay">
      <div className="wallet-terms-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>
            <span>🔐</span> Điều Khoản Ví Custodial
          </h2>
          <p>Vui lòng đọc và đồng ý trước khi tiếp tục</p>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Section 1: Before Linking */}
          <div className="terms-section">
            <h3>📋 Trước khi liên kết ví</h3>
            <div className="terms-box">
              <ul className="terms-list">
                <li>
                  Bạn cần <strong>liên kết ví MetaMask</strong> để sở hữu NFT
                  trực tiếp
                </li>
                <li>
                  Các hoạt động <strong>Mint NFT</strong> sẽ được thực hiện
                  trước khi bạn liên kết
                </li>
                <li>
                  NFT sẽ được <strong>lưu tạm thời</strong> trên hệ thống cho
                  đến khi bạn liên kết ví
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Custodial Wallet Info */}
          <div className="terms-section">
            <h3>💎 Ví Custodial (Ví Tạm Thời)</h3>
            <div className="warning-box">
              <h4>
                <span>⚠️</span> Lưu ý quan trọng
              </h4>
              <p>
                <strong>
                  NFT của bạn sẽ được lưu trữ tại địa chỉ ví Admin
                </strong>{" "}
                cho đến khi bạn liên kết ví MetaMask của riêng mình.
              </p>
              <p>
                Địa chỉ ví Admin:{" "}
                <code
                  style={{
                    background: "#fed7aa",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "13px",
                    wordBreak: "break-all",
                  }}
                >
                  0x... (System Wallet)
                </code>
              </p>
              <p style={{ marginTop: "12px" }}>
                ✅ <strong>Quyền sở hữu vẫn thuộc về bạn</strong> và được ghi
                nhận trong hệ thống database.
              </p>
            </div>
          </div>

          {/* Section 3: After Linking */}
          <div className="terms-section">
            <h3>🔗 Sau khi liên kết ví</h3>
            <div className="info-box">
              <h4>
                <span>📌</span> Quy trình chuyển NFT
              </h4>
              <ol className="steps-list" style={{ listStyle: "none" }}>
                <li data-step="1">
                  Bạn liên kết ví MetaMask của mình với tài khoản
                </li>
                <li data-step="2">
                  Hệ thống xác minh quyền sở hữu NFT trong database
                </li>
                <li data-step="3">
                  NFT được <strong>chuyển từ ví Admin</strong> sang{" "}
                  <strong>ví của bạn</strong>
                </li>
                <li data-step="4">
                  Bạn có toàn quyền kiểm soát NFT trên blockchain
                </li>
              </ol>
            </div>
          </div>

          {/* Section 4: Benefits */}
          <div className="terms-section">
            <h3>✨ Lợi ích của hệ thống</h3>
            <div className="terms-box">
              <ul className="terms-list">
                <li>
                  <strong>Không cần ví ngay lập tức:</strong> Bạn có thể sử dụng
                  dịch vụ mà không cần MetaMask từ đầu
                </li>
                <li>
                  <strong>An toàn & Minh bạch:</strong> Mọi giao dịch được ghi
                  nhận trên blockchain
                </li>
                <li>
                  <strong>Linh hoạt:</strong> Liên kết ví bất cứ lúc nào bạn
                  muốn
                </li>
                <li>
                  <strong>Không mất phí gas:</strong> Phí chuyển NFT do hệ thống
                  chi trả
                </li>
              </ul>
            </div>
          </div>

          {/* Section 5: Agreement */}
          <div className="terms-section">
            <div
              className="warning-box"
              style={{ borderColor: "#3b82f6", background: "#eff6ff" }}
            >
              <h4 style={{ color: "#1e40af" }}>
                <span>📝</span> Cam kết của bạn
              </h4>
              <p style={{ color: "#1e3a8a" }}>
                Bằng việc nhấn <strong>"Tôi đồng ý"</strong>, bạn xác nhận rằng:
              </p>
              <ul
                className="terms-list"
                style={{ marginTop: "12px", paddingLeft: "0" }}
              >
                <li style={{ color: "#1e3a8a" }}>
                  Đã đọc và hiểu rõ cơ chế ví Custodial
                </li>
                <li style={{ color: "#1e3a8a" }}>
                  Chấp nhận NFT được lưu tạm tại ví Admin cho đến khi liên kết
                  ví
                </li>
                <li style={{ color: "#1e3a8a" }}>
                  Sẽ liên kết ví MetaMask để nhận quyền sở hữu hoàn toàn
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-later" onClick={onLater}>
            Để sau
          </button>
          <button className="btn-agree" onClick={onAgree}>
            <span>✓</span> Tôi đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletTermsModal;
