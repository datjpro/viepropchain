import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../translations/translations";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import "./Analytics.css";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const Analytics = () => {
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState("hanoi");

  // Dữ liệu dự đoán tăng trưởng theo khu vực
  const regionGrowthData = {
    hanoi: {
      name: "Hà Nội",
      current: 85,
      predicted: 95,
      trend: "up",
      growth: "+11.8%",
      color: "#667eea",
      hotspots: [
        { area: "Tây Hồ", score: 92, demand: "Cao", supply: "Thấp" },
        { area: "Cầu Giấy", score: 88, demand: "Cao", supply: "Trung bình" },
        { area: "Đống Đa", score: 85, demand: "Trung bình", supply: "Cao" },
        { area: "Hoàng Mai", score: 78, demand: "Trung bình", supply: "Cao" },
      ],
      forecast: [
        { month: "T12/2024", price: 85, lower: 82, upper: 88 },
        { month: "T1/2025", price: 87, lower: 84, upper: 90 },
        { month: "T2/2025", price: 89, lower: 86, upper: 92 },
        { month: "T3/2025", price: 91, lower: 88, upper: 94 },
        { month: "T4/2025", price: 93, lower: 90, upper: 96 },
        { month: "T5/2025", price: 95, lower: 92, upper: 98 },
      ],
    },
    hcm: {
      name: "TP. Hồ Chí Minh",
      current: 90,
      predicted: 105,
      trend: "up",
      growth: "+16.7%",
      color: "#10b981",
      hotspots: [
        { area: "Quận 2", score: 95, demand: "Rất cao", supply: "Thấp" },
        { area: "Quận 7", score: 91, demand: "Cao", supply: "Trung bình" },
        { area: "Bình Thạnh", score: 87, demand: "Cao", supply: "Cao" },
        { area: "Thủ Đức", score: 93, demand: "Rất cao", supply: "Trung bình" },
      ],
      forecast: [
        { month: "T12/2024", price: 90, lower: 87, upper: 93 },
        { month: "T1/2025", price: 93, lower: 90, upper: 96 },
        { month: "T2/2025", price: 96, lower: 93, upper: 99 },
        { month: "T3/2025", price: 99, lower: 96, upper: 102 },
        { month: "T4/2025", price: 102, lower: 99, upper: 105 },
        { month: "T5/2025", price: 105, lower: 102, upper: 108 },
      ],
    },
    danang: {
      name: "Đà Nẵng",
      current: 75,
      predicted: 92,
      trend: "up",
      growth: "+22.7%",
      color: "#f59e0b",
      hotspots: [
        { area: "Ngũ Hành Sơn", score: 89, demand: "Cao", supply: "Thấp" },
        { area: "Sơn Trà", score: 86, demand: "Cao", supply: "Trung bình" },
        { area: "Hải Châu", score: 82, demand: "Trung bình", supply: "Cao" },
        { area: "Liên Chiểu", score: 75, demand: "Trung bình", supply: "Cao" },
      ],
      forecast: [
        { month: "T12/2024", price: 75, lower: 72, upper: 78 },
        { month: "T1/2025", price: 79, lower: 76, upper: 82 },
        { month: "T2/2025", price: 83, lower: 80, upper: 86 },
        { month: "T3/2025", price: 86, lower: 83, upper: 89 },
        { month: "T4/2025", price: 89, lower: 86, upper: 92 },
        { month: "T5/2025", price: 92, lower: 89, upper: 95 },
      ],
    },
  };

  // Chỉ số thị trường (Market Indicators)
  const marketIndicators = [
    {
      name: "Cầu/Cung",
      hanoi: 85,
      hcm: 92,
      danang: 78,
    },
    {
      name: "Thanh khoản",
      hanoi: 78,
      hcm: 88,
      danang: 72,
    },
    {
      name: "Tăng trưởng giá",
      hanoi: 82,
      hcm: 90,
      danang: 85,
    },
    {
      name: "Tiềm năng đầu tư",
      hanoi: 88,
      hcm: 95,
      danang: 90,
    },
    {
      name: "Hạ tầng",
      hanoi: 90,
      hcm: 92,
      danang: 85,
    },
  ];

  // So sánh loại BĐS
  const propertyComparison = [
    {
      type: "Chung cư",
      avgPrice: 45,
      growth: 12,
      liquidity: 85,
      roi: 8.5,
    },
    {
      type: "Nhà riêng",
      avgPrice: 85,
      growth: 15,
      liquidity: 68,
      roi: 10.2,
    },
    {
      type: "Biệt thự",
      avgPrice: 150,
      growth: 8,
      liquidity: 45,
      roi: 6.8,
    },
    {
      type: "Đất nền",
      avgPrice: 30,
      growth: 20,
      liquidity: 52,
      roi: 12.5,
    },
  ];

  // Xu hướng tìm kiếm
  const searchTrends = [
    { month: "T7", searches: 12500, conversions: 450 },
    { month: "T8", searches: 13800, conversions: 520 },
    { month: "T9", searches: 15200, conversions: 680 },
    { month: "T10", searches: 17500, conversions: 820 },
    { month: "T11", searches: 19800, conversions: 1050 },
    { month: "T12", searches: 22300, conversions: 1280 },
  ];

  const selectedData = regionGrowthData[selectedRegion];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="analytics-custom-tooltip">
          <p className="analytics-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="analytics-tooltip-value">
              <span style={{ color: entry.color }}>{entry.name}:</span>{" "}
              <strong>
                {entry.value}
                {entry.name.includes("Giá") ? " tr/m²" : ""}
              </strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-page">
      <Header />

      {/* Hero Section */}
      <section className="analytics-hero">
        <div className="analytics-hero-background">
          <div className="analytics-hero-particle analytics-hero-particle-1" />
          <div className="analytics-hero-particle analytics-hero-particle-2" />
          <div className="analytics-hero-particle analytics-hero-particle-3" />
        </div>

        <div className="analytics-container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="analytics-hero-content"
          >
            <motion.h1 variants={fadeInUp} className="analytics-hero-title">
              Phân tích & Dự báo
              <br />
              <span className="analytics-gradient-text">Thị trường BĐS</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="analytics-hero-subtitle">
              Dữ liệu thông minh • Dự đoán chính xác • Đầu tư đúng đắn
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Region Selection */}
      <section className="analytics-region-section">
        <div className="analytics-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="analytics-section-title">
              Chọn khu vực phân tích
            </motion.h2>

            <div className="analytics-region-cards">
              {Object.entries(regionGrowthData).map(([key, region]) => (
                <motion.div
                  key={key}
                  variants={fadeInUp}
                  className={`analytics-region-card ${
                    selectedRegion === key ? "active" : ""
                  }`}
                  onClick={() => setSelectedRegion(key)}
                >
                  <div className="region-card-header">
                    <h3>{region.name}</h3>
                    <span
                      className="region-badge"
                      style={{ background: region.color }}
                    >
                      {region.growth}
                    </span>
                  </div>
                  <div className="region-card-body">
                    <div className="region-stat">
                      <span className="stat-label">Hiện tại</span>
                      <span className="stat-value">{region.current} tr/m²</span>
                    </div>
                    <div className="region-stat">
                      <span className="stat-label">Dự đoán 6 tháng</span>
                      <span
                        className="stat-value predict"
                        style={{ color: region.color }}
                      >
                        {region.predicted} tr/m²
                      </span>
                    </div>
                  </div>
                  <div className="region-card-trend">
                    <span className="trend-icon">
                      {region.trend === "up" ? "📈" : "📉"}
                    </span>
                    <span className="trend-text">Triển vọng tăng trưởng</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Price Forecast */}
      <section className="analytics-forecast-section">
        <div className="analytics-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="analytics-section-title">
              Dự báo giá BĐS - {selectedData.name}
            </motion.h2>

            <div className="analytics-chart-card">
              <div className="chart-header">
                <h3>Xu hướng giá 6 tháng tới</h3>
                <div className="chart-legend-custom">
                  <span className="legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: selectedData.color }}
                    ></span>
                    Dự đoán trung bình
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot gray"></span>
                    Biên độ dao động
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={selectedData.forecast}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={selectedData.color}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={selectedData.color}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" unit=" tr" />
                  <Tooltip content={CustomTooltip} />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="#d1d5db"
                    fill="#f3f4f6"
                    strokeWidth={1}
                    name="Giá thấp nhất"
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="#d1d5db"
                    fill="#f3f4f6"
                    strokeWidth={1}
                    name="Giá cao nhất"
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={selectedData.color}
                    fill="url(#colorPrice)"
                    strokeWidth={4}
                    name="Giá trung bình"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hotspots Analysis */}
      <section className="analytics-hotspot-section">
        <div className="analytics-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="analytics-section-title">
              Khu vực tiềm năng - {selectedData.name}
            </motion.h2>

            <div className="hotspot-grid">
              {selectedData.hotspots.map((spot, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="hotspot-card"
                >
                  <div className="hotspot-header">
                    <h3>{spot.area}</h3>
                    <div
                      className="hotspot-score"
                      style={{ background: selectedData.color }}
                    >
                      {spot.score}/100
                    </div>
                  </div>
                  <div className="hotspot-metrics">
                    <div className="metric">
                      <span className="metric-label">🔍 Cầu</span>
                      <span
                        className={`metric-value ${
                          spot.demand === "Cao" || spot.demand === "Rất cao"
                            ? "high"
                            : "medium"
                        }`}
                      >
                        {spot.demand}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">📦 Cung</span>
                      <span
                        className={`metric-value ${
                          spot.supply === "Thấp"
                            ? "high"
                            : spot.supply === "Trung bình"
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {spot.supply}
                      </span>
                    </div>
                  </div>
                  <div className="hotspot-recommendation">
                    {spot.score >= 90 && (
                      <span className="recommend excellent">
                        ⭐ Xuất sắc - Đầu tư ngay
                      </span>
                    )}
                    {spot.score >= 80 && spot.score < 90 && (
                      <span className="recommend good">
                        ✅ Tốt - Nên cân nhắc
                      </span>
                    )}
                    {spot.score < 80 && (
                      <span className="recommend average">
                        💡 Trung bình - Theo dõi
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Comparison */}
      <section className="analytics-comparison-section">
        <div className="analytics-container">
          <div className="comparison-grid">
            {/* Radar Chart - Market Indicators */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="analytics-chart-card"
            >
              <h3 className="analytics-chart-title">
                So sánh chỉ số thị trường
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={marketIndicators}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" stroke="#6b7280" />
                  <PolarRadiusAxis stroke="#6b7280" />
                  <Radar
                    name="Hà Nội"
                    dataKey="hanoi"
                    stroke="#667eea"
                    fill="#667eea"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="TP.HCM"
                    dataKey="hcm"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Đà Nẵng"
                    dataKey="danang"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Property Type Comparison */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="analytics-chart-card"
            >
              <h3 className="analytics-chart-title">
                So sánh loại BĐS - ROI & Tăng trưởng
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={propertyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="type" stroke="#6b7280" />
                  <YAxis
                    yAxisId="left"
                    stroke="#6b7280"
                    label={{
                      value: "Tăng trưởng (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    label={{
                      value: "ROI (%)",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="growth"
                    fill="#667eea"
                    radius={[8, 8, 0, 0]}
                    name="Tăng trưởng (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="roi"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 6 }}
                    name="ROI (%/năm)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Trends */}
      <section className="analytics-trends-section">
        <div className="analytics-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="analytics-section-title">
              Xu hướng tìm kiếm & Chuyển đổi
            </motion.h2>

            <div className="analytics-chart-card">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={searchTrends}>
                  <defs>
                    <linearGradient
                      id="colorSearches"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#764ba2"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis
                    yAxisId="left"
                    stroke="#6b7280"
                    label={{
                      value: "Lượt tìm kiếm",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    label={{
                      value: "Chuyển đổi",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="searches"
                    fill="url(#colorSearches)"
                    stroke="#667eea"
                    strokeWidth={3}
                    name="Lượt tìm kiếm"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="conversions"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                    name="Giao dịch thành công"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Investment Tips */}
      <section className="analytics-tips-section">
        <div className="analytics-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="analytics-section-title">
              Insights & Gợi ý đầu tư
            </motion.h2>

            <div className="tips-grid">
              <motion.div variants={fadeInUp} className="tip-card green">
                <div className="tip-icon">↑</div>
                <h3>Khu vực tiềm năng</h3>
                <p>
                  Đà Nẵng đang có tốc độ tăng trưởng cao nhất (+22.7%), phù hợp
                  cho đầu tư dài hạn
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="tip-card blue">
                <div className="tip-icon">%</div>
                <h3>Loại BĐS tốt nhất</h3>
                <p>
                  Đất nền có ROI cao nhất (12.5%/năm) và tăng trưởng mạnh (+20%)
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="tip-card purple">
                <div className="tip-icon">→</div>
                <h3>Thời điểm tốt</h3>
                <p>
                  Xu hướng tìm kiếm tăng 78% - đây là thời điểm thuận lợi để
                  giao dịch
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="tip-card orange">
                <div className="tip-icon">★</div>
                <h3>Khu vực hot nhất</h3>
                <p>
                  Quận 2 (TP.HCM) và Tây Hồ (HN) có điểm số cao nhất, cầu vượt
                  cung
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Analytics;
