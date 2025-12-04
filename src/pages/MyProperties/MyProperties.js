import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

const MyProperties = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyProperties();
    }
  }, [user, isAuthenticated]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);

      if (!user || !user.email) {
        setError("Vui lòng đăng nhập để xem tin đăng của bạn");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("viepropchain_token");
      const userEmail = user?.email || localStorage.getItem("userEmail");

      // Chỉ lấy properties của user hiện tại
      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}?owner=${encodeURIComponent(
          user.email
        )}&limit=100`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-email": userEmail,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const userProperties = data.data.properties || data.data || [];
        // Double check: filter lại theo email để chắc chắn
        const filteredProperties = userProperties.filter(
          (p) => p.owner === user.email
        );
        setProperties(filteredProperties);
        setError("");
      } else {
        setError("Không thể tải danh sách tin đăng");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    if (filter === "all") return properties;
    if (filter === "draft") {
      return properties.filter((p) => p.status === "draft");
    }
    if (filter === "pending") {
      return properties.filter(
        (p) => p.status === "pending" || p.verificationStatus === "pending_kyc"
      );
    }
    if (filter === "active") {
      return properties.filter(
        (p) => p.status === "for_sale" || p.status === "for_rent"
      );
    }
    if (filter === "minted") {
      return properties.filter((p) => p.nft && p.nft.isMinted);
    }
    return properties;
  };

  const getStatusBadge = (property) => {
    if (property.nft?.isMinted) {
      return {
        text: "🎨 Đã Mint NFT",
        color: "#8b5cf6",
      };
    }

    switch (property.status) {
      case "draft":
        return { text: "📝 Nháp", color: "#6b7280" };
      case "pending":
        return { text: "⏳ Chờ duyệt", color: "#f59e0b" };
      case "for_sale":
        return { text: "✅ Đang bán", color: "#10b981" };
      case "for_rent":
        return { text: "🏠 Cho thuê", color: "#3b82f6" };
      case "sold":
        return { text: "🎉 Đã bán", color: "#ef4444" };
      default:
        return { text: property.status, color: "#6b7280" };
    }
  };

  const formatPriceVND = (price) => {
    if (!price || price === 0) return "Chưa định giá";

    const priceNumber = typeof price === "number" ? price : parseFloat(price);

    if (priceNumber >= 1000000000) {
      const billions = priceNumber / 1000000000;
      return `${billions.toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
      })} tỷ VND`;
    } else if (priceNumber >= 1000000) {
      const millions = priceNumber / 1000000;
      return `${millions.toLocaleString("vi-VN", {
        maximumFractionDigits: 0,
      })} triệu VND`;
    } else {
      return `${priceNumber.toLocaleString("vi-VN")} VND`;
    }
  };

  const handleCreateNew = () => {
    navigate("/create-property");
  };

  const handleEditProperty = (propertyId) => {
    navigate(`/edit-property/${propertyId}`);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin đăng này?")) return;

    try {
      const token = localStorage.getItem("viepropchain_token");
      const userEmail = user?.email || localStorage.getItem("userEmail");

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}/${propertyId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-email": userEmail,
          },
        }
      );

      if (response.ok) {
        alert("✅ Đã xóa tin đăng thành công!");
        fetchMyProperties();
      } else {
        alert("❌ Không thể xóa tin đăng");
      }
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  const filteredProperties = getFilteredProperties();

  // Nếu chưa đăng nhập, chuyển về trang chủ hoặc hiển thị thông báo
  if (!isAuthenticated || !user) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔒</div>
        <h2
          style={{ fontSize: "24px", marginBottom: "16px", color: "#374151" }}
        >
          Vui lòng đăng nhập
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>
          Bạn cần đăng nhập để xem và quản lý tin đăng của mình
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 32px",
            background: "#667eea",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Đang tải tin đăng của bạn..." />;
  }

  return (
    <>
      <Header />
      <div
        style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
            🏘️ Quản Lý Tin Đăng Của Tôi
          </h1>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Quản lý các bất động sản bạn đã đăng trên nền tảng
          </p>

          {/* Create New Button */}
          <button
            onClick={handleCreateNew}
            style={{
              padding: "16px 32px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
          >
            ➕ Tạo Tin Đăng Mới
          </button>
        </div>

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
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "10px 20px",
              background: filter === "all" ? "#3b82f6" : "#fff",
              color: filter === "all" ? "#fff" : "#333",
              border: "2px solid #3b82f6",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Tất cả ({properties.length})
          </button>

          <button
            onClick={() => setFilter("draft")}
            style={{
              padding: "10px 20px",
              background: filter === "draft" ? "#6b7280" : "#fff",
              color: filter === "draft" ? "#fff" : "#333",
              border: "2px solid #6b7280",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            📝 Nháp ({properties.filter((p) => p.status === "draft").length})
          </button>

          <button
            onClick={() => setFilter("pending")}
            style={{
              padding: "10px 20px",
              background: filter === "pending" ? "#f59e0b" : "#fff",
              color: filter === "pending" ? "#fff" : "#333",
              border: "2px solid #f59e0b",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            ⏳ Chờ duyệt (
            {
              properties.filter(
                (p) =>
                  p.status === "pending" ||
                  p.verificationStatus === "pending_kyc"
              ).length
            }
            )
          </button>

          <button
            onClick={() => setFilter("active")}
            style={{
              padding: "10px 20px",
              background: filter === "active" ? "#10b981" : "#fff",
              color: filter === "active" ? "#fff" : "#333",
              border: "2px solid #10b981",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            ✅ Đang hoạt động (
            {
              properties.filter(
                (p) => p.status === "for_sale" || p.status === "for_rent"
              ).length
            }
            )
          </button>

          <button
            onClick={() => setFilter("minted")}
            style={{
              padding: "10px 20px",
              background: filter === "minted" ? "#8b5cf6" : "#fff",
              color: filter === "minted" ? "#fff" : "#333",
              border: "2px solid #8b5cf6",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            🎨 NFT ({properties.filter((p) => p.nft?.isMinted).length})
          </button>

          <button
            onClick={fetchMyProperties}
            style={{
              padding: "10px 20px",
              background: "#fff",
              color: "#333",
              border: "2px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#999",
              background: "#f9fafb",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Chưa có tin đăng nào
            </h3>
            <p style={{ marginBottom: "20px" }}>
              {filter === "all"
                ? "Bạn chưa tạo tin đăng nào. Hãy bắt đầu bằng cách tạo tin đăng mới!"
                : `Không có tin đăng nào trong danh mục "${
                    filter === "draft"
                      ? "Nháp"
                      : filter === "pending"
                      ? "Chờ duyệt"
                      : filter === "active"
                      ? "Đang hoạt động"
                      : "NFT"
                  }"`}
            </p>
            {filter === "all" && (
              <button
                onClick={handleCreateNew}
                style={{
                  padding: "14px 28px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                ➕ Tạo Tin Đăng Đầu Tiên
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredProperties.map((property) => {
              const badge = getStatusBadge(property);
              return (
                <div
                  key={property._id}
                  style={{
                    background: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(0,0,0,0.12)";
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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
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
                        background: badge.color,
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {badge.text}
                    </div>

                    {/* NFT Token ID */}
                    {property.nft?.isMinted && (
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          background: "rgba(0,0,0,0.7)",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        Token #{property.nft.tokenId}
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
                      {property.name || property.title || "Chưa đặt tên"}
                    </h3>

                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginBottom: "8px",
                      }}
                    >
                      📍{" "}
                      {property.location?.address || property.address?.street},{" "}
                      {property.location?.district ||
                        property.address?.district}
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
                        marginBottom: "16px",
                      }}
                    >
                      💰 {formatPriceVND(property.price)}
                    </div>

                    {property.details && (
                      <div
                        style={{
                          marginBottom: "16px",
                          fontSize: "13px",
                          color: "#6b7280",
                        }}
                      >
                        {property.details.area &&
                          `📏 ${property.details.area}m²`}
                        {property.details.bedrooms &&
                          ` • 🛏️ ${property.details.bedrooms}PN`}
                        {property.details.bathrooms &&
                          ` • 🚿 ${property.details.bathrooms}WC`}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "16px",
                      }}
                    >
                      <button
                        onClick={() => handleEditProperty(property._id)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Sửa
                      </button>

                      {(property.status === "draft" ||
                        property.status === "pending") && (
                        <button
                          onClick={() => handleDeleteProperty(property._id)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            marginTop: "40px",
            padding: "24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "20px",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700" }}>
                {properties.length}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                Tổng tin đăng
              </div>
            </div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700" }}>
                {properties.filter((p) => p.status === "draft").length}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Nháp</div>
            </div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700" }}>
                {
                  properties.filter(
                    (p) =>
                      p.status === "pending" ||
                      p.verificationStatus === "pending_kyc"
                  ).length
                }
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Chờ duyệt</div>
            </div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700" }}>
                {
                  properties.filter(
                    (p) => p.status === "for_sale" || p.status === "for_rent"
                  ).length
                }
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                Đang hoạt động
              </div>
            </div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700" }}>
                {properties.filter((p) => p.nft?.isMinted).length}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Đã Mint NFT</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyProperties;
