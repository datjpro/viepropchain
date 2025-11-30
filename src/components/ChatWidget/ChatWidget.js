import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "admin",
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      text: message,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate admin response
    setTimeout(() => {
      const adminResponse = {
        id: messages.length + 2,
        type: "admin",
        text: "Cảm ơn bạn đã liên hệ! Admin sẽ phản hồi trong giây lát.",
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, adminResponse]);
    }, 1000);
  };

  const quickActions = [
    { icon: "💬", text: "Tư vấn BĐS" },
    { icon: "📞", text: "Gọi điện" },
    { icon: "📧", text: "Email" },
  ];

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="chat-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isOpen ? 0.9 : 1,
        }}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="chat-icon"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="chat-icon"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        {!isOpen && (
          <motion.div
            className="chat-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            1
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-widget-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <div className="avatar-img">VP</div>
                  <div className="avatar-status"></div>
                </div>
                <div className="chat-header-text">
                  <h3>ViePropChain Support</h3>
                  <p>
                    <span className="status-dot"></span>Online - Phản hồi trong
                    vài phút
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="chat-quick-actions">
              {quickActions.map((action, index) => (
                <button key={index} className="quick-action-btn">
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-text">{action.text}</span>
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`chat-message ${msg.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.type === "admin" && (
                    <div className="message-avatar">VP</div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">{msg.text}</div>
                    <div className="message-time">{msg.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="chat-input"
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!message.trim()}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <div className="chat-footer-text">
                Được hỗ trợ bởi <strong>ViePropChain</strong>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
