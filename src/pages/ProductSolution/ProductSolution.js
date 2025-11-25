import React from "react";
import "./ProductSolution.css";

export const ProductSolution = () => {
  const solutions = [
    {
      id: 1,
      title: "Giao dịch minh bạch",
      description: "Mọi giao dịch bất động sản đều được ghi nhận trên blockchain, đảm bảo minh bạch, chống gian lận.",
      icon: "🏷️",
    },
    {
      id: 2,
      title: "Bảo mật và an toàn",
      description: "Bảo vệ quyền sở hữu đất đai và thông tin người dùng nhờ hợp đồng thông minh và hệ thống xác thực chặt chẽ.",
      icon: "🔒",
    },
    {
      id: 3,
      title: "Quản lý dễ dàng",
      description: "Công cụ quản lý danh mục đất đai trực quan, giúp người dùng theo dõi, mua bán và đầu tư thuận tiện.",
      icon: "📊",
    },
    {
      id: 4,
      title: "Kết nối cộng đồng",
      description: "Xây dựng hệ sinh thái kết nối nhà đầu tư, chủ sở hữu và các dịch vụ liên quan đến bất động sản.",
      icon: "🤝",
    },
  ];

  return (
    <div className="solution-container">
      <h2 className="solution-title">Giải pháp sản phẩm</h2>
      <div className="solution-list">
        {solutions.map((item) => (
          <div key={item.id} className="solution-card">
            <div className="solution-icon">{item.icon}</div>
            <h3 className="solution-name">{item.title}</h3>
            <p className="solution-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
