import React, { useState, useEffect } from "react";
import AdminStatusChecker from "../../../components/AdminStatusChecker/AdminStatusChecker";
import { API_ENDPOINTS } from "../../../config/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    loading: true,
    properties: { total: 0, minted: 0, forSale: 0, sold: 0 },
    users: { total: 0, withWallet: 0, verified: 0 },
    nfts: { total: 0, transfers: 0 },
    revenue: { total: 0, thisMonth: 0 },
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      // Fetch properties stats từ admin service via API Gateway
      const propertiesResponse = await fetch(
        API_ENDPOINTS.ADMIN.PROPERTIES_STATS
      );
      const propertiesData = await propertiesResponse.json();

      // Fetch users stats từ auth service via API Gateway
      const usersResponse = await fetch(API_ENDPOINTS.AUTH.STATS);
      const usersData = await usersResponse.json();

      // Fetch NFTs stats từ blockchain service via API Gateway
      const nftsResponse = await fetch(API_ENDPOINTS.BLOCKCHAIN.TOTAL_SUPPLY);
      const nftsData = await nftsResponse.json();

      // Check system health
      await checkSystemHealth();

      setStats({
        loading: false,
        properties: {
          total: propertiesData.data?.total || 0,
          minted: propertiesData.data?.minted || 0,
          forSale: propertiesData.data?.forSale || 0,
          sold: propertiesData.data?.sold || 0,
        },
        users: {
          total: usersData.data?.total || 0,
          withWallet: usersData.data?.withWallet || 0,
          verified: usersData.data?.verified || 0,
        },
        nfts: {
          total: nftsData.data?.totalSupply || 0,
          transfers: 0, // TODO: get from indexer service
        },
        revenue: {
          total: 0, // TODO: calculate from sales
          thisMonth: 0,
        },
      });

      // Fetch recent activities
      await fetchRecentActivities();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const checkSystemHealth = async () => {
    const services = [
      { name: "Admin Service", url: API_ENDPOINTS.ADMIN.HEALTH },
      { name: "Auth Service", url: API_ENDPOINTS.AUTH.HEALTH },
      { name: "Blockchain Service", url: API_ENDPOINTS.BLOCKCHAIN.HEALTH },
      { name: "Marketplace Service", url: API_ENDPOINTS.MARKETPLACE.HEALTH },
      { name: "IPFS Service", url: API_ENDPOINTS.IPFS.HEALTH },
    ];

    const healthChecks = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const response = await fetch(service.url, {
            method: "GET",
            timeout: 5000,
          });
          return {
            name: service.name,
            status: response.ok ? "healthy" : "unhealthy",
            responseTime: Date.now(),
          };
        } catch (error) {
          return {
            name: service.name,
            status: "down",
            error: error.message,
          };
        }
      })
    );

    const health = {};
    healthChecks.forEach((result, index) => {
      if (result.status === "fulfilled") {
        health[services[index].name] = result.value;
      } else {
        health[services[index].name] = {
          name: services[index].name,
          status: "error",
          error: result.reason?.message,
        };
      }
    });

    setSystemHealth(health);
  };

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent properties via API Gateway
      const propertiesResponse = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}?limit=5&sort=createdAt:-1`
      );
      const propertiesData = await propertiesResponse.json();

      // Fetch recent users via API Gateway
      const usersResponse = await fetch(
        `${API_ENDPOINTS.AUTH.USERS_RECENT}?limit=5`
      );
      const usersData = await usersResponse.json();

      const activities = [];

      // Add property activities
      if (propertiesData.success) {
        propertiesData.data.forEach((property) => {
          activities.push({
            id: `prop_${property._id}`,
            type: "property",
            action: property.nft?.isMinted ? "NFT Minted" : "Property Created",
            description: `${property.name} - ${property.propertyType}`,
            timestamp: property.nft?.mintedAt || property.createdAt,
            icon: property.nft?.isMinted ? "🎨" : "🏠",
            status: property.status,
          });
        });
      }

      // Add user activities
      if (usersData.success) {
        usersData.data.forEach((user) => {
          activities.push({
            id: `user_${user._id}`,
            type: "user",
            action: user.walletAddress ? "Wallet Linked" : "User Registered",
            description: `${user.profile?.displayName || user.email}`,
            timestamp: user.walletLinkedAt || user.createdAt,
            icon: user.walletAddress ? "🔗" : "👤",
            status: "active",
          });
        });
      }

      // Sort by timestamp and take latest 10
      activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
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

  if (stats.loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard Admin</h1>
        <p>Tổng quan hệ thống ViePropChain</p>
        <button onClick={fetchDashboardData} className="btn-refresh">
          🔄 Làm mới
        </button>
      </div>

      {/* Admin Status Checker - Debug Tool */}
      <AdminStatusChecker />

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card properties">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <div className="stat-number">{stats.properties.total}</div>
            <div className="stat-label">Tổng BĐS</div>
            <div className="stat-details">
              <span>📋 Đã mint: {stats.properties.minted}</span>
              <span>🏪 Đang bán: {stats.properties.forSale}</span>
              <span>✅ Đã bán: {stats.properties.sold}</span>
            </div>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.users.total}</div>
            <div className="stat-label">Người dùng</div>
            <div className="stat-details">
              <span>🔗 Có wallet: {stats.users.withWallet}</span>
              <span>✅ Verified: {stats.users.verified}</span>
            </div>
          </div>
        </div>

        <div className="stat-card nfts">
          <div className="stat-icon">🎨</div>
          <div className="stat-content">
            <div className="stat-number">{stats.nfts.total}</div>
            <div className="stat-label">NFTs</div>
            <div className="stat-details">
              <span>🔄 Transfers: {stats.nfts.transfers}</span>
              <span>⛓️ On-chain</span>
            </div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">
              {(stats.revenue.total / 1000000000).toFixed(1)}B
            </div>
            <div className="stat-label">Doanh thu (VND)</div>
            <div className="stat-details">
              <span>
                📈 Tháng này:{" "}
                {(stats.revenue.thisMonth / 1000000000).toFixed(1)}B
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="system-health">
        <h2>🏥 Trạng thái hệ thống</h2>
        <div className="health-grid">
          {Object.entries(systemHealth).map(([serviceName, health]) => (
            <div key={serviceName} className={`health-card ${health.status}`}>
              <div className="health-name">{health.name}</div>
              <div className="health-status">
                {health.status === "healthy" && "✅ Hoạt động"}
                {health.status === "unhealthy" && "⚠️ Có vấn đề"}
                {health.status === "down" && "❌ Ngừng hoạt động"}
                {health.status === "error" && "🔥 Lỗi"}
              </div>
              {health.error && (
                <div className="health-error">{health.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h2>📝 Hoạt động gần đây</h2>
        <div className="activities-list">
          {recentActivities.length === 0 ? (
            <div className="no-activities">Chưa có hoạt động nào</div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-time">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  <div className="activity-description">
                    {activity.description}
                  </div>
                </div>
                <div className={`activity-status ${activity.status}`}>
                  {activity.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <a href="/admin/nft" className="action-card">
            <div className="action-icon">
              <svg
                style={{ width: "48px", height: "48px", color: "#3b82f6" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="action-title">Mint NFT</div>
            <div className="action-desc">Create a new NFT for a property</div>
          </a>

          <a href="/admin/properties" className="action-card">
            <div className="action-icon">
              <svg
                style={{ width: "48px", height: "48px", color: "#3b82f6" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <div className="action-title">Quản lý Bất động sản</div>
            <div className="action-desc">View and manage all properties</div>
          </a>

          <a
            href="/admin/marketplace"
            className="action-card"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            <div className="action-icon">
              <svg
                style={{ width: "48px", height: "48px", color: "#3b82f6" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="action-title">Quản lý Sàn niêm yết</div>
            <div className="action-desc">
              Oversee active marketplace listings
            </div>
          </a>

          <a href="/admin/users" className="action-card">
            <div className="action-icon">
              <svg
                style={{ width: "48px", height: "48px", color: "#3b82f6" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="action-title">Quản lý Người dùng</div>
            <div className="action-desc">View and manage platform users</div>
          </a>

          <a href="/admin/list-nft" className="action-card">
            <div className="action-icon">
              <svg
                style={{ width: "48px", height: "48px", color: "#3b82f6" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <div className="action-title">Quản lý NFT</div>
            <div className="action-desc">Browse the complete NFT ledger</div>
          </a>

          <a
            href="#"
            className="action-card"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            <div className="action-icon">
              <svg
                style={{ width: "48px", height: "48px", color: "#3b82f6" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="action-title">Transaction History</div>
            <div className="action-desc">View all platform transactions</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
