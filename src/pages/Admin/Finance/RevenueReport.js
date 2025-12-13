import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Finance.css";

const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalRentals: 0,
    platformFees: 0,
    transactions: [],
    monthlyRevenue: [],
  });

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      // Giả lập dữ liệu - thay bằng API thực tế
      setTimeout(() => {
        setRevenueData({
          totalRevenue: 15750000000,
          totalSales: 12500000000,
          totalRentals: 3250000000,
          platformFees: 787500000,
          transactions: 156,
          monthlyRevenue: [
            { month: "Tháng 7", revenue: 2500000000 },
            { month: "Tháng 8", revenue: 3200000000 },
            { month: "Tháng 9", revenue: 2800000000 },
            { month: "Tháng 10", revenue: 3500000000 },
            { month: "Tháng 11", revenue: 3750000000 },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching revenue:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `${(amount / 1000000000).toFixed(2)} tỷ VND`;
  };

  if (loading) {
    return (
      <div className="finance-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải báo cáo doanh thu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-container">
      {/* Header */}
      <div className="finance-header">
        <div className="header-content">
          <h1>💰 Báo cáo Doanh thu</h1>
          <p>Theo dõi và phân tích doanh thu nền tảng</p>
        </div>
        <div className="header-actions">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">12 tháng qua</option>
          </select>
          <button className="btn-export">📥 Xuất báo cáo</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="revenue-summary">
        <div className="summary-card total-revenue">
          <div className="card-icon">💎</div>
          <div className="card-content">
            <p className="card-label">Tổng Doanh thu</p>
            <h2 className="card-value">
              {formatCurrency(revenueData.totalRevenue)}
            </h2>
            <span className="card-change positive">
              +12.5% so với tháng trước
            </span>
          </div>
        </div>

        <div className="summary-card sales-revenue">
          <div className="card-icon">🏠</div>
          <div className="card-content">
            <p className="card-label">Doanh thu Bán</p>
            <h2 className="card-value">
              {formatCurrency(revenueData.totalSales)}
            </h2>
            <span className="card-change positive">+8.3%</span>
          </div>
        </div>

        <div className="summary-card rental-revenue">
          <div className="card-icon">🔑</div>
          <div className="card-content">
            <p className="card-label">Doanh thu Thuê</p>
            <h2 className="card-value">
              {formatCurrency(revenueData.totalRentals)}
            </h2>
            <span className="card-change positive">+15.7%</span>
          </div>
        </div>

        <div className="summary-card platform-fees">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <p className="card-label">Phí Nền tảng (5%)</p>
            <h2 className="card-value">
              {formatCurrency(revenueData.platformFees)}
            </h2>
            <span className="card-change">
              Từ {revenueData.transactions} giao dịch
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
        <div className="section-header">
          <h3>📈 Revenue Trend - Xu hướng Doanh thu</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={revenueData.monthlyRevenue}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: "13px", fontWeight: "600" }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "13px", fontWeight: "600" }}
              tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="custom-tooltip">
                      <p className="tooltip-label">
                        {payload[0].payload.month}
                      </p>
                      <p className="tooltip-value">
                        {formatCurrency(payload[0].value)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#667eea"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Breakdown */}
      <div className="breakdown-section">
        <h3>📊 Phân tích Chi tiết</h3>
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <h4>Theo Loại Giao dịch</h4>
            <div className="breakdown-item">
              <span className="item-label">Bán BĐS</span>
              <div className="progress-bar">
                <div
                  className="progress-fill sales"
                  style={{ width: "79%" }}
                ></div>
              </div>
              <span className="item-value">79%</span>
            </div>
            <div className="breakdown-item">
              <span className="item-label">Cho thuê BĐS</span>
              <div className="progress-bar">
                <div
                  className="progress-fill rental"
                  style={{ width: "21%" }}
                ></div>
              </div>
              <span className="item-value">21%</span>
            </div>
          </div>

          <div className="breakdown-card">
            <h4>Theo Loại BĐS</h4>
            <div className="breakdown-item">
              <span className="item-label">Căn hộ</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "45%" }}></div>
              </div>
              <span className="item-value">45%</span>
            </div>
            <div className="breakdown-item">
              <span className="item-label">Nhà riêng</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "30%" }}></div>
              </div>
              <span className="item-value">30%</span>
            </div>
            <div className="breakdown-item">
              <span className="item-label">Đất nền</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "25%" }}></div>
              </div>
              <span className="item-value">25%</span>
            </div>
          </div>

          <div className="breakdown-card">
            <h4>Theo Khu vực</h4>
            <div className="breakdown-item">
              <span className="item-label">TP. Hồ Chí Minh</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "40%" }}></div>
              </div>
              <span className="item-value">40%</span>
            </div>
            <div className="breakdown-item">
              <span className="item-label">Hà Nội</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "35%" }}></div>
              </div>
              <span className="item-value">35%</span>
            </div>
            <div className="breakdown-item">
              <span className="item-label">Đà Nẵng</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "15%" }}></div>
              </div>
              <span className="item-value">15%</span>
            </div>
            <div className="breakdown-item">
              <span className="item-label">Khác</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "10%" }}></div>
              </div>
              <span className="item-value">10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="top-performers">
        <h3>🏆 Top Giao dịch Lớn nhất</h3>
        <div className="performers-table">
          <table>
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Bất động sản</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Phí nền tảng</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="rank gold">🥇</span>
                </td>
                <td>Căn hộ Vinhomes Central Park</td>
                <td>
                  <span className="badge-sale">Bán</span>
                </td>
                <td className="value-highlight">5.5 tỷ</td>
                <td className="fee-highlight">275 triệu</td>
                <td>25/11/2025</td>
              </tr>
              <tr>
                <td>
                  <span className="rank silver">🥈</span>
                </td>
                <td>Biệt thự Thảo Điền</td>
                <td>
                  <span className="badge-sale">Bán</span>
                </td>
                <td className="value-highlight">4.8 tỷ</td>
                <td className="fee-highlight">240 triệu</td>
                <td>22/11/2025</td>
              </tr>
              <tr>
                <td>
                  <span className="rank bronze">🥉</span>
                </td>
                <td>Đất nền Nhà Bè</td>
                <td>
                  <span className="badge-sale">Bán</span>
                </td>
                <td className="value-highlight">3.2 tỷ</td>
                <td className="fee-highlight">160 triệu</td>
                <td>20/11/2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;
