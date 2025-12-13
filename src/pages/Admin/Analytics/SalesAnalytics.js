import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Analytics.css";

const SalesAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Giả lập dữ liệu
      setTimeout(() => {
        setAnalytics({
          totalSales: 45,
          totalValue: 125000000000,
          avgPrice: 2777777777,
          topSellingType: "Căn hộ",
          conversionRate: 12.5,
          salesByType: [
            { type: "Căn hộ", count: 20, value: 55000000000 },
            { type: "Nhà riêng", count: 15, value: 45000000000 },
            { type: "Đất nền", count: 8, value: 20000000000 },
            { type: "Biệt thự", count: 2, value: 5000000000 },
          ],
          salesByLocation: [
            { city: "TP. Hồ Chí Minh", count: 18, value: 50000000000 },
            { city: "Hà Nội", count: 15, value: 42000000000 },
            { city: "Đà Nẵng", count: 8, value: 23000000000 },
            { city: "Khác", count: 4, value: 10000000000 },
          ],
          dailySales: [
            { date: "24/11", count: 3, value: 8500000000 },
            { date: "25/11", count: 5, value: 12000000000 },
            { date: "26/11", count: 2, value: 6000000000 },
            { date: "27/11", count: 4, value: 10500000000 },
            { date: "28/11", count: 6, value: 15000000000 },
            { date: "29/11", count: 4, value: 11000000000 },
            { date: "30/11", count: 3, value: 9000000000 },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `${(amount / 1000000000).toFixed(2)} tỷ`;
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải phân tích...</p>
        </div>
      </div>
    );
  }

  const maxDailyValue = Math.max(...analytics.dailySales.map((d) => d.value));

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>📊 Phân tích Bán hàng</h1>
          <p>Thông tin chi tiết về hiệu suất bán hàng</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-select"
        >
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
          <option value="quarter">3 tháng qua</option>
          <option value="year">12 tháng qua</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card sales">
          <div className="kpi-icon">🏠</div>
          <div className="kpi-content">
            <p className="kpi-label">Tổng số giao dịch</p>
            <h2 className="kpi-value">{analytics.totalSales}</h2>
            <span className="kpi-trend up">↗ +15% so với kỳ trước</span>
          </div>
        </div>

        <div className="kpi-card value">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <p className="kpi-label">Tổng giá trị bán</p>
            <h2 className="kpi-value">
              {formatCurrency(analytics.totalValue)}
            </h2>
            <span className="kpi-trend up">↗ +23% so với kỳ trước</span>
          </div>
        </div>

        <div className="kpi-card avg">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <p className="kpi-label">Giá trung bình</p>
            <h2 className="kpi-value">{formatCurrency(analytics.avgPrice)}</h2>
            <span className="kpi-trend up">↗ +8% so với kỳ trước</span>
          </div>
        </div>

        <div className="kpi-card conversion">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-content">
            <p className="kpi-label">Tỷ lệ chuyển đổi</p>
            <h2 className="kpi-value">{analytics.conversionRate}%</h2>
            <span className="kpi-trend down">↘ -2% so với kỳ trước</span>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="chart-section">
        <h3>📈 Sales Performance Chart - Hiệu suất Bán hàng</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={analytics.dailySales}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#764ba2" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: "13px", fontWeight: "600" }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#6b7280"
              style={{ fontSize: "13px", fontWeight: "600" }}
              tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              style={{ fontSize: "13px", fontWeight: "600" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="custom-tooltip">
                      <p className="tooltip-label">{payload[0].payload.date}</p>
                      <p className="tooltip-value">
                        {payload[0].payload.count} giao dịch
                      </p>
                      <p className="tooltip-amount">
                        {formatCurrency(payload[0].value)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="value"
              fill="url(#colorBar)"
              radius={[8, 8, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 5 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="analysis-grid">
        {/* Sales by Type */}
        <div className="analysis-card">
          <h3>🏘️ Theo Loại BĐS</h3>
          <div className="breakdown-list">
            {analytics.salesByType.map((item, idx) => {
              const maxCount = Math.max(
                ...analytics.salesByType.map((s) => s.count)
              );
              const widthPercent = (item.count / maxCount) * 100;
              return (
                <div key={idx} className="breakdown-item">
                  <div className="item-header">
                    <span className="item-name">{item.type}</span>
                    <span className="item-stats">{item.count} giao dịch</span>
                  </div>
                  <div className="item-bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${widthPercent}%` }}
                    ></div>
                  </div>
                  <div className="item-value">{formatCurrency(item.value)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales by Location */}
        <div className="analysis-card">
          <h3>📍 Theo Khu vực</h3>
          <div className="breakdown-list">
            {analytics.salesByLocation.map((item, idx) => {
              const maxCount = Math.max(
                ...analytics.salesByLocation.map((s) => s.count)
              );
              const widthPercent = (item.count / maxCount) * 100;
              return (
                <div key={idx} className="breakdown-item">
                  <div className="item-header">
                    <span className="item-name">{item.city}</span>
                    <span className="item-stats">{item.count} giao dịch</span>
                  </div>
                  <div className="item-bar">
                    <div
                      className="bar-fill location"
                      style={{ width: `${widthPercent}%` }}
                    ></div>
                  </div>
                  <div className="item-value">{formatCurrency(item.value)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="insights-section">
        <h3>💡 Thông tin Chi tiết</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon success">✅</div>
            <div className="insight-content">
              <h4>Loại BĐS bán chạy nhất</h4>
              <p>
                <strong>{analytics.topSellingType}</strong> với{" "}
                {analytics.salesByType[0].count} giao dịch
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon warning">⚡</div>
            <div className="insight-content">
              <h4>Khu vực tiềm năng</h4>
              <p>
                <strong>Đà Nẵng</strong> tăng trưởng 45% so với tháng trước
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon info">📊</div>
            <div className="insight-content">
              <h4>Xu hướng giá</h4>
              <p>
                Giá trung bình tăng <strong>8%</strong> trong 30 ngày qua
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
