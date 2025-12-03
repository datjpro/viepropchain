import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatPrice } from "../../utils/priceUtils";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let url = `${API_ENDPOINTS.ADMIN.PROPERTIES}?limit=100`;

      if (filter === "for_sale") {
        url += "&status=for_sale";
      } else if (filter === "sold") {
        url += "&status=sold";
      } else if (filter === "minted") {
        url += "&hasMintedNFT=true";
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data.properties || data.data || []);
        setError("");
      } else {
        setError("Không thể tải danh sách bất động sản");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    if (!searchTerm) return properties;

    return properties.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.district?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // formatPrice được import từ utils/priceUtils.js

  const filteredProperties = getFilteredProperties();

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách bất động sản..." />;
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        🏘️ Danh Sách Bất Động Sản
      </h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Khám phá các bất động sản được tokenize trên blockchain
      </p>

      {error && (
        <div
          style={{
            background: "#fee",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#c00",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, địa chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1",
            minWidth: "250px",
            padding: "12px 20px",
            border: "2px solid #ddd",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />

        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "12px 24px",
            background: filter === "all" ? "#3b82f6" : "#fff",
            color: filter === "all" ? "#fff" : "#333",
            border: "2px solid #3b82f6",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Tất cả ({properties.length})
        </button>

        <button
          onClick={() => setFilter("for_sale")}
          style={{
            padding: "12px 24px",
            background: filter === "for_sale" ? "#10b981" : "#fff",
            color: filter === "for_sale" ? "#fff" : "#333",
            border: "2px solid #10b981",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Đang bán
        </button>

        <button
          onClick={() => setFilter("minted")}
          style={{
            padding: "12px 24px",
            background: filter === "minted" ? "#8b5cf6" : "#fff",
            color: filter === "minted" ? "#fff" : "#333",
            border: "2px solid #8b5cf6",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          NFT
        </button>

        <button
          onClick={fetchProperties}
          style={{
            padding: "12px 24px",
            background: "#f59e0b",
            color: "#fff",
            border: "2px solid #f59e0b",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}
        >
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📭</div>
          <p>Không tìm thấy bất động sản nào</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredProperties.map((property) => (
            <div
              key={property._id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: "relative",
                  height: "200px",
                  background: "#f3f4f6",
                }}
              >
                <img
                  src={
                    property.media?.images?.[0]?.url ||
                    property.images?.[0] ||
                    "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={property.name || property.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />

                {/* Status Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background:
                      property.status === "for_sale" ? "#10b981" : "#6b7280",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {property.status === "for_sale"
                    ? "🏷️ Đang bán"
                    : property.status}
                </div>

                {/* NFT Badge */}
                {property.nft?.isMinted && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "#8b5cf6",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    🎨 NFT #{property.nft.tokenId}
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: "20px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {property.name || property.title || "Unnamed Property"}
                </h3>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  📍 {property.location?.address || property.address?.street},{" "}
                  {property.location?.district || property.address?.district}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  🏠 {property.propertyType || "N/A"}
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#3b82f6",
                    marginTop: "12px",
                  }}
                >
                  💰 {formatPrice(property.price)}
                </div>

                {property.details && (
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    {property.details.area && `📏 ${property.details.area}m²`}
                    {property.details.bedrooms &&
                      ` • 🛏️ ${property.details.bedrooms}PN`}
                    {property.details.bathrooms &&
                      ` • 🚿 ${property.details.bathrooms}WC`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#f9fafb",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Hiển thị <strong>{filteredProperties.length}</strong> /{" "}
          {properties.length} bất động sản
        </p>
      </div>
    </div>
  );
};

export default Properties;
