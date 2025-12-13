/**
 * ========================================================================
 * ADMIN LIVE CHAT DASHBOARD
 * Quản lý tất cả conversations và chat với khách hàng
 * ========================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import { API_GATEWAY_URL } from "../../../config/api";
import io from "socket.io-client";
import "./LiveChat.css";

const LiveChat = () => {
  // ============================================================
  // STATE
  // ============================================================
  const [pendingConversations, setPendingConversations] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    closed: 0,
    rating: { avgRating: 0, totalRatings: 0 },
  });
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ============================================================
  // SOCKET CONNECTION
  // ============================================================
  useEffect(() => {
    const token = localStorage.getItem("viepropchain_token");
    const user = JSON.parse(localStorage.getItem("viepropchain_user") || "{}");

    if (!token) return;

    const socket = io(`${API_GATEWAY_URL.replace("/api", "")}`, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Admin Socket Connected");
      setIsConnected(true);

      // Join admin room
      socket.emit(
        "admin:joinRoom",
        {
          adminId: user._id,
          email: user.email,
          name: user.profile?.displayName || user.email,
        },
        (response) => {
          if (response.success) {
            setPendingConversations(response.pendingConversations || []);
          }
        }
      );
    });

    socket.on("disconnect", () => {
      console.log("❌ Admin Socket Disconnected");
      setIsConnected(false);
    });

    // Conversation mới
    socket.on("admin:newConversation", (data) => {
      setPendingConversations((prev) => [data, ...prev]);

      // Notification
      if (Notification.permission === "granted") {
        new Notification("Khách hàng mới cần hỗ trợ", {
          body: `${data.user.name} (${data.user.email})`,
          icon: "/logo.png",
        });
      }
    });

    // Tin nhắn mới
    socket.on("chat:newMessage", ({ message, conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages((prev) => [...prev, message]);
      }

      // Update last message in list
      setActiveConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? {
                ...conv,
                lastMessageAt: new Date(),
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
    });

    // Tin nhắn hệ thống
    socket.on("chat:systemMessage", ({ message }) => {
      if (selectedConversation) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Typing indicator
    socket.on("chat:userTyping", ({ isTyping: typing }) => {
      setIsTyping(typing);

      if (typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    // Conversation được accept bởi admin khác
    socket.on("admin:conversationAccepted", ({ conversationId, adminName }) => {
      setPendingConversations((prev) =>
        prev.filter((c) => c._id !== conversationId)
      );
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [selectedConversation]);

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    loadStats();
    loadActiveConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("viepropchain_token");
      const response = await fetch(`${API_GATEWAY_URL}/livechat/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("❌ Error loading stats:", error);
    }
  };

  const loadActiveConversations = async () => {
    try {
      const token = localStorage.getItem("viepropchain_token");
      const response = await fetch(`${API_GATEWAY_URL}/livechat/admin/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setActiveConversations(data.data);
      }
    } catch (error) {
      console.error("❌ Error loading active conversations:", error);
    }
  };

  // ============================================================
  // ACTIONS
  // ============================================================
  const acceptConversation = (conversation) => {
    if (!socketRef.current) return;

    const user = JSON.parse(localStorage.getItem("viepropchain_user") || "{}");

    socketRef.current.emit(
      "admin:acceptConversation",
      {
        conversationId: conversation._id,
        adminId: user._id,
        email: user.email,
        name: user.profile?.displayName || user.email,
      },
      (response) => {
        if (response.success) {
          // Remove from pending
          setPendingConversations((prev) =>
            prev.filter((c) => c._id !== conversation._id)
          );

          // Add to active
          setActiveConversations((prev) => [response.conversation, ...prev]);

          // Select it
          selectConversation(response.conversation);
        }
      }
    );
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);

    // Load messages
    try {
      const token = localStorage.getItem("viepropchain_token");
      const response = await fetch(
        `${API_GATEWAY_URL}/livechat/conversations/${conversation._id}/messages?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }

      // Mark as read
      if (socketRef.current) {
        socketRef.current.emit("chat:markAsRead", {
          conversationId: conversation._id,
          role: "admin",
        });
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();

    if (!inputText.trim() || !socketRef.current || !selectedConversation)
      return;

    const user = JSON.parse(localStorage.getItem("viepropchain_user") || "{}");

    socketRef.current.emit("chat:sendMessage", {
      conversationId: selectedConversation._id,
      senderId: user._id,
      senderRole: "admin",
      senderName: user.profile?.displayName || user.email,
      senderAvatar: user.profile?.picture,
      messageType: "text",
      content: { text: inputText.trim() },
    });

    setInputText("");
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (socketRef.current && selectedConversation) {
      const user = JSON.parse(
        localStorage.getItem("viepropchain_user") || "{}"
      );

      socketRef.current.emit("chat:typing", {
        conversationId: selectedConversation._id,
        userName: user.profile?.displayName || "Admin",
        isTyping: true,
      });

      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("chat:typing", {
          conversationId: selectedConversation._id,
          userName: user.profile?.displayName || "Admin",
          isTyping: false,
        });
      }, 1000);
    }
  };

  const closeConversation = () => {
    if (!socketRef.current || !selectedConversation) return;

    const user = JSON.parse(localStorage.getItem("viepropchain_user") || "{}");

    socketRef.current.emit(
      "chat:closeConversation",
      {
        conversationId: selectedConversation._id,
        closedBy: user._id,
        role: "admin",
      },
      (response) => {
        if (response.success) {
          setSelectedConversation({
            ...selectedConversation,
            status: "closed",
          });
          setActiveConversations((prev) =>
            prev.filter((c) => c._id !== selectedConversation._id)
          );
          loadStats();
        }
      }
    );
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    return d.toLocaleDateString("vi-VN");
  };

  const renderMessage = (msg) => {
    const isAdmin = msg.sender.role === "admin";
    const isSystem = msg.isSystem;

    if (isSystem) {
      return (
        <div key={msg._id} className="admin-chat-message-system">
          <span className="system-text">ℹ️ {msg.content.text}</span>
        </div>
      );
    }

    return (
      <div
        key={msg._id}
        className={`admin-chat-message ${isAdmin ? "admin" : "user"}`}
      >
        <div className="message-content">
          <div className="message-header">
            <span className="message-sender">{msg.sender.name}</span>
            <span className="message-time">{formatTime(msg.createdAt)}</span>
          </div>
          <div className="message-text">{msg.content.text}</div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="admin-livechat-container">
      {/* Header */}
      <div className="admin-livechat-header">
        <div className="header-title">
          <h1>💬 Live Chat Dashboard</h1>
          <span
            className={`connection-status ${
              isConnected ? "connected" : "disconnected"
            }`}
          >
            {isConnected ? "🟢 Đang kết nối" : "🔴 Mất kết nối"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Đang chờ</div>
        </div>
        <div className="stat-card active">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Đang chat</div>
        </div>
        <div className="stat-card closed">
          <div className="stat-number">{stats.closed}</div>
          <div className="stat-label">Đã đóng</div>
        </div>
        <div className="stat-card rating">
          <div className="stat-number">
            {stats.rating.avgRating.toFixed(1)} ⭐
          </div>
          <div className="stat-label">
            Đánh giá ({stats.rating.totalRatings})
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-chat-layout">
        {/* Sidebar - Conversations List */}
        <div className="chat-sidebar">
          {/* Pending */}
          <div className="sidebar-section">
            <div className="section-header">
              <h3>🔔 Chờ hỗ trợ ({pendingConversations.length})</h3>
            </div>
            <div className="conversations-list">
              {pendingConversations.map((conv) => (
                <div
                  key={conv._id}
                  className="conversation-item pending"
                  onClick={() => acceptConversation(conv)}
                >
                  <div className="conv-avatar">
                    <img
                      src={conv.user.picture || "/default-avatar.png"}
                      alt=""
                    />
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">{conv.user.name}</div>
                    <div className="conv-email">{conv.user.email}</div>
                    <div className="conv-time">
                      {formatDate(conv.createdAt)}
                    </div>
                  </div>
                  <button className="btn-accept">Nhận</button>
                </div>
              ))}
              {pendingConversations.length === 0 && (
                <div className="empty-state">Không có khách hàng đang chờ</div>
              )}
            </div>
          </div>

          {/* Active */}
          <div className="sidebar-section">
            <div className="section-header">
              <h3>💬 Đang chat ({activeConversations.length})</h3>
            </div>
            <div className="conversations-list">
              {activeConversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`conversation-item active ${
                    selectedConversation?._id === conv._id ? "selected" : ""
                  }`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conv-avatar">
                    <img
                      src={conv.user.picture || "/default-avatar.png"}
                      alt=""
                    />
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">{conv.user.name}</div>
                    <div className="conv-preview">
                      {conv.messageCount} tin nhắn
                    </div>
                    <div className="conv-time">
                      {formatDate(conv.lastMessageAt)}
                    </div>
                  </div>
                  {conv.unreadCountAdmin > 0 && (
                    <div className="unread-badge">{conv.unreadCountAdmin}</div>
                  )}
                </div>
              ))}
              {activeConversations.length === 0 && (
                <div className="empty-state">Chưa có cuộc hội thoại nào</div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <div className="user-info">
                  <img
                    src={
                      selectedConversation.user.picture || "/default-avatar.png"
                    }
                    alt=""
                    className="user-avatar"
                  />
                  <div>
                    <h3>{selectedConversation.user.name}</h3>
                    <p>{selectedConversation.user.email}</p>
                  </div>
                </div>
                {selectedConversation.status === "active" && (
                  <button
                    className="btn-close-conv"
                    onClick={closeConversation}
                  >
                    Kết thúc chat
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="chat-messages-area">
                {messages.map((msg) => renderMessage(msg))}

                {isTyping && (
                  <div className="admin-chat-typing">
                    <span>Khách hàng đang gõ</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedConversation.status === "active" && (
                <div className="chat-input-area">
                  <form onSubmit={sendMessage}>
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleTyping}
                      placeholder="Nhập tin nhắn..."
                      className="chat-input"
                    />
                    <button
                      type="submit"
                      className="btn-send"
                      disabled={!inputText.trim()}
                    >
                      Gửi
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-icon">💬</div>
              <h3>Chọn một cuộc hội thoại để bắt đầu</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
