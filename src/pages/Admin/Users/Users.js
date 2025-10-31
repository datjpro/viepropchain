import React, { useState, useEffect } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
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
      const response = await fetch(
        `http://localhost:4010/api/auth/users?page=${pagination.page}&limit=${pagination.limit}`
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination((prev) => ({
          ...prev,
          total: data.data.total,
          totalPages: data.data.totalPages,
        }));
        setError("");
      } else {
        setError("Không thể tải danh sách người dùng");
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
    try {
      const response = await fetch(
        `http://localhost:4010/api/auth/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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

        alert("Cập nhật role thành công!");
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối: " + error.message);
    }
  };

  const changePage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="users-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="users-container">
        <div className="users-header">
          <h1>👥 Quản lý Người dùng</h1>
          <p>Quản lý tất cả người dùng trong hệ thống</p>
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
                    <td className="user-created">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="user-actions">
                      <button
                        onClick={() => openUserDetail(user)}
                        className="btn-action view"
                      >
                        👁️
                      </button>
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
                ×
              </button>

              <div className="modal-body">
                <div className="user-detail-header">
                  <img
                    src={
                      selectedUser.profile?.picture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedUser.profile?.displayName || selectedUser.email
                      )}&background=4299e1&color=fff&size=100`
                    }
                    alt="Avatar"
                    className="user-detail-avatar"
                  />
                  <div className="user-detail-info">
                    <h2>
                      {selectedUser.profile?.displayName ||
                        selectedUser.profile?.name ||
                        "Chưa có tên"}
                    </h2>
                    <p className="user-detail-email">{selectedUser.email}</p>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>

                <div className="user-detail-sections">
                  <div className="detail-section">
                    <h3>📧 Thông tin tài khoản</h3>
                    <div className="detail-item">
                      <strong>User ID:</strong>
                      <code>{selectedUser._id}</code>
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{selectedUser.email}</span>
                      {selectedUser.emailVerified && (
                        <span className="verified-badge">✅ Verified</span>
                      )}
                    </div>
                    <div className="detail-item">
                      <strong>Google ID:</strong>
                      <code>{selectedUser.googleId || "Chưa liên kết"}</code>
                    </div>
                    <div className="detail-item">
                      <strong>Ngày tạo:</strong>
                      <span>{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Đăng nhập lần cuối:</strong>
                      <span>
                        {selectedUser.lastLoginAt
                          ? formatDate(selectedUser.lastLoginAt)
                          : "Chưa có"}
                      </span>
                    </div>
                  </div>

                  {selectedUser.walletAddress && (
                    <div className="detail-section">
                      <h3>🔗 Thông tin Wallet</h3>
                      <div className="detail-item">
                        <strong>Wallet Address:</strong>
                        <code className="wallet-full">
                          {selectedUser.walletAddress}
                        </code>
                        <button
                          className="btn-copy"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedUser.walletAddress
                            );
                            alert("Đã copy wallet address!");
                          }}
                        >
                          📋
                        </button>
                      </div>
                      <div className="detail-item">
                        <strong>Liên kết lúc:</strong>
                        <span>{formatDate(selectedUser.walletLinkedAt)}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Nonce:</strong>
                        <code>{selectedUser.nonce}</code>
                      </div>
                    </div>
                  )}

                  <div className="detail-section">
                    <h3>🔐 Phương thức xác thực</h3>
                    {selectedUser.authMethods &&
                    selectedUser.authMethods.length > 0 ? (
                      selectedUser.authMethods.map((method, idx) => (
                        <div key={idx} className="auth-method-detail">
                          <strong>
                            {method.type === "google"
                              ? "🔗 Google OAuth"
                              : "🔗 Wallet"}
                          </strong>
                          <span>Liên kết: {formatDate(method.linkedAt)}</span>
                        </div>
                      ))
                    ) : (
                      <p>Chưa có phương thức xác thực</p>
                    )}
                  </div>

                  {selectedUser.favorites &&
                    selectedUser.favorites.length > 0 && (
                      <div className="detail-section">
                        <h3>❤️ Yêu thích</h3>
                        <p>
                          {selectedUser.favorites.length} bất động sản yêu thích
                        </p>
                      </div>
                    )}

                  {selectedUser.profile && (
                    <div className="detail-section">
                      <h3>👤 Profile</h3>
                      {selectedUser.profile.phone && (
                        <div className="detail-item">
                          <strong>Điện thoại:</strong>
                          <span>{selectedUser.profile.phone}</span>
                        </div>
                      )}
                      {selectedUser.profile.bio && (
                        <div className="detail-item">
                          <strong>Bio:</strong>
                          <span>{selectedUser.profile.bio}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="user-detail-actions">
                  <div className="role-update">
                    <label htmlFor="roleSelect">Cập nhật Role:</label>
                    <select
                      id="roleSelect"
                      value={selectedUser.role}
                      onChange={(e) =>
                        updateUserRole(selectedUser._id, e.target.value)
                      }
                      className="role-select"
                    >
                      <option value="user">Người dùng</option>
                      <option value="agent">Đại lý</option>
                      <option value="admin">Quản trị</option>
                    </select>
                  </div>

                  <button onClick={closeUserDetail} className="btn-close">
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Users;
