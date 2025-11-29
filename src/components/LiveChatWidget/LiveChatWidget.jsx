/**
 * ========================================================================
 * LIVE CHAT WIDGET - Modern Customer Support Chat
 * Giao diện đẹp như Intercom, Tawk.to, LiveChat
 * ========================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import { useLiveChat } from "../../contexts/LiveChatContext";
import "./LiveChatWidget.css";

const LiveChatWidget = () => {
  const {
    isOpen,
    isConnected,
    conversation,
    messages,
    unreadCount,
    isTyping,
    isMinimized,
    openChat,
    closeChat,
    minimizeChat,
    sendMessage,
    sendTyping,
    closeConversation,
    rateConversation,
  } = useLiveChat();

  const [inputText, setInputText] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Handle gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    sendMessage(inputText.trim());
    setInputText("");
    sendTyping(false);
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setInputText(e.target.value);

    // Gửi typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1000);
  };

  // Handle đánh giá
  const handleSubmitRating = () => {
    if (selectedRating === 0) {
      alert("Vui lòng chọn số sao đánh giá");
      return;
    }

    rateConversation(selectedRating, feedbackText);
    setShowRating(false);
    setSelectedRating(0);
    setFeedbackText("");
    alert("✅ Cảm ơn bạn đã đánh giá!");
  };

  // Format thời gian
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format ngày
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return d.toLocaleDateString("vi-VN");
    }
  };

  // Render message
  const renderMessage = (msg) => {
    const isUser = msg.sender.role === "user";
    const isSystem = msg.isSystem;

    if (isSystem) {
      return (
        <div key={msg._id} className="chat-message-system">
          <span className="system-icon">ℹ️</span>
          <span className="system-text">{msg.content.text}</span>
        </div>
      );
    }

    return (
      <div
        key={msg._id}
        className={`chat-message ${isUser ? "user" : "admin"}`}
      >
        {!isUser && (
          <div className="message-avatar">
            <img
              src={msg.sender.avatar || "/default-avatar.png"}
              alt={msg.sender.name}
            />
          </div>
        )}
        <div className="message-content-wrapper">
          {!isUser && <div className="message-sender">{msg.sender.name}</div>}
          <div className="message-bubble">
            <div className="message-text">{msg.content.text}</div>
            <div className="message-time">
              {formatTime(msg.createdAt)}
              {isUser && msg.isRead && (
                <span className="read-indicator">✓✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Group messages theo ngày
  const groupMessagesByDate = () => {
    const grouped = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString();

      if (msgDate !== currentDate) {
        currentDate = msgDate;
        grouped.push({
          type: "date-separator",
          date: msg.createdAt,
        });
      }

      grouped.push(msg);
    });

    return grouped;
  };

  // ============================================================
  // RENDER WIDGET BUTTON (Nút tròn góc phải dưới)
  // ============================================================
  if (!isOpen) {
    return (
      <div className="chat-widget-button" onClick={openChat}>
        <div className="chat-icon">💬</div>
        {unreadCount > 0 && (
          <div className="chat-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
        <div className="chat-pulse"></div>
      </div>
    );
  }

  // ============================================================
  // RENDER CHAT WINDOW
  // ============================================================
  return (
    <div className={`chat-widget-window ${isMinimized ? "minimized" : ""}`}>
      {/* HEADER */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            <img src="/logo.png" alt="Support" />
            <span
              className={`status-dot ${isConnected ? "online" : "offline"}`}
            ></span>
          </div>
          <div className="chat-header-text">
            <h3>Hỗ trợ trực tuyến</h3>
            <p className="chat-status">
              {isConnected
                ? conversation?.status === "active"
                  ? `Đang chat với ${conversation.admin?.name || "Admin"}`
                  : "Đang chờ hỗ trợ..."
                : "Đang kết nối..."}
            </p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            className="chat-btn-minimize"
            onClick={minimizeChat}
            title="Thu nhỏ"
          >
            <span>−</span>
          </button>
          <button className="chat-btn-close" onClick={closeChat} title="Đóng">
            <span>✕</span>
          </button>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="chat-messages">
        {/* Tin nhắn chào mừng */}
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="welcome-icon">👋</div>
            <h4>Xin chào! Chúng tôi có thể giúp gì cho bạn?</h4>
            <p>Đội ngũ hỗ trợ sẽ phản hồi trong vài phút.</p>
          </div>
        )}

        {/* Messages */}
        {groupMessagesByDate().map((item, index) => {
          if (item.type === "date-separator") {
            return (
              <div key={`date-${index}`} className="chat-date-separator">
                <span>{formatDate(item.date)}</span>
              </div>
            );
          }
          return renderMessage(item);
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="chat-typing-indicator">
            <div className="typing-avatar">
              <img src="/logo.png" alt="typing" />
            </div>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      {conversation?.status !== "closed" ? (
        <div className="chat-input-area">
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleTyping}
              placeholder="Nhập tin nhắn..."
              className="chat-input"
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="chat-send-button"
              disabled={!inputText.trim() || !isConnected}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-closed-area">
          <p>Cuộc hội thoại đã kết thúc</p>
          {!conversation.rating && (
            <button
              className="chat-rate-button"
              onClick={() => setShowRating(true)}
            >
              ⭐ Đánh giá hỗ trợ
            </button>
          )}
        </div>
      )}

      {/* RATING MODAL */}
      {showRating && (
        <div className="chat-rating-modal">
          <div className="rating-modal-content">
            <h4>Đánh giá dịch vụ hỗ trợ</h4>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star ${selectedRating >= star ? "active" : ""}`}
                  onClick={() => setSelectedRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Nhận xét của bạn (không bắt buộc)"
              className="rating-feedback"
              rows={3}
            />
            <div className="rating-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowRating(false)}
              >
                Hủy
              </button>
              <button className="btn-submit" onClick={handleSubmitRating}>
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget;
