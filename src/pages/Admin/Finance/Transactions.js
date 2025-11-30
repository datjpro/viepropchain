import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import "./Finance.css";

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Giả lập dữ liệu - thay bằng API thực tế
      setTimeout(() => {
        const mockTransactions = [
          {
            id: "TXN-2025-001",
            type: "sale",
            property: "Căn hộ Vinhomes Central Park",
            buyer: "0x1234...5678",
            seller: "0x8765...4321",
            amount: 5500000000,
            platformFee: 275000000,
            status: "completed",
            txHash: "0xabc123...def456",
            timestamp: "2025-11-25T10:30:00",
          },
          {
            id: "TXN-2025-002",
            type: "rental",
            property: "Nhà phố Thảo Điền",
            tenant: "0x2345...6789",
            landlord: "0x9876...5432",
            amount: 50000000,
            platformFee: 2500000,
            status: "completed",
            txHash: "0xdef456...ghi789",
            timestamp: "2025-11-24T14:20:00",
          },
          {
            id: "TXN-2025-003",
            type: "sale",
            property: "Biệt thự Quận 2",
            buyer: "0x3456...7890",
            seller: "0x0987...6543",
            amount: 4800000000,
            platformFee: 240000000,
            status: "pending",
            txHash: "0xghi789...jkl012",
            timestamp: "2025-11-23T09:15:00",
          },
          {
            id: "TXN-2025-004",
            type: "rental",
            property: "Chung cư The Sun Avenue",
            tenant: "0x4567...8901",
            landlord: "0x1098...7654",
            amount: 15000000,
            platformFee: 750000,
            status: "completed",
            txHash: "0xjkl012...mno345",
            timestamp: "2025-11-22T16:45:00",
          },
          {
            id: "TXN-2025-005",
            type: "sale",
            property: "Đất nền Nhà Bè",
            buyer: "0x5678...9012",
            seller: "0x2109...8765",
            amount: 3200000000,
            platformFee: 160000000,
            status: "failed",
            txHash: "0xmno345...pqr678",
            timestamp: "2025-11-20T11:00:00",
          },
        ];
        setTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)} tỷ`;
    }
    return `${(amount / 1000000).toFixed(0)} triệu`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { text: "Hoàn thành", class: "status-completed" },
      pending: { text: "Đang xử lý", class: "status-pending" },
      failed: { text: "Thất bại", class: "status-failed" },
    };
    const info = statusMap[status] || { text: status, class: "" };
    return <span className={`status-badge ${info.class}`}>{info.text}</span>;
  };

  const getTypeBadge = (type) => {
    return type === "sale" ? (
      <span className="type-badge sale">💰 Bán</span>
    ) : (
      <span className="type-badge rental">🔑 Thuê</span>
    );
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter =
      filter === "all" || tx.type === filter || tx.status === filter;
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "completed").length,
    pending: transactions.filter((t) => t.status === "pending").length,
    failed: transactions.filter((t) => t.status === "failed").length,
    totalValue: transactions.reduce((sum, t) => sum + t.amount, 0),
    totalFees: transactions.reduce((sum, t) => sum + t.platformFee, 0),
  };

  if (loading) {
    return (
      <div className="finance-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-container">
      {/* Header */}
      <div className="finance-header">
        <div className="header-content">
          <h1>💳 Lịch sử Giao dịch</h1>
          <p>Theo dõi tất cả giao dịch trên nền tảng</p>
        </div>
        <button className="btn-export">📥 Xuất Excel</button>
      </div>

      {/* Stats */}
      <div className="transactions-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p>Tổng giao dịch</p>
            <h3>{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p>Hoàn thành</p>
            <h3>{stats.completed}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p>Đang xử lý</p>
            <h3>{stats.pending}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <p>Thất bại</p>
            <h3>{stats.failed}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p>Tổng giá trị</p>
            <h3>{formatCurrency(stats.totalValue)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-content">
            <p>Tổng phí</p>
            <h3>{formatCurrency(stats.totalFees)}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="transactions-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, tên BĐS, TX hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </button>
          <button
            className={filter === "sale" ? "active" : ""}
            onClick={() => setFilter("sale")}
          >
            💰 Bán
          </button>
          <button
            className={filter === "rental" ? "active" : ""}
            onClick={() => setFilter("rental")}
          >
            🔑 Thuê
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            ✅ Hoàn thành
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            ⏳ Đang xử lý
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Loại</th>
              <th>Bất động sản</th>
              <th>Người mua/thuê</th>
              <th>Người bán/cho thuê</th>
              <th>Giá trị</th>
              <th>Phí nền tảng</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <code className="tx-id">{tx.id}</code>
                </td>
                <td>{getTypeBadge(tx.type)}</td>
                <td className="property-cell">{tx.property}</td>
                <td>
                  <code className="address">{tx.buyer || tx.tenant}</code>
                </td>
                <td>
                  <code className="address">{tx.seller || tx.landlord}</code>
                </td>
                <td className="amount-cell">{formatCurrency(tx.amount)}</td>
                <td className="fee-cell">{formatCurrency(tx.platformFee)}</td>
                <td>{getStatusBadge(tx.status)}</td>
                <td className="date-cell">{formatDate(tx.timestamp)}</td>
                <td>
                  <button
                    className="btn-view-tx"
                    onClick={() =>
                      window.open(
                        `https://etherscan.io/tx/${tx.txHash}`,
                        "_blank"
                      )
                    }
                  >
                    👁️ Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="empty-state">
          <p>📭 Không tìm thấy giao dịch nào</p>
        </div>
      )}
    </div>
  );
};

export default Transactions;
