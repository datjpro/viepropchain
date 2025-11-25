import React from "react";
import "./Technology.css";
import bck1 from '../../assets/backGround/bck1.jpg';

export const Technology = () => {
  const features = [
    {
      title: "Blockchain minh bạch",
      desc: "Mọi giao dịch được ghi nhận và kiểm chứng, chống gian lận.",
      icon: "⛓️",
    },
    {
      title: "Hợp đồng thông minh",
      desc: "Tự động thực hiện điều khoản giao dịch, đảm bảo quyền lợi người dùng.",
      icon: "🤖",
    },
    {
      title: "Quản lý dữ liệu bất động sản",
      desc: "Danh mục đất đai được lưu trữ an toàn và tra cứu dễ dàng.",
      icon: "📊",
    },
    {
      title: "Kết nối cộng đồng",
      desc: "Tạo hệ sinh thái bất động sản số kết nối nhà đầu tư và chủ sở hữu.",
      icon: "🌐",
    },
  ];

  return (
    <div 
      className="tech-container"
      style={{
        backgroundImage: `url(${bck1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',  // full màn hình
      }}
    >
      <div className="tech-overlay"></div>

      <h2 className="tech-title">Công nghệ ViePropChain</h2>
      <div className="tech-list">
        {features.map((item, index) => (
          <div key={index} className="tech-card">
            <div className="tech-icon">{item.icon}</div>
            <h3 className="tech-name">{item.title}</h3>
            <p className="tech-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
