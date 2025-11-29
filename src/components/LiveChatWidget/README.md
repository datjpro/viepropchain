# 🎯 HƯỚNG DẪN SỬ DỤNG LIVE CHAT WIDGET

## 📦 Cài đặt Dependencies

```bash
npm install socket.io-client
```

## 🔧 Tích hợp vào App.jsx

### Bước 1: Wrap App với LiveChatProvider

```jsx
// src/App.jsx
import React from "react";
import { LiveChatProvider } from "./contexts/LiveChatContext";
import LiveChatWidget from "./components/LiveChatWidget";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <LiveChatProvider>
      <BrowserRouter>
        {/* Your routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* ... */}
        </Routes>

        {/* Live Chat Widget - Hiển thị mọi trang */}
        <LiveChatWidget />
      </BrowserRouter>
    </LiveChatProvider>
  );
}

export default App;
```

### Bước 2: Sử dụng trong Component bất kỳ

```jsx
import { useLiveChat } from "../contexts/LiveChatContext";

function AnyComponent() {
  const { openChat, unreadCount } = useLiveChat();

  return (
    <button onClick={openChat}>
      Chat với chúng tôi
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </button>
  );
}
```

## 🎨 Tính năng Widget

### ✅ User Features:

- ✨ Nút chat tròn floating góc phải dưới
- 💬 Giao diện chat đẹp như Intercom/LiveChat
- 📱 Responsive (mobile/desktop)
- 🔔 Unread message badge
- ⏰ Real-time messaging với Socket.io
- 👁️ Typing indicator
- ✓✓ Message read receipts
- 🌟 Rating system sau khi kết thúc chat
- 🎭 Emoji support
- 📅 Date separators
- 🔄 Auto-scroll to new messages

### 🎯 Chat Flow:

1. User click nút chat
2. Tự động tạo conversation (status: pending)
3. Admin nhận thông báo có khách mới
4. Admin accept conversation (status: active)
5. Bắt đầu chat real-time
6. Kết thúc chat (status: closed)
7. User đánh giá dịch vụ (1-5 sao + feedback)

## 🛠️ Backend API Endpoints

### User APIs:

- `GET /api/livechat/conversations` - Lấy danh sách conversations
- `GET /api/livechat/conversations/:id` - Chi tiết conversation
- `GET /api/livechat/conversations/:id/messages` - Lấy messages
- `POST /api/livechat/conversations/:id/rate` - Đánh giá

### Admin APIs:

- `GET /api/livechat/admin/pending` - Conversations đang chờ
- `GET /api/livechat/admin/active` - Conversations đang chat
- `GET /api/livechat/admin/stats` - Thống kê tổng quan

## 🔌 Socket.io Events

### User Events:

- `user:joinChat` - Join vào chat room
- `chat:sendMessage` - Gửi tin nhắn
- `chat:typing` - Đang gõ
- `chat:markAsRead` - Đánh dấu đã đọc
- `chat:closeConversation` - Đóng conversation
- `chat:rateConversation` - Đánh giá

### Admin Events:

- `admin:joinRoom` - Join vào admin room
- `admin:acceptConversation` - Nhận conversation
- `admin:newConversation` - Nhận thông báo khách mới
- `admin:newMessageNotification` - Tin nhắn mới

### Broadcast Events (receive):

- `chat:newMessage` - Nhận tin nhắn mới
- `chat:systemMessage` - Tin nhắn hệ thống
- `chat:userTyping` - Người kia đang gõ
- `chat:messagesRead` - Tin nhắn đã được đọc
- `chat:conversationClosed` - Conversation đóng

## 📊 Database Schema

### Conversation Model:

```javascript
{
  user: { userId, email, name, socketId },
  admin: { userId, email, name, socketId },
  status: "pending" | "active" | "closed",
  subject: String,
  priority: "low" | "normal" | "high" | "urgent",
  tags: [String],
  lastMessageAt: Date,
  messageCount: Number,
  unreadCountUser: Number,
  unreadCountAdmin: Number,
  rating: Number (1-5),
  feedback: String
}
```

### ChatMessage Model:

```javascript
{
  conversationId: ObjectId,
  sender: { userId, role: "user"|"admin", name, avatar },
  messageType: "text" | "image" | "file" | "system",
  content: { text, fileUrl, fileName },
  isRead: Boolean,
  readAt: Date,
  isSystem: Boolean,
  replyTo: ObjectId
}
```

## 🎨 Customization

### Đổi màu chủ đạo:

```css
/* LiveChatWidget.css */
.chat-widget-button {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### Đổi vị trí widget:

```css
.chat-widget-button {
  bottom: 24px;
  right: 24px; /* Hoặc left: 24px */
}
```

## 📝 TODO: Admin Dashboard

Tạo trang admin để:

- ✅ Xem danh sách conversations pending
- ✅ Accept và chat với khách hàng
- ✅ Xem thống kê (pending, active, closed, rating)
- ✅ Quản lý nhiều conversations cùng lúc
- ✅ Search/filter conversations
- ✅ Xem lịch sử chat

---

**Tác giả**: ViePropChain Development Team  
**Ngày tạo**: November 29, 2025  
**Version**: 1.0.0
