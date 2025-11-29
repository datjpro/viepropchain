/**
 * ========================================================================
 * LIVE CHAT CONTEXT
 * Quản lý trạng thái chat toàn cục (đóng/mở, messages, notifications)
 * ========================================================================
 */

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import io from "socket.io-client";
import { API_GATEWAY_URL } from "../config/api";

const LiveChatContext = createContext();

export const useLiveChat = () => {
  const context = useContext(LiveChatContext);
  if (!context) {
    throw new Error("useLiveChat must be used within LiveChatProvider");
  }
  return context;
};

export const LiveChatProvider = ({ children }) => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [isOpen, setIsOpen] = useState(false); // Widget đóng/mở
  const [isConnected, setIsConnected] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ============================================================
  // SOCKET CONNECTION
  // ============================================================
  const connectSocket = useCallback(() => {
    const token = localStorage.getItem("viepropchain_token");

    if (!token) {
      console.warn("⚠️ No token found, cannot connect to chat");
      return;
    }

    if (socketRef.current?.connected) {
      console.log("✅ Socket already connected");
      return;
    }

    const socket = io(`${API_GATEWAY_URL.replace("/api", "")}`, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Live Chat Socket Connected");
      setIsConnected(true);

      // Tự động join chat khi kết nối
      const user = JSON.parse(
        localStorage.getItem("viepropchain_user") || "{}"
      );
      if (user._id) {
        socket.emit(
          "user:joinChat",
          {
            userId: user._id,
            email: user.email,
            name: user.profile?.displayName || user.email,
          },
          (response) => {
            if (response.success) {
              setConversation(response.conversation);
              console.log("📩 Joined conversation:", response.conversation._id);
            }
          }
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Live Chat Socket Disconnected");
      setIsConnected(false);
    });

    // Nhận tin nhắn mới
    socket.on("chat:newMessage", ({ message }) => {
      setMessages((prev) => [...prev, message]);

      // Nếu widget đang đóng hoặc minimize, tăng unread count
      if (!isOpen || isMinimized) {
        setUnreadCount((prev) => prev + 1);

        // Hiển thị notification
        if (Notification.permission === "granted") {
          new Notification("Tin nhắn mới từ hỗ trợ", {
            body: message.content.text,
            icon: "/logo.png",
          });
        }
      }
    });

    // Admin đã join
    socket.on("chat:systemMessage", ({ message, adminJoined }) => {
      setMessages((prev) => [...prev, message]);
      if (adminJoined) {
        console.log("✅ Admin joined the conversation");
      }
    });

    // Typing indicator
    socket.on("chat:userTyping", ({ userName, isTyping: typing }) => {
      setIsTyping(typing);

      if (typing) {
        // Auto clear sau 3s
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    // Messages được đánh dấu đã đọc
    socket.on("chat:messagesRead", ({ readBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender.role !== "user"
            ? { ...msg, isRead: true, readAt: new Date() }
            : msg
        )
      );
    });

    // Conversation đóng
    socket.on("chat:conversationClosed", ({ message }) => {
      setMessages((prev) => [...prev, message]);
      if (conversation) {
        setConversation({ ...conversation, status: "closed" });
      }
    });

    socketRef.current = socket;
  }, [isOpen, isMinimized, conversation]);

  useEffect(() => {
    const token = localStorage.getItem("viepropchain_token");
    if (token) {
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connectSocket]);

  // ============================================================
  // CHAT ACTIONS
  // ============================================================

  /**
   * Mở widget chat
   */
  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);

    // Load messages nếu chưa có
    if (conversation && messages.length === 0) {
      loadMessages(conversation._id);
    }

    // Đánh dấu đã đọc
    if (conversation && socketRef.current) {
      socketRef.current.emit("chat:markAsRead", {
        conversationId: conversation._id,
        role: "user",
      });
    }
  }, [conversation, messages]);

  /**
   * Đóng widget
   */
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Minimize widget
   */
  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  /**
   * Load tin nhắn từ server
   */
  const loadMessages = useCallback(async (conversationId) => {
    try {
      const token = localStorage.getItem("viepropchain_token");
      const response = await fetch(
        `${API_GATEWAY_URL}/livechat/conversations/${conversationId}/messages?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error);
    }
  }, []);

  /**
   * Gửi tin nhắn
   */
  const sendMessage = useCallback(
    (text) => {
      if (!socketRef.current || !conversation) {
        console.error("❌ Socket not connected or no conversation");
        return;
      }

      const user = JSON.parse(
        localStorage.getItem("viepropchain_user") || "{}"
      );

      socketRef.current.emit(
        "chat:sendMessage",
        {
          conversationId: conversation._id,
          senderId: user._id,
          senderRole: "user",
          senderName: user.profile?.displayName || user.email,
          senderAvatar: user.profile?.picture,
          messageType: "text",
          content: {
            text,
          },
        },
        (response) => {
          if (!response.success) {
            console.error("❌ Send message failed:", response.error);
          }
        }
      );
    },
    [conversation]
  );

  /**
   * Gửi typing indicator
   */
  const sendTyping = useCallback(
    (isTypingNow) => {
      if (!socketRef.current || !conversation) return;

      const user = JSON.parse(
        localStorage.getItem("viepropchain_user") || "{}"
      );

      socketRef.current.emit("chat:typing", {
        conversationId: conversation._id,
        userName: user.profile?.displayName || user.email,
        isTyping: isTypingNow,
      });
    },
    [conversation]
  );

  /**
   * Đóng conversation
   */
  const closeConversation = useCallback(() => {
    if (!socketRef.current || !conversation) return;

    const user = JSON.parse(localStorage.getItem("viepropchain_user") || "{}");

    socketRef.current.emit(
      "chat:closeConversation",
      {
        conversationId: conversation._id,
        closedBy: user._id,
        role: "user",
      },
      (response) => {
        if (response.success) {
          setConversation({ ...conversation, status: "closed" });
        }
      }
    );
  }, [conversation]);

  /**
   * Đánh giá conversation
   */
  const rateConversation = useCallback(
    async (rating, feedback) => {
      if (!conversation) return;

      try {
        const token = localStorage.getItem("viepropchain_token");
        const response = await fetch(
          `${API_GATEWAY_URL}/livechat/conversations/${conversation._id}/rate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating, feedback }),
          }
        );
        const data = await response.json();

        if (data.success) {
          console.log("✅ Rating submitted successfully");
          setConversation({ ...conversation, rating, feedback });
        }
      } catch (error) {
        console.error("❌ Error rating conversation:", error);
      }
    },
    [conversation]
  );

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  const value = {
    // State
    isOpen,
    isConnected,
    conversation,
    messages,
    unreadCount,
    isTyping,
    isMinimized,

    // Actions
    openChat,
    closeChat,
    minimizeChat,
    sendMessage,
    sendTyping,
    closeConversation,
    rateConversation,
    loadMessages,
  };

  return (
    <LiveChatContext.Provider value={value}>
      {children}
    </LiveChatContext.Provider>
  );
};

export default LiveChatContext;
