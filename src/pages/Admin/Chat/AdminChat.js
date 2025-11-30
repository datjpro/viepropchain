import React, { useState, useEffect, useRef } from 'react';
import './AdminChat.css';

const AdminChat = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      userId: 'user_001',
      userName: 'Nguyễn Văn A',
      userAvatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff',
      lastMessage: 'Tôi muốn tư vấn về bất động sản',
      lastTime: '10:30',
      unread: 3,
      status: 'online',
      messages: [
        {
          id: 1,
          sender: 'user',
          content: 'Xin chào, tôi cần tư vấn về căn hộ',
          time: '10:25',
          read: true
        },
        {
          id: 2,
          sender: 'admin',
          content: 'Chào bạn! Tôi có thể giúp gì cho bạn?',
          time: '10:26',
          read: true
        },
        {
          id: 3,
          sender: 'user',
          content: 'Tôi muốn tư vấn về bất động sản',
          time: '10:30',
          read: false
        }
      ]
    },
    {
      id: 2,
      userId: 'user_002',
      userName: 'Trần Thị B',
      userAvatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=10b981&color=fff',
      lastMessage: 'Cảm ơn anh đã hỗ trợ',
      lastTime: '09:15',
      unread: 0,
      status: 'offline',
      messages: [
        {
          id: 1,
          sender: 'user',
          content: 'Giá căn hộ này bao nhiêu?',
          time: '09:10',
          read: true
        },
        {
          id: 2,
          sender: 'admin',
          content: 'Giá khoảng 2.5 tỷ bạn nhé',
          time: '09:12',
          read: true
        },
        {
          id: 3,
          sender: 'user',
          content: 'Cảm ơn anh đã hỗ trợ',
          time: '09:15',
          read: true
        }
      ]
    },
    {
      id: 3,
      userId: 'user_003',
      userName: 'Lê Văn C',
      userAvatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=f59e0b&color=fff',
      lastMessage: 'Tôi muốn xem thêm hình ảnh',
      lastTime: 'Hôm qua',
      unread: 1,
      status: 'away',
      messages: [
        {
          id: 1,
          sender: 'user',
          content: 'Tôi muốn xem thêm hình ảnh',
          time: 'Hôm qua',
          read: false
        }
      ]
    }
  ]);

  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: activeConversation.messages.length + 1,
      sender: 'admin',
      content: message,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      read: true
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: message,
          lastTime: newMessage.time
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setActiveConversation({
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage]
    });
    setMessage('');
  };

  const handleSelectConversation = (conv) => {
    // Đánh dấu đã đọc
    const updatedConversations = conversations.map(c => {
      if (c.id === conv.id) {
        return {
          ...c,
          unread: 0,
          messages: c.messages.map(m => ({ ...m, read: true }))
        };
      }
      return c;
    });
    
    setConversations(updatedConversations);
    setActiveConversation({
      ...conv,
      unread: 0,
      messages: conv.messages.map(m => ({ ...m, read: true }))
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'unread' && conv.unread > 0) ||
                         (filterStatus === 'online' && conv.status === 'online');
    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return '#10b981';
      case 'away': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const quickReplies = [
    'Chào bạn! Tôi có thể giúp gì cho bạn?',
    'Cảm ơn bạn đã liên hệ. Để tư vấn chi tiết, bạn vui lòng cung cấp thông tin...',
    'Hiện tại chúng tôi có nhiều BDS phù hợp với nhu cầu của bạn',
    'Tôi sẽ gửi thông tin chi tiết qua email cho bạn',
    'Bạn có thể để lại SĐT, chúng tôi sẽ liên hệ tư vấn trực tiếp'
  ];

  return (
    <div className="admin-chat">
      <div className="admin-chat-header">
        <div className="header-left">
          <h1>Quản lý Chat</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Tổng hội thoại:</span>
              <span className="stat-value">{conversations.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Chưa đọc:</span>
              <span className="stat-value unread">{totalUnread}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-chat-container">
        {/* Sidebar - Danh sách hội thoại */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm hội thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              <button 
                className={filterStatus === 'all' ? 'active' : ''}
                onClick={() => setFilterStatus('all')}
              >
                Tất cả
              </button>
              <button 
                className={filterStatus === 'unread' ? 'active' : ''}
                onClick={() => setFilterStatus('unread')}
              >
                Chưa đọc ({totalUnread})
              </button>
              <button 
                className={filterStatus === 'online' ? 'active' : ''}
                onClick={() => setFilterStatus('online')}
              >
                Online
              </button>
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${activeConversation.id === conv.id ? 'active' : ''} ${conv.unread > 0 ? 'has-unread' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="conversation-avatar">
                  <img src={conv.userAvatar} alt={conv.userName} />
                  <span 
                    className="status-dot" 
                    style={{ backgroundColor: getStatusColor(conv.status) }}
                  />
                </div>
                <div className="conversation-info">
                  <div className="conversation-top">
                    <span className="user-name">{conv.userName}</span>
                    <span className="last-time">{conv.lastTime}</span>
                  </div>
                  <div className="conversation-bottom">
                    <span className="last-message">{conv.lastMessage}</span>
                    {conv.unread > 0 && (
                      <span className="unread-badge">{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          <div className="chat-main-header">
            <div className="chat-user-info">
              <img src={activeConversation.userAvatar} alt={activeConversation.userName} />
              <div className="user-details">
                <h3>{activeConversation.userName}</h3>
                <span className="user-status">
                  <span 
                    className="status-dot" 
                    style={{ backgroundColor: getStatusColor(activeConversation.status) }}
                  />
                  {activeConversation.status === 'online' ? 'Đang hoạt động' : 
                   activeConversation.status === 'away' ? 'Vắng mặt' : 'Ngoại tuyến'}
                </span>
              </div>
            </div>
            <div className="chat-actions">
              <button className="action-btn" title="Thông tin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 11V16M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="action-btn" title="Gọi điện">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="action-btn" title="Lưu trữ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 7H19M5 7C3.89543 7 3 6.10457 3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5C21 6.10457 20.1046 7 19 7M5 7L5 19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7M9 11L12 14M12 14L15 11M12 14V7" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {activeConversation.messages.map((msg, index) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.sender === 'user' && (
                  <img src={activeConversation.userAvatar} alt="" className="message-avatar" />
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    {msg.content}
                  </div>
                  <span className="message-time">{msg.time}</span>
                </div>
                {msg.sender === 'admin' && (
                  <div className="admin-avatar">A</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="quick-replies">
              <span className="quick-label">Trả lời nhanh:</span>
              <div className="quick-buttons">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    className="quick-reply-btn"
                    onClick={() => setMessage(reply)}
                    title={reply}
                  >
                    {reply.substring(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
              <button type="button" className="attach-btn" title="Đính kèm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42944 14.0991 2.00366 15.16 2.00366C16.2209 2.00366 17.2394 2.42944 17.99 3.18C18.7406 3.93056 19.1664 4.94906 19.1664 6.01C19.1664 7.07094 18.7406 8.08944 17.99 8.84L9.41 17.41C9.03472 17.7853 8.52544 17.9961 7.995 17.9961C7.46456 17.9961 6.95528 17.7853 6.58 17.41C6.20472 17.0347 5.99389 16.5254 5.99389 15.995C5.99389 15.4646 6.20472 14.9553 6.58 14.58L15.07 6.1" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-input"
              />
              <button type="submit" className="send-btn" disabled={!message.trim()}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - User Info */}
        <div className="user-info-sidebar">
          <div className="user-profile">
            <img src={activeConversation.userAvatar} alt={activeConversation.userName} />
            <h3>{activeConversation.userName}</h3>
            <span className="user-id">ID: {activeConversation.userId}</span>
            <div className="user-status-badge" style={{ backgroundColor: getStatusColor(activeConversation.status) }}>
              {activeConversation.status === 'online' ? 'Đang hoạt động' : 
               activeConversation.status === 'away' ? 'Vắng mặt' : 'Ngoại tuyến'}
            </div>
          </div>

          <div className="user-actions">
            <button className="user-action-btn primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Gửi Email
            </button>
            <button className="user-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Gọi điện
            </button>
            <button className="user-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Xem hồ sơ
            </button>
          </div>

          <div className="user-info-section">
            <h4>Thông tin liên hệ</h4>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">user@example.com</span>
            </div>
            <div className="info-item">
              <span className="info-label">Điện thoại:</span>
              <span className="info-value">0123 456 789</span>
            </div>
            <div className="info-item">
              <span className="info-label">Địa chỉ:</span>
              <span className="info-value">Hà Nội, Việt Nam</span>
            </div>
          </div>

          <div className="user-info-section">
            <h4>Ghi chú</h4>
            <textarea 
              className="notes-textarea" 
              placeholder="Thêm ghi chú về khách hàng..."
              rows="4"
            />
            <button className="save-notes-btn">Lưu ghi chú</button>
          </div>

          <div className="user-info-section">
            <h4>Nhãn</h4>
            <div className="tags">
              <span className="tag">VIP</span>
              <span className="tag">Tiềm năng</span>
              <button className="add-tag-btn">+ Thêm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
