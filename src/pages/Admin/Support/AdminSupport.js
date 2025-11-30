import React, { useState } from "react";
import "./AdminSupport.css";

const AdminSupport = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  const [tickets, setTickets] = useState([
    {
      id: "TK001",
      userId: "user_001",
      userName: "Nguyễn Văn A",
      userEmail: "nguyenvana@email.com",
      userPhone: "0901234567",
      subject: "Yêu cầu tư vấn mua căn hộ cao cấp",
      category: "consultation",
      priority: "high",
      status: "pending",
      createdAt: "2025-12-01 08:30",
      updatedAt: "2025-12-01 08:30",
      description:
        "Tôi muốn tư vấn về các căn hộ cao cấp khu vực quận 1, giá từ 3-5 tỷ. Tôi quan tâm đến view đẹp và tiện ích đầy đủ.",
      replies: [],
      assignedTo: null,
    },
    {
      id: "TK002",
      userId: "user_002",
      userName: "Trần Thị B",
      userEmail: "tranthib@email.com",
      userPhone: "0912345678",
      subject: "Báo lỗi không thể upload ảnh BĐS",
      category: "technical",
      priority: "urgent",
      status: "in-progress",
      createdAt: "2025-12-01 07:15",
      updatedAt: "2025-12-01 09:00",
      description:
        'Khi tôi cố upload ảnh bất động sản, hệ thống báo lỗi "File too large". Tôi đã thử resize ảnh nhưng vẫn không được.',
      replies: [
        {
          id: 1,
          from: "admin",
          message: "Cảm ơn bạn đã báo cáo. Chúng tôi đang kiểm tra vấn đề này.",
          timestamp: "2025-12-01 07:30",
        },
      ],
      assignedTo: "Admin Support",
    },
    {
      id: "TK003",
      userId: "user_003",
      userName: "Lê Văn C",
      userEmail: "levanc@email.com",
      userPhone: "0923456789",
      subject: "Hỏi về quy trình đăng bán BĐS",
      category: "general",
      priority: "medium",
      status: "pending",
      createdAt: "2025-11-30 16:45",
      updatedAt: "2025-11-30 16:45",
      description:
        "Tôi muốn đăng bán nhà riêng của mình. Cho tôi hỏi quy trình và chi phí là bao nhiêu?",
      replies: [],
      assignedTo: null,
    },
    {
      id: "TK004",
      userId: "user_004",
      userName: "Phạm Thị D",
      userEmail: "phamthid@email.com",
      userPhone: "0934567890",
      subject: "Xác minh tài khoản bị từ chối",
      category: "account",
      priority: "high",
      status: "resolved",
      createdAt: "2025-11-30 10:20",
      updatedAt: "2025-11-30 14:30",
      description:
        "Tài khoản của tôi bị từ chối xác minh. Tôi đã gửi đầy đủ giấy tờ theo yêu cầu.",
      replies: [
        {
          id: 1,
          from: "admin",
          message:
            "Chúng tôi đã kiểm tra lại hồ sơ của bạn. Ảnh CCCD chưa rõ ràng.",
          timestamp: "2025-11-30 11:00",
        },
        {
          id: 2,
          from: "user",
          message: "Tôi đã gửi lại ảnh mới rõ hơn.",
          timestamp: "2025-11-30 13:00",
        },
        {
          id: 3,
          from: "admin",
          message: "Tài khoản của bạn đã được xác minh thành công.",
          timestamp: "2025-11-30 14:30",
        },
      ],
      assignedTo: "Admin KYC",
    },
  ]);

  const categories = {
    consultation: { label: "Tư vấn", color: "#3b82f6" },
    technical: { label: "Kỹ thuật", color: "#ef4444" },
    general: { label: "Chung", color: "#10b981" },
    account: { label: "Tài khoản", color: "#f59e0b" },
    payment: { label: "Thanh toán", color: "#8b5cf6" },
  };

  const priorities = {
    urgent: { label: "Khẩn cấp", color: "#dc2626", icon: "🔴" },
    high: { label: "Cao", color: "#f59e0b", icon: "🟡" },
    medium: { label: "Trung bình", color: "#3b82f6", icon: "🔵" },
    low: { label: "Thấp", color: "#6b7280", icon: "⚪" },
  };

  const statuses = {
    pending: { label: "Chờ xử lý", color: "#f59e0b" },
    "in-progress": { label: "Đang xử lý", color: "#3b82f6" },
    resolved: { label: "Đã giải quyết", color: "#10b981" },
    closed: { label: "Đã đóng", color: "#6b7280" },
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "all") return true;
    return ticket.status === activeTab;
  });

  const stats = {
    pending: tickets.filter((t) => t.status === "pending").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    total: tickets.length,
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    const newReply = {
      id: selectedTicket.replies.length + 1,
      from: "admin",
      message: replyMessage,
      timestamp: new Date().toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          replies: [...ticket.replies, newReply],
          status: "in-progress",
          updatedAt: newReply.timestamp,
        };
      }
      return ticket;
    });

    setTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      replies: [...selectedTicket.replies, newReply],
      status: "in-progress",
    });
    setReplyMessage("");
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: newStatus,
          updatedAt: new Date().toLocaleString("vi-VN"),
        };
      }
      return ticket;
    });
    setTickets(updatedTickets);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const assignTicket = (ticketId, assignee) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return { ...ticket, assignedTo: assignee };
      }
      return ticket;
    });
    setTickets(updatedTickets);
  };

  const quickReplies = [
    "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ xử lý yêu cầu trong thời gian sớm nhất.",
    "Để hỗ trợ tốt hơn, vui lòng cung cấp thêm thông tin chi tiết.",
    "Vấn đề của bạn đã được ghi nhận. Chúng tôi đang kiểm tra.",
    "Chúng tôi đã nhận được yêu cầu và sẽ phản hồi trong 24h.",
    "Cảm ơn bạn đã kiên nhẫn. Chúng tôi đang làm việc để giải quyết vấn đề này.",
  ];

  return (
    <div className="admin-support">
      {/* Stats Cards */}
      <div className="support-stats">
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Chờ xử lý</div>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Đã giải quyết</div>
          </div>
        </div>
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng ticket</div>
          </div>
        </div>
      </div>

      <div className="support-container">
        {/* Left Panel - Ticket List */}
        <div className="tickets-panel">
          <div className="panel-header">
            <h2>Danh sách Ticket</h2>
            <div className="filter-tabs">
              <button
                className={activeTab === "all" ? "active" : ""}
                onClick={() => setActiveTab("all")}
              >
                Tất cả
              </button>
              <button
                className={activeTab === "pending" ? "active" : ""}
                onClick={() => setActiveTab("pending")}
              >
                Chờ xử lý
              </button>
              <button
                className={activeTab === "in-progress" ? "active" : ""}
                onClick={() => setActiveTab("in-progress")}
              >
                Đang xử lý
              </button>
              <button
                className={activeTab === "resolved" ? "active" : ""}
                onClick={() => setActiveTab("resolved")}
              >
                Đã xong
              </button>
            </div>
          </div>

          <div className="tickets-list">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`ticket-item ${
                  selectedTicket?.id === ticket.id ? "active" : ""
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="ticket-header">
                  <span className="ticket-id">#{ticket.id}</span>
                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: priorities[ticket.priority].color,
                    }}
                  >
                    {priorities[ticket.priority].icon}{" "}
                    {priorities[ticket.priority].label}
                  </span>
                </div>
                <h3 className="ticket-subject">{ticket.subject}</h3>
                <div className="ticket-meta">
                  <span className="ticket-user">👤 {ticket.userName}</span>
                  <span
                    className="ticket-category"
                    style={{ color: categories[ticket.category].color }}
                  >
                    {categories[ticket.category].label}
                  </span>
                </div>
                <div className="ticket-footer">
                  <span className="ticket-time">🕐 {ticket.createdAt}</span>
                  <span
                    className="ticket-status"
                    style={{ backgroundColor: statuses[ticket.status].color }}
                  >
                    {statuses[ticket.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Ticket Detail */}
        <div className="ticket-detail-panel">
          {selectedTicket ? (
            <>
              <div className="detail-header">
                <div className="detail-title">
                  <h2>
                    #{selectedTicket.id} - {selectedTicket.subject}
                  </h2>
                  <div className="detail-badges">
                    <span
                      className="badge priority"
                      style={{
                        backgroundColor:
                          priorities[selectedTicket.priority].color,
                      }}
                    >
                      {priorities[selectedTicket.priority].label}
                    </span>
                    <span
                      className="badge category"
                      style={{
                        backgroundColor:
                          categories[selectedTicket.category].color,
                      }}
                    >
                      {categories[selectedTicket.category].label}
                    </span>
                  </div>
                </div>
                <div className="detail-actions">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      updateTicketStatus(selectedTicket.id, e.target.value)
                    }
                    className="status-select"
                  >
                    {Object.entries(statuses).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                  <button className="action-btn">📞 Gọi</button>
                  <button className="action-btn">✉️ Email</button>
                </div>
              </div>

              <div className="detail-user-info">
                <div className="user-avatar">
                  {selectedTicket.userName.charAt(0)}
                </div>
                <div className="user-details">
                  <h3>{selectedTicket.userName}</h3>
                  <p>📧 {selectedTicket.userEmail}</p>
                  <p>📱 {selectedTicket.userPhone}</p>
                </div>
                <div className="ticket-meta-info">
                  <p>
                    <strong>Tạo lúc:</strong> {selectedTicket.createdAt}
                  </p>
                  <p>
                    <strong>Cập nhật:</strong> {selectedTicket.updatedAt}
                  </p>
                  {selectedTicket.assignedTo && (
                    <p>
                      <strong>Phụ trách:</strong> {selectedTicket.assignedTo}
                    </p>
                  )}
                </div>
              </div>

              <div className="detail-content">
                <h3>Nội dung yêu cầu</h3>
                <div className="original-message">
                  {selectedTicket.description}
                </div>

                <h3>Lịch sử phản hồi ({selectedTicket.replies.length})</h3>
                <div className="replies-list">
                  {selectedTicket.replies.map((reply) => (
                    <div key={reply.id} className={`reply-item ${reply.from}`}>
                      <div className="reply-avatar">
                        {reply.from === "admin" ? "A" : "U"}
                      </div>
                      <div className="reply-content">
                        <div className="reply-header">
                          <strong>
                            {reply.from === "admin"
                              ? "Admin"
                              : selectedTicket.userName}
                          </strong>
                          <span className="reply-time">{reply.timestamp}</span>
                        </div>
                        <div className="reply-message">{reply.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reply-section">
                <div className="quick-replies-bar">
                  <span className="quick-label">Trả lời nhanh:</span>
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      className="quick-reply-btn"
                      onClick={() => setReplyMessage(reply)}
                      title={reply}
                    >
                      {reply.substring(0, 25)}...
                    </button>
                  ))}
                </div>
                <form onSubmit={handleReply} className="reply-form">
                  <textarea
                    placeholder="Nhập phản hồi cho khách hàng..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows="4"
                  />
                  <div className="reply-actions">
                    <button type="button" className="attach-btn">
                      📎 Đính kèm
                    </button>
                    <button
                      type="submit"
                      className="send-btn"
                      disabled={!replyMessage.trim()}
                    >
                      Gửi phản hồi
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="no-ticket-selected">
              <div className="empty-icon">📋</div>
              <h3>Chọn một ticket để xem chi tiết</h3>
              <p>
                Chọn ticket từ danh sách bên trái để xem thông tin và phản hồi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
