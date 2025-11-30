import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import "./Finance.css";

const Payouts = () => {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      // Giả lập dữ liệu
      setTimeout(() => {
        setPendingRequests([
          {
            id: "PAYOUT-001",
            user: "Nguyễn Văn A",
            walletAddress: "0x1234...5678",
            amount: 450000000,
            method: "crypto",
            requestDate: "2025-11-29T10:00:00",
            status: "pending",
          },
          {
            id: "PAYOUT-002",
            user: "Trần Thị B",
            walletAddress: "0x8765...4321",
            amount: 320000000,
            method: "bank",
            bankAccount: "1234567890 - VietcomBank",
            requestDate: "2025-11-28T14:30:00",
            status: "pending",
          },
        ]);

        setPayouts([
          {
            id: "PAYOUT-100",
            user: "Lê Văn C",
            walletAddress: "0x2345...6789",
            amount: 550000000,
            method: "crypto",
            txHash: "0xabc123...def456",
            requestDate: "2025-11-25T09:00:00",
            processedDate: "2025-11-25T10:30:00",
            status: "completed",
          },
          {
            id: "PAYOUT-099",
            user: "Phạm Thị D",
            walletAddress: "0x3456...7890",
            amount: 280000000,
            method: "bank",
            bankAccount: "9876543210 - Techcombank",
            requestDate: "2025-11-24T11:00:00",
            processedDate: "2025-11-24T15:20:00",
            status: "completed",
          },
        ]);

        setStats({
          totalPending: 2,
          pendingAmount: 770000000,
          totalCompleted: 45,
          completedAmount: 22500000000,
          totalRejected: 3,
        });

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)} tỷ VND`;
    }
    return `${(amount / 1000000).toFixed(0)} triệu VND`;
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

  const handleApprovePayout = async (payoutId) => {
    if (!window.confirm("Xác nhận duyệt yêu cầu rút tiền này?")) return;

    // TODO: Gọi API approve payout
    alert(`✅ Đã duyệt payout ${payoutId}`);
    fetchPayoutData();
  };

  const handleRejectPayout = async (payoutId) => {
    const reason = window.prompt("Nhập lý do từ chối:");
    if (!reason) return;

    // TODO: Gọi API reject payout
    alert(`❌ Đã từ chối payout ${payoutId}\nLý do: ${reason}`);
    fetchPayoutData();
  };

  if (loading) {
    return (
      <div className="finance-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải dữ liệu rút tiền...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-container">
      {/* Header */}
      <div className="finance-header">
        <div className="header-content">
          <h1>💸 Quản lý Rút tiền</h1>
          <p>Xử lý yêu cầu rút tiền và chi trả</p>
        </div>
        <button className="btn-export">📥 Xuất báo cáo</button>
      </div>

      {/* Stats */}
      <div className="payout-stats">
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p>Chờ duyệt</p>
            <h3>{stats.totalPending}</h3>
            <span className="stat-amount">
              {formatCurrency(stats.pendingAmount)}
            </span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p>Đã chi trả</p>
            <h3>{stats.totalCompleted}</h3>
            <span className="stat-amount">
              {formatCurrency(stats.completedAmount)}
            </span>
          </div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <p>Đã từ chối</p>
            <h3>{stats.totalRejected}</h3>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>⏳ Yêu cầu Chờ duyệt ({pendingRequests.length})</h2>
          </div>
          <div className="payout-cards">
            {pendingRequests.map((payout) => (
              <div key={payout.id} className="payout-card pending-card">
                <div className="card-header">
                  <div className="card-title">
                    <h3>{payout.user}</h3>
                    <code className="payout-id">{payout.id}</code>
                  </div>
                  <div className="card-amount">
                    {formatCurrency(payout.amount)}
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="label">👤 Người dùng:</span>
                    <span className="value">{payout.user}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">💼 Ví:</span>
                    <code className="address">{payout.walletAddress}</code>
                  </div>
                  {payout.method === "bank" && payout.bankAccount && (
                    <div className="info-row">
                      <span className="label">🏦 Tài khoản NH:</span>
                      <span className="value">{payout.bankAccount}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">💳 Phương thức:</span>
                    <span className="badge-method">
                      {payout.method === "crypto"
                        ? "🔐 Crypto"
                        : "🏦 Ngân hàng"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">📅 Ngày yêu cầu:</span>
                    <span className="value">
                      {formatDate(payout.requestDate)}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprovePayout(payout.id)}
                  >
                    ✅ Duyệt
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRejectPayout(payout.id)}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Payouts */}
      <div className="section">
        <div className="section-header">
          <h2>✅ Lịch sử Chi trả</h2>
        </div>
        <div className="payouts-table">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Người dùng</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Ngày yêu cầu</th>
                <th>Ngày xử lý</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td>
                    <code className="payout-id">{payout.id}</code>
                  </td>
                  <td>{payout.user}</td>
                  <td className="amount-cell">
                    {formatCurrency(payout.amount)}
                  </td>
                  <td>
                    <span className="badge-method">
                      {payout.method === "crypto"
                        ? "🔐 Crypto"
                        : "🏦 Ngân hàng"}
                    </span>
                  </td>
                  <td>{formatDate(payout.requestDate)}</td>
                  <td>{formatDate(payout.processedDate)}</td>
                  <td>
                    <span className="status-badge status-completed">
                      Hoàn thành
                    </span>
                  </td>
                  <td>
                    {payout.method === "crypto" && payout.txHash && (
                      <button
                        className="btn-view-tx"
                        onClick={() =>
                          window.open(
                            `https://etherscan.io/tx/${payout.txHash}`,
                            "_blank"
                          )
                        }
                      >
                        🔗 TX
                      </button>
                    )}
                    {payout.method === "bank" && payout.bankAccount && (
                      <span className="bank-info">{payout.bankAccount}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {pendingRequests.length === 0 && payouts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>Chưa có yêu cầu rút tiền nào</h3>
          <p>Các yêu cầu rút tiền từ người dùng sẽ hiển thị tại đây</p>
        </div>
      )}
    </div>
  );
};

export default Payouts;
