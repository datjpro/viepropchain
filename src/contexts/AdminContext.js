import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  // 🔒 ADMIN EMAIL - CHỈ TÀI KHOẢN NÀY MỚI CÓ QUYỀN ADMIN
  const ADMIN_EMAILS = React.useMemo(
    () => [
      "todat2207@gmail.com", // Super Admin - Full Access
    ],
    []
  );

  // Check xem user hiện tại có phải admin không
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !isAuthenticated) {
        setIsAdmin(false);
        return;
      }

      setIsCheckingAdmin(true);

      try {
        // Kiểm tra xem email có trong danh sách admin không
        const isInAdminList = ADMIN_EMAILS.includes(user.email?.toLowerCase());

        // Hoặc check từ role trong user object
        const isAdminRole = user.role === "admin";

        setIsAdmin(isInAdminList || isAdminRole);

        console.log("🔐 Admin check:", {
          email: user.email,
          role: user.role,
          isAdmin: isInAdminList || isAdminRole,
        });
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, isAuthenticated, ADMIN_EMAILS]);

  const value = {
    isAdmin,
    isCheckingAdmin,
    ADMIN_EMAILS,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
