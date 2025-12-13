import React, { useState, useEffect } from "react";
import { API_GATEWAY_URL } from "../../../config/api";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("viepropchain_token");

      const response = await fetch(
        `${API_GATEWAY_URL}/api/user-management/users?page=${pagination.page}&limit=${pagination.limit}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
        setError("");
      } else {
        setError(data.error || "Không thể tải danh sách người dùng");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by type
    if (filter !== "ALL") {
      switch (filter) {
        case "WITH_WALLET":
          filtered = filtered.filter((user) => user.walletAddress);
          break;
        case "NO_WALLET":
          filtered = filtered.filter((user) => !user.walletAddress);
          break;
        case "VERIFIED":
          filtered = filtered.filter((user) => user.emailVerified);
          break;
        case "ADMINS":
          filtered = filtered.filter((user) => user.role === "admin");
          break;
        default:
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.profile?.displayName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address) => {
    if (!address) return "Chưa liên kết";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      user: { text: "Người dùng", class: "role-user" },
      admin: { text: "Quản trị", class: "role-admin" },
      agent: { text: "Đại lý", class: "role-agent" },
    };

    const roleInfo = roleMap[role] || { text: role, class: "" };
    return (
      <span className={`role-badge ${roleInfo.class}`}>{roleInfo.text}</span>
    );
  };

  const getAuthMethods = (authMethods) => {
    if (!authMethods || authMethods.length === 0) return [];

    return authMethods.map((method) => ({
      type: method.type,
      icon: method.type === "google" ? "🔗" : "🔗",
      text: method.type === "google" ? "Google" : "Wallet",
      linkedAt: method.linkedAt,
    }));
  };

  const openUserDetail = (user) => {
    setSelectedUser(user);
  };

  const closeUserDetail = () => {
    setSelectedUser(null);
  };

  const updateUserRole = async (userId, newRole) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn thay đổi quyền thành "${
          newRole === "admin" ? "Quản trị" : "Người dùng"
        }"?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("viepropchain_token");
      const response = await fetch(
        `${API_GATEWAY_URL}/api/user-management/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update user in state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );

        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }

        alert(
          `✅ Đã cập nhật quyền thành công! User hiện là ${
            newRole === "admin" ? "Quản trị viên" : "Người dùng"
          }.`
        );
      } else {
        alert("❌ Lỗi: " + (data.error || data.message));
      }
    } catch (error) {
      alert("❌ Lỗi kết nối: " + error.message);
    }
  };

  const changePage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div className="header-icon">👥</div>
        <div className="header-content">
          <h1>Quản lý Người dùng</h1>
          <p>Quản lý tất cả người dùng trong hệ thống</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={fetchUsers} className="btn-retry">
            Thử lại
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-number">{pagination.total}</div>
          <div className="stat-label">Tổng người dùng</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {users.filter((u) => u.walletAddress).length}
          </div>
          <div className="stat-label">Đã liên kết wallet</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {users.filter((u) => u.emailVerified).length}
          </div>
          <div className="stat-label">Email verified</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="stat-label">Quản trị viên</div>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo email, tên, wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filter === "ALL" ? "active" : ""}
            onClick={() => setFilter("ALL")}
          >
            Tất cả
          </button>
          <button
            className={filter === "WITH_WALLET" ? "active" : ""}
            onClick={() => setFilter("WITH_WALLET")}
          >
            Có wallet
          </button>
          <button
            className={filter === "NO_WALLET" ? "active" : ""}
            onClick={() => setFilter("NO_WALLET")}
          >
            Chưa có wallet
          </button>
          <button
            className={filter === "VERIFIED" ? "active" : ""}
            onClick={() => setFilter("VERIFIED")}
          >
            Verified
          </button>
          <button
            className={filter === "ADMINS" ? "active" : ""}
            onClick={() => setFilter("ADMINS")}
          >
            Admin
          </button>
        </div>

        <button onClick={fetchUsers} className="btn-refresh">
          🔄 Làm mới
        </button>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>📭 Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Wallet</th>
                <th>Role</th>
                <th>Auth Methods</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="user-row">
                  <td className="user-info">
                    <div className="user-avatar">
                      <img
                        src={
                          user.profile?.picture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.profile?.displayName || user.email
                          )}&background=4299e1&color=fff`
                        }
                        alt="Avatar"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.profile?.displayName || user.email
                          )}&background=4299e1&color=fff`;
                        }}
                      />
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.profile?.displayName ||
                          user.profile?.name ||
                          "Chưa có tên"}
                      </div>
                      <div className="user-id">
                        ID: {user._id.substring(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className="user-email">
                    <div className="email-container">
                      <span className="email">{user.email}</span>
                      {user.emailVerified && (
                        <span className="verified-badge">✅</span>
                      )}
                    </div>
                  </td>
                  <td className="user-wallet">
                    <code className="wallet-address">
                      {formatAddress(user.walletAddress)}
                    </code>
                    {user.walletLinkedAt && (
                      <div className="wallet-linked-date">
                        Liên kết: {formatDate(user.walletLinkedAt)}
                      </div>
                    )}
                  </td>
                  <td className="user-role">{getRoleBadge(user.role)}</td>
                  <td className="user-auth-methods">
                    <div className="auth-methods">
                      {getAuthMethods(user.authMethods).map((method, idx) => (
                        <span key={idx} className="auth-method">
                          {method.icon} {method.text}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="user-created">{formatDate(user.createdAt)}</td>
                  <td className="user-actions">
                    <button
                      onClick={() => openUserDetail(user)}
                      className="btn-action view"
                      title="Xem chi tiết"
                    >
                      Xem chi tiết
                    </button>
                    {user.role !== "admin" ? (
                      <button
                        onClick={() => updateUserRole(user._id, "admin")}
                        className="btn-action promote"
                        title="Cấp quyền Admin"
                      >
                        Cấp quyền Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserRole(user._id, "user")}
                        className="btn-action demote"
                        title="Gỡ quyền Admin"
                      >
                        Gỡ quyền Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => changePage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-pagination"
          >
            ← Trước
          </button>

          <span className="pagination-info">
            Trang {pagination.page} / {pagination.totalPages} (
            {pagination.total} người dùng)
          </span>

          <button
            onClick={() => changePage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn-pagination"
          >
            Sau →
          </button>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={closeUserDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeUserDetail}>
              ✕
            </button>

            <div className="modal-body">
              {/* Hero Header with Avatar */}
              <div className="user-detail-hero">
                <div className="hero-background"></div>
                <div className="hero-content">
                  <div className="avatar-wrapper">
                    <img
                      src={
                        selectedUser.profile?.picture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          selectedUser.profile?.displayName ||
                            selectedUser.email
                        )}&background=gradient&color=fff&size=200&bold=true`
                      }
                      alt="Avatar"
                      className="user-detail-avatar"
                    />
                    <div className="avatar-status-badge"></div>
                  </div>
                  <div className="user-detail-info">
                    <h2 className="user-detail-name">
                      {selectedUser.profile?.displayName ||
                        selectedUser.profile?.name ||
                        "Chưa có tên"}
                    </h2>
                    <p className="user-detail-email">
                      <span className="email-icon">✉️</span>
                      {selectedUser.email}
                      {selectedUser.emailVerified && (
                        <span className="verified-badge-inline">
                          ✓ Verified
                        </span>
                      )}
                    </p>
                    <div className="user-meta">
                      {getRoleBadge(selectedUser.role)}
                      <span className="user-id-badge">
                        ID: {selectedUser._id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="detail-cards-grid">
                {/* Account Information Card */}
                <div className="detail-card">
                  <div className="card-header">
                    <div
                      className="card-icon"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      👤
                    </div>
                    <h3>Thông tin tài khoản</h3>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="info-label">🆔 User ID</span>
                      <code className="info-value mono">
                        {selectedUser._id}
                      </code>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📅 Ngày tạo</span>
                      <span className="info-value">
                        {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">⏰ Đăng nhập cuối</span>
                      <span className="info-value">
                        {selectedUser.lastLoginAt
                          ? formatDate(selectedUser.lastLoginAt)
                          : "Chưa có"}
                      </span>
                    </div>
                    {selectedUser.googleId && (
                      <div className="info-row">
                        <span className="info-label">🔗 Google ID</span>
                        <code className="info-value mono">
                          {selectedUser.googleId}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Wallet Card */}
                {selectedUser.walletAddress ? (
                  <div className="detail-card">
                    <div className="card-header">
                      <div
                        className="card-icon"
                        style={{
                          background:
                            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        }}
                      >
                        💳
                      </div>
                      <h3>Blockchain Wallet</h3>
                    </div>
                    <div className="card-body">
                      <div className="wallet-address-display">
                        <div className="wallet-label">Địa chỉ Wallet</div>
                        <div className="wallet-value-group">
                          <code className="wallet-address-full">
                            {selectedUser.walletAddress}
                          </code>
                          <button
                            className="btn-copy-modern"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                selectedUser.walletAddress
                              );
                              alert("✅ Đã copy địa chỉ wallet!");
                            }}
                            title="Copy địa chỉ"
                          >
                            📋 Copy
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span className="info-label">📆 Liên kết lúc</span>
                        <span className="info-value">
                          {formatDate(selectedUser.walletLinkedAt)}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">🔢 Nonce</span>
                        <code className="info-value mono">
                          {selectedUser.nonce}
                        </code>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="detail-card empty-card">
                    <div className="card-header">
                      <div
                        className="card-icon"
                        style={{
                          background:
                            "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                        }}
                      >
                        💳
                      </div>
                      <h3>Blockchain Wallet</h3>
                    </div>
                    <div className="card-body empty-state-card">
                      <div className="empty-icon">🔗</div>
                      <p className="empty-text">Chưa liên kết ví blockchain</p>
                    </div>
                  </div>
                )}

                {/* Authentication Methods Card */}
                <div className="detail-card">
                  <div className="card-header">
                    <div
                      className="card-icon"
                      style={{
                        background:
                          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      }}
                    >
                      🔐
                    </div>
                    <h3>Phương thức xác thực</h3>
                  </div>
                  <div className="card-body">
                    {selectedUser.authMethods &&
                    selectedUser.authMethods.length > 0 ? (
                      <div className="auth-methods-list">
                        {selectedUser.authMethods.map((method, idx) => (
                          <div key={idx} className="auth-method-card">
                            <div className="auth-icon">
                              {method.type === "google" ? "🔗" : "💼"}
                            </div>
                            <div className="auth-info">
                              <div className="auth-type">
                                {method.type === "google"
                                  ? "Google OAuth"
                                  : "Wallet Sign"}
                              </div>
                              <div className="auth-date">
                                Liên kết: {formatDate(method.linkedAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state-card">
                        <div className="empty-icon">🔐</div>
                        <p className="empty-text">
                          Chưa có phương thức xác thực
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Card */}
                {(selectedUser.profile?.phone ||
                  selectedUser.profile?.bio ||
                  selectedUser.favorites?.length > 0) && (
                  <div className="detail-card">
                    <div className="card-header">
                      <div
                        className="card-icon"
                        style={{
                          background:
                            "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                        }}
                      >
                        ℹ️
                      </div>
                      <h3>Thông tin bổ sung</h3>
                    </div>
                    <div className="card-body">
                      {selectedUser.profile?.phone && (
                        <div className="info-row">
                          <span className="info-label">📱 Điện thoại</span>
                          <span className="info-value">
                            {selectedUser.profile.phone}
                          </span>
                        </div>
                      )}
                      {selectedUser.favorites &&
                        selectedUser.favorites.length > 0 && (
                          <div className="info-row">
                            <span className="info-label">❤️ Yêu thích</span>
                            <span className="info-value highlight">
                              {selectedUser.favorites.length} bất động sản
                            </span>
                          </div>
                        )}
                      {selectedUser.profile?.bio && (
                        <div className="info-row vertical">
                          <span className="info-label">📝 Bio</span>
                          <p className="info-value bio-text">
                            {selectedUser.profile.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="modal-footer">
                <div className="role-update-section">
                  <label className="role-label" htmlFor="roleSelect">
                    <span className="label-icon">👑</span>
                    Cập nhật quyền:
                  </label>
                  <select
                    id="roleSelect"
                    value={selectedUser.role}
                    onChange={(e) =>
                      updateUserRole(selectedUser._id, e.target.value)
                    }
                    className="role-select-modern"
                  >
                    <option value="user">👤 Người dùng</option>
                    <option value="agent">🏢 Đại lý</option>
                    <option value="admin">👑 Quản trị viên</option>
                  </select>
                </div>
                <button onClick={closeUserDetail} className="btn-close-modern">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
