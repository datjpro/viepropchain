import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIChat.css';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là trợ lý AI của ViePropChain. Tôi có thể giúp bạn:\n\n🏠 Tìm kiếm bất động sản phù hợp\n💰 Tư vấn đầu tư và phân tích thị trường\n🔗 Hiểu về công nghệ Blockchain trong BĐS\n📊 So sánh giá và xu hướng\n📞 Kết nối với chuyên gia\n\nBạn muốn tôi giúp gì hôm nay?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    {
      icon: '🏠',
      title: 'Tìm căn hộ',
      questions: [
        'Tìm căn hộ cao cấp quận 1 giá 3-5 tỷ',
        'Căn hộ 2 phòng ngủ gần trường học',
        'Chung cư view sông Sài Gòn'
      ]
    },
    {
      icon: '💰',
      title: 'Đầu tư',
      questions: [
        'Khu vực nào tiềm năng tăng giá?',
        'Tư vấn đầu tư BĐS cho người mới',
        'ROI trung bình của thị trường'
      ]
    },
    {
      icon: '📊',
      title: 'Phân tích',
      questions: [
        'Xu hướng thị trường BĐS 2025',
        'So sánh giá khu vực Hà Nội vs TP.HCM',
        'Dự báo giá nhà 6 tháng tới'
      ]
    },
    {
      icon: '🔗',
      title: 'Blockchain',
      questions: [
        'NFT BĐS là gì?',
        'Lợi ích của blockchain trong BĐS',
        'Cách mua BĐS bằng crypto'
      ]
    }
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('căn hộ') || input.includes('nhà') || input.includes('tìm')) {
      return `Tôi đã tìm thấy một số BĐS phù hợp với yêu cầu của bạn:\n\n🏢 **Vinhomes Central Park**\n📍 Quận Bình Thạnh, TP.HCM\n💰 3.8 tỷ - 2PN, 80m², view sông\n⭐ Tiện ích: Hồ bơi, gym, công viên\n\n🏢 **The Manor Central Park**\n📍 Quận Bình Thạnh, TP.HCM  \n💰 4.2 tỷ - 3PN, 95m², tầng cao\n⭐ Tiện ích: An ninh 24/7, siêu thị\n\n🏢 **Masteri Thảo Điền**\n📍 Quận 2, TP.HCM\n💰 4.5 tỷ - 2PN, 75m², view thành phố\n⭐ Tiện ích: SmartHome, bãi đỗ xe\n\nBạn muốn xem chi tiết căn nào?`;
    }
    
    if (input.includes('đầu tư') || input.includes('lợi nhuận') || input.includes('tiềm năng')) {
      return `📊 **Phân tích đầu tư BĐS 2025:**\n\n✅ **Khu vực tiềm năng:**\n🔥 Đông TP.HCM (Thủ Đức, Quận 9) - Tăng 15-20%/năm\n🔥 Bắc Hà Nội (Long Biên, Gia Lâm) - Tăng 12-18%/năm\n🔥 Đà Nẵng (Hòa Xuân, Hòa Quý) - Tăng 10-15%/năm\n\n💡 **Lời khuyên:**\n• Ưu tiên khu vực có hạ tầng đang phát triển\n• Kiểm tra pháp lý kỹ càng\n• Đa dạng hóa danh mục đầu tư\n• Nắm giữ trung-dài hạn (3-5 năm)\n\n📈 **ROI trung bình:** 12-18%/năm\n\nBạn muốn phân tích cụ thể khu vực nào?`;
    }
    
    if (input.includes('blockchain') || input.includes('nft') || input.includes('crypto')) {
      return `🔗 **Blockchain trong BĐS - Công nghệ tương lai:**\n\n**NFT BĐS là gì?**\nTokenize bất động sản thành NFT (Non-Fungible Token) trên blockchain, cho phép:\n• Sở hữu một phần BĐS (fractional ownership)\n• Giao dịch 24/7 không cần giấy tờ phức tạp\n• Minh bạch 100% lịch sử giao dịch\n• Thanh khoản cao hơn\n\n**Lợi ích:**\n✅ Giảm chi phí giao dịch 60-80%\n✅ Xử lý nhanh chóng (phút thay vì tuần)\n✅ Bảo mật cao với smart contract\n✅ Có thể đầu tư từ 10 triệu đồng\n\n**Cách thức:**\n1️⃣ Chọn BĐS muốn đầu tư\n2️⃣ Mua NFT tương ứng\n3️⃣ Nhận lợi nhuận từ cho thuê/tăng giá\n4️⃣ Bán NFT khi muốn thoát vốn\n\nBạn muốn tìm hiểu về dự án NFT nào?`;
    }
    
    if (input.includes('giá') || input.includes('bao nhiêu') || input.includes('so sánh')) {
      return `💵 **Bảng giá BĐS trung bình (Q4/2025):**\n\n**TP. HỒ CHÍ MINH:**\n🏙️ Quận 1: 150-250 triệu/m²\n🏙️ Quận 2: 80-150 triệu/m²\n🏙️ Thủ Đức: 50-90 triệu/m²\n🏙️ Bình Thạnh: 70-120 triệu/m²\n\n**HÀ NỘI:**\n🏛️ Hoàn Kiếm: 200-350 triệu/m²\n🏛️ Cầu Giấy: 100-180 triệu/m²\n🏛️ Long Biên: 60-100 triệu/m²\n🏛️ Hà Đông: 40-70 triệu/m²\n\n**ĐÀ NẴNG:**\n🏖️ Sơn Trà: 80-150 triệu/m²\n🏖️ Hải Châu: 60-100 triệu/m²\n🏖️ Ngũ Hành Sơn: 50-90 triệu/m²\n\n📊 Xu hướng: Tăng 8-12% so với cùng kỳ năm ngoái\n\nBạn quan tâm khu vực cụ thể nào?`;
    }
    
    if (input.includes('phân tích') || input.includes('thị trường') || input.includes('xu hướng')) {
      return `📈 **Báo cáo Thị trường BĐS 2025:**\n\n**Tổng quan:**\n• Tăng trưởng: 8-12% (YoY)\n• Nguồn cung: Tăng 15% so với 2024\n• Thanh khoản: Cải thiện 25%\n• Lãi suất vay: 8-10%/năm\n\n**Phân khúc HOT:**\n🔥 Căn hộ cao cấp (+18%)\n🔥 Shophouse (+15%)\n🔥 BĐS nghỉ dưỡng (+20%)\n🔥 Đất nền đô thị vệ tinh (+12%)\n\n**Yếu tố tác động:**\n✅ Hạ tầng giao thông phát triển\n✅ Luật Đất đai mới tạo thuận lợi\n✅ Dòng vốn FDI tăng mạnh\n✅ Công nghệ PropTech & Blockchain\n\n**Dự báo 6 tháng tới:**\n📊 Giá tăng nhẹ 5-8%\n📊 Giao dịch sôi động hơn\n📊 M&A trong ngành tăng\n\nBạn muốn phân tích sâu về vấn đề gì?`;
    }

    if (input.includes('liên hệ') || input.includes('chuyên gia') || input.includes('tư vấn')) {
      return `👨‍💼 **Kết nối với Chuyên gia:**\n\nTôi có thể giúp bạn kết nối với:\n\n📞 **Tư vấn viên BĐS**\n• Tư vấn miễn phí 24/7\n• Hỗ trợ tìm kiếm & đánh giá\n• Đàm phán & thủ tục pháp lý\n\n💼 **Chuyên gia đầu tư**\n• Phân tích danh mục\n• Chiến lược đầu tư\n• Quản lý rủi ro\n\n🔗 **Blockchain Advisor**\n• Hướng dẫn NFT & Crypto\n• Smart contract\n• Digital assets\n\nBạn muốn tôi kết nối với ai?`;
    }
    
    return `Cảm ơn bạn đã hỏi! 🙏\n\nTôi có thể hỗ trợ bạn về:\n\n🏠 **Tìm kiếm BĐS:** Căn hộ, nhà phố, đất nền...\n💰 **Đầu tư:** Phân tích, tư vấn, ROI...\n📊 **Thị trường:** Giá cả, xu hướng, dự báo...\n🔗 **Blockchain:** NFT, Smart Contract, Tokenization...\n📞 **Chuyên gia:** Kết nối tư vấn viên\n\nBạn quan tâm đến chủ đề nào? Hãy hỏi tôi cụ thể hơn nhé! 😊`;
  };

  const handleQuestionClick = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="ai-chat-page">
      {/* Header */}
      <div className="ai-chat-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Quay lại
        </button>
        <div className="header-info">
          <div className="ai-avatar-large">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1>AI Assistant</h1>
            <p>Trợ lý thông minh của ViePropChain</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-icon">💬</span>
            <span className="stat-value">{messages.length}</span>
            <span className="stat-label">Tin nhắn</span>
          </div>
          <div className="stat">
            <span className="stat-icon">⚡</span>
            <span className="stat-value">99%</span>
            <span className="stat-label">Độ chính xác</span>
          </div>
        </div>
      </div>

      <div className="ai-chat-content">
        {/* Sidebar */}
        <div className="ai-chat-sidebar">
          <h3>💡 Gợi ý câu hỏi</h3>
          {suggestedQuestions.map((category, idx) => (
            <div key={idx} className="question-category">
              <h4>{category.icon} {category.title}</h4>
              <div className="questions-list">
                {category.questions.map((q, qIdx) => (
                  <button
                    key={qIdx}
                    className="suggested-question"
                    onClick={() => handleQuestionClick(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Chat */}
        <div className="ai-chat-main">
          <div className="ai-messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message-item ${msg.type}`}>
                {msg.type === 'ai' && (
                  <div className="message-avatar ai">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className="message-wrapper">
                  <div className="message-bubble">{msg.content}</div>
                  <span className="message-timestamp">{msg.timestamp}</span>
                </div>
                {msg.type === 'user' && (
                  <div className="message-avatar user">U</div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="ai-message-item ai typing">
                <div className="message-avatar ai">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="ai-input-container">
            <button type="button" className="attachment-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42944 14.0991 2.00366 15.16 2.00366C16.2209 2.00366 17.2394 2.42944 17.99 3.18C18.7406 3.93056 19.1664 4.94906 19.1664 6.01C19.1664 7.07094 18.7406 8.08944 17.99 8.84L9.41 17.41C9.03472 17.7853 8.52544 17.9961 7.995 17.9961C7.46456 17.9961 6.95528 17.7853 6.58 17.41C6.20472 17.0347 5.99389 16.5254 5.99389 15.995C5.99389 15.4646 6.20472 14.9553 6.58 14.58L15.07 6.1" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <input
              type="text"
              placeholder="Hỏi AI về bất động sản, đầu tư, blockchain..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit" className="send-btn" disabled={!inputMessage.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
