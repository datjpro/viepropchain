import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";
import ListingModal from "../../components/ListingModal/ListingModal";
import "./MyDashboard.css";

const MyDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchMyProperties();
    }
  }, [user]);

  useEffect(() => {
    filterProperties();
  }, [properties, activeFilter]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.USER.MY_PROPERTIES, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setProperties(data.data || []);
      } else {
        setError(data.message || "Không thể tải danh sách tài sản");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    switch (activeFilter) {
      case "drafts":
        filtered = properties.filter((p) => p.status === "draft");
        break;
      case "pending":
        filtered = properties.filter((p) => p.status === "pending");
        break;
      case "minted":
        filtered = properties.filter(
          (p) => p.status === "active" && p.nftData && !p.currentListing
        );
        break;
      case "listed":
        filtered = properties.filter((p) => p.currentListing);
        break;
      default:
        filtered = properties;
    }

    setFilteredProperties(filtered);
  };

  const getPropertyCounts = () => {
    const drafts = properties.filter((p) => p.status === "draft").length;
    const pending = properties.filter((p) => p.status === "pending").length;
    const minted = properties.filter(
      (p) => p.status === "active" && p.nftData && !p.currentListing
    ).length;
    const listed = properties.filter((p) => p.currentListing).length;

    return { drafts, pending, minted, listed, total: properties.length };
  };

  const handleListProperty = (property, listingType = "sale") => {
    setSelectedProperty({ ...property, listingType });
    setShowListingModal(true);
  };

  const handleEditProperty = (property) => {
    window.location.href = `/edit-property/${property.id}`;
  };

  const handleDeleteProperty = async (property) => {
    if (window.confirm("Bạn có chắc muốn xóa tài sản này?")) {
      console.log("Delete property:", property.id);
    }
  };

  const handleViewDetails = (property) => {
    window.location.href = `/properties/${property.id}`;
  };

  const handleRemoveListing = async (property) => {
    if (window.confirm("Bạn có chắc muốn gỡ niêm yết này?")) {
      try {
        console.log("Remove listing for property:", property.id);
        fetchMyProperties();
      } catch (error) {
        console.error("Error removing listing:", error);
      }
    }
  };

  const getStatusInfo = (property) => {
    if (property.status === "draft") {
      return { label: "Bản nháp", color: "draft", icon: "⚪" };
    }
    if (property.status === "pending") {
      return { label: "Chờ duyệt", color: "pending", icon: "🟡" };
    }
    if (property.status === "active" && property.nftData) {
      if (property.currentListing) {
        const type =
          property.currentListing.type === "sale" ? "Đang bán" : "Đang thuê";
        return {
          label: type,
          color: "listed",
          icon: property.currentListing.type === "sale" ? "🔵" : "🟣",
        };
      }
      return {
        label: `NFT #${property.nftData.tokenId}`,
        color: "minted",
        icon: "🟢",
      };
    }
    return { label: "Không xác định", color: "unknown", icon: "⚫" };
  };

  if (loading) {
    return (
      <div className="my-dashboard">
        <Header />
        <div className="dashboard-main">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  const counts = getPropertyCounts();

  return (
    <div className="my-dashboard">
      <Header />

      <div className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Quản Lý Tài Sản</h1>
            <p>Theo dõi toàn bộ vòng đời bất động sản của bạn</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              Tất cả ({counts.total})
            </button>
            <button
              className={`filter-tab ${
                activeFilter === "drafts" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("drafts")}
            >
              📝 Nháp ({counts.drafts})
            </button>
            <button
              className={`filter-tab ${
                activeFilter === "pending" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("pending")}
            >
              ⏳ Chờ duyệt ({counts.pending})
            </button>
            <button
              className={`filter-tab ${
                activeFilter === "minted" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("minted")}
            >
              💎 Kho NFT ({counts.minted})
            </button>
            <button
              className={`filter-tab ${
                activeFilter === "listed" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("listed")}
            >
              🏪 Đang kinh doanh ({counts.listed})
            </button>
          </div>

          {/* Properties Grid */}
          <div className="properties-grid">
            {filteredProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <h3>Chưa có tài sản nào</h3>
                <p>
                  {activeFilter === "all"
                    ? "Hãy tạo tài sản đầu tiên của bạn"
                    : `Không có tài sản nào ở trạng thái này`}
                </p>
                {activeFilter === "all" && (
                  <a href="/create-property" className="btn-create">
                    + Tạo tài sản mới
                  </a>
                )}
              </div>
            ) : (
              filteredProperties.map((property) => {
                const status = getStatusInfo(property);

                return (
                  <div key={property.id} className="property-card">
                    <div className="property-image">
                      <img
                        src={
                          property.images?.[0] || "/placeholder-property.jpg"
                        }
                        alt={property.name}
                      />
                      <span className={`status-badge ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    <div className="property-info">
                      <h3 className="property-title">{property.name}</h3>
                      <p className="property-address">{property.address}</p>
                      <p className="property-area">{property.area} m²</p>

                      {property.currentListing && (
                        <div className="listing-price">
                          💰 {property.currentListing.price} ETH
                          {property.currentListing.type === "rent" && "/tháng"}
                        </div>
                      )}

                      <div className="property-actions">
                        {/* Draft Status Actions */}
                        {property.status === "draft" && (
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEditProperty(property)}
                            >
                              ✏️ Sửa tiếp
                            </button>
                            <button
                              className="btn-action btn-remove"
                              onClick={() => handleDeleteProperty(property)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        )}

                        {/* Pending Status Actions */}
                        {property.status === "pending" && (
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-view"
                              onClick={() => handleViewDetails(property)}
                            >
                              👁️ Xem chi tiết
                            </button>
                          </div>
                        )}

                        {/* Minted (Ready to List) Status Actions */}
                        {property.status === "active" &&
                          property.nftData &&
                          !property.currentListing && (
                            <div className="action-buttons">
                              <button
                                className="btn-action btn-list"
                                onClick={() =>
                                  handleListProperty(property, "sale")
                                }
                              >
                                💰 Niêm yết bán
                              </button>
                              <button
                                className="btn-action btn-list"
                                onClick={() =>
                                  handleListProperty(property, "rent")
                                }
                              >
                                🏠 Niêm yết thuê
                              </button>
                            </div>
                          )}

                        {/* Listed Status Actions */}
                        {property.currentListing && (
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleListProperty(property)}
                            >
                              ✏️ Sửa giá
                            </button>
                            <button
                              className="btn-action btn-remove"
                              onClick={() => handleRemoveListing(property)}
                            >
                              ❌ Gỡ niêm yết
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Listing Modal */}
      {showListingModal && selectedProperty && (
        <ListingModal
          isOpen={showListingModal}
          property={selectedProperty}
          userAccount={user?.walletAddress}
          onClose={() => {
            setShowListingModal(false);
            setSelectedProperty(null);
            fetchMyProperties();
          }}
        />
      )}
    </div>
  );
};

export default MyDashboard;
