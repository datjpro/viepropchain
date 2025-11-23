import React from "react";
import "./Partner.css";

import geodata from '../../assets/partner/geodata.jpg';
import landetech from '../../assets/partner/landtech.jpg';
import blockchain from '../../assets/partner/blockchain.jpg';

export const Partner = () => {
  return (
    <div className="partner-container">
      <h1 className="partner-title">Đối Tác Chiến Lược</h1>

      <p className="partner-desc">
        Chúng tôi hợp tác với các tổ chức, doanh nghiệp và đơn vị công nghệ uy tín
        để phát triển hệ sinh thái giao dịch đất đai minh bạch – an toàn – hiệu quả.
      </p>

      <div className="partner-grid">

        <div className="partner-card">
          <img src={blockchain} alt="Blockchain Corp" />
          <h3>Blockchain Corp</h3>
          <p>Nền tảng blockchain bảo mật cao.</p>
        </div>

        <div className="partner-card">
          <img src={landetech} alt="LandTech" />
          <h3>LandTech</h3>
          <p>Giải pháp số hóa bất động sản.</p>
        </div>

        <div className="partner-card">
          <img src={geodata} alt="GeoData VN" />
          <h3>GeoData VN</h3>
          <p>Cung cấp dữ liệu địa chính và thửa đất.</p>
        </div>

      </div>
    </div>
  );
};
