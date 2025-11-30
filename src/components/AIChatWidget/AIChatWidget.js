import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import "./AIChatWidget.css";

const AIChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "Xin chào! Tôi là trợ lý AI của ViePropChain. Tôi có thể giúp bạn tìm kiếm BĐS, tư vấn đầu tư và trả lời các câu hỏi về blockchain.",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ẩn widget khi ở trang admin hoặc AI chat
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname === "/ai-chat"
  ) {
    return null;
  }

  const quickQuestions = [
    "🏠 Tìm căn hộ cao cấp",
    "💰 Tư vấn đầu tư BĐS",
    "📊 Phân tích thị trường",
    "🔗 Blockchain là gì?",
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (
      input.includes("căn hộ") ||
      input.includes("nhà") ||
      input.includes("tìm")
    ) {
      return "Tôi có thể giúp bạn tìm kiếm bất động sản phù hợp! Bạn muốn tìm:\n- Căn hộ cao cấp\n- Nhà phố\n- Biệt thự\n- Đất nền\n\nVà khu vực nào bạn quan tâm? (TP.HCM, Hà Nội, Đà Nẵng...)";
    }

    if (input.includes("đầu tư") || input.includes("lợi nhuận")) {
      return "Về đầu tư BĐS, tôi khuyên bạn:\n✅ Nghiên cứu kỹ khu vực\n✅ Xem xét tiềm năng phát triển\n✅ Tính toán ROI (Return on Investment)\n✅ Kiểm tra pháp lý\n\nBạn muốn biết thêm về đầu tư khu vực nào?";
    }

    if (input.includes("blockchain") || input.includes("nft")) {
      return "ViePropChain sử dụng công nghệ Blockchain để:\n🔗 Tokenize bất động sản thành NFT\n🔒 Đảm bảo minh bạch và bảo mật\n📝 Lưu trữ hợp đồng thông minh\n💎 Tạo thanh khoản cho BĐS\n\nBạn muốn tìm hiểu kỹ hơn về phần nào?";
    }

    if (input.includes("giá") || input.includes("bao nhiêu")) {
      return "Để tư vấn giá chính xác, tôi cần thêm thông tin:\n📍 Khu vực/Địa chỉ cụ thể\n📐 Diện tích\n🏗️ Loại hình (căn hộ, nhà phố...)\n\nHoặc bạn có thể xem các BĐS đang niêm yết trên sàn của chúng tôi!";
    }

    if (input.includes("phân tích") || input.includes("thị trường")) {
      return "Xu hướng thị trường BĐS 2025:\n📈 Tăng trưởng: Khu vực Đông TP.HCM, Bắc Hà Nội\n🔥 Hot: Bất động sản nghỉ dưỡng\n💡 Tiềm năng: Đô thị vệ tinh\n📊 Công nghệ: NFT & Blockchain trong BĐS\n\nBạn muốn phân tích chi tiết khu vực nào?";
    }

    return "Cảm ơn bạn đã hỏi! Tôi có thể hỗ trợ bạn về:\n🏠 Tìm kiếm BĐS\n💰 Tư vấn đầu tư\n📊 Phân tích thị trường\n🔗 Công nghệ Blockchain\n📞 Liên hệ chuyên gia\n\nBạn quan tâm đến vấn đề nào?";
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const openFullChat = () => {
    navigate("/ai-chat");
    setIsOpen(false);
  };

  return (
    <>
      {/* AI Chat Button */}
      <motion.div
        className="ai-chat-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="ai-icon"
              className="ai-chat-icon"
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ai-label">AI</span>
            </motion.div>
          ) : (
            <motion.div
              key="close-icon"
              className="ai-chat-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 18L18 6M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="ai-pulse-ring"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* AI Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chat-widget-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-header-info">
                <div className="ai-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3>AI Assistant</h3>
                  <span className="ai-status">
                    <span className="status-dot"></span>
                    Sẵn sàng hỗ trợ
                  </span>
                </div>
              </div>
              <button
                className="expand-btn"
                onClick={openFullChat}
                title="Mở rộng"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10 3H3V10M21 3H14V10M21 21H14V14M10 21H3V14M3 3L10 10M21 3L14 10M21 21L14 14M10 21L3 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Quick Questions */}
            <div className="ai-quick-questions">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`ai-message ${msg.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.type === "ai" && (
                    <div className="message-avatar ai">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">{msg.content}</div>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                  {msg.type === "user" && (
                    <div className="message-avatar user">U</div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  className="ai-message ai typing-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="message-avatar ai">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="ai-chat-input-form">
              <input
                type="text"
                placeholder="Hỏi AI về bất động sản..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" disabled={!inputMessage.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
