import React from "react";
import "./Vision.css";

export const Vision = () => {
  return (
    <div className="vision-container">
      <h2 className="vision-title">Tầm nhìn & Sứ mệnh</h2>

      <div className="vision-content">
        <div className="vision-section">
          <h3 className="section-title">Tầm nhìn</h3>
          <p className="section-text">
            Trở thành nền tảng giao dịch bất động sản minh bạch, an toàn và dễ tiếp cận hàng đầu Việt Nam, 
            giúp mọi người có thể đầu tư, mua bán và quản lý đất đai một cách thông minh nhờ công nghệ blockchain.
          </p>
        </div>

        <div className="mission-section">
          <h3 className="section-title">Sứ mệnh</h3>
          <ul className="mission-list">
            <li><strong>Minh bạch:</strong> Cung cấp thông tin bất động sản rõ ràng, chính xác và kiểm chứng trên blockchain.</li>
            <li><strong>An toàn:</strong> Bảo vệ quyền sở hữu và giao dịch của người dùng bằng công nghệ hợp đồng thông minh.</li>
            <li><strong>Tiện lợi:</strong> Đơn giản hóa quy trình mua bán, chuyển nhượng và quản lý đất đai.</li>
            <li><strong>Kết nối cộng đồng:</strong> Xây dựng hệ sinh thái bất động sản kết nối nhà đầu tư, chủ sở hữu và các dịch vụ liên quan.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
