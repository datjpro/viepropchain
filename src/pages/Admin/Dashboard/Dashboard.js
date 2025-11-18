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
        <h2>⚡ Thao tác nhanh</h2>
        <div className="actions-grid">
          <a href="/admin/nft" className="action-card">
            <div className="action-icon">🎨</div>
            <div className="action-title">Tạo NFT mới</div>
            <div className="action-desc">Mint NFT cho BĐS</div>
          </a>

          <a href="/admin/list-nft" className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-title">Quản lý NFT</div>
            <div className="action-desc">Xem tất cả NFT</div>
          </a>

          <a href="/admin/users" className="action-card">
            <div className="action-icon">👥</div>
            <div className="action-title">Quản lý User</div>
            <div className="action-desc">Xem người dùng</div>
          </a>

          <a href="/admin/properties" className="action-card">
            <div className="action-icon">🏠</div>
            <div className="action-title">Quản lý BĐS</div>
            <div className="action-desc">Properties database</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
