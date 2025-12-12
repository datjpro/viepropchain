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

      const wallet =
        user?.walletAddress || user?.wallet || user?.address || null;

      if (!wallet) {
        setError("Không tìm thấy địa chỉ ví của người dùng");
        setProperties([]);
        return;
      }

      const url =
        API_ENDPOINTS.INDEXER.MY_NFTS(wallet) +
        "?includeInactive=true&limit=100&page=1";

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      // indexer may return { success, data: [...] } or an array directly
      const items =
        data?.data || data?.items || (Array.isArray(data) ? data : []);

      const mapItemToProperty = (item) => {
        const property = item.property || item.propertyData || item;
        const nft = item.nft || item.nftData || property.nft || item;
        const tokenId =
          nft?.tokenId ?? nft?.token ?? nft?.token?.toString() ?? null;

        let currentListing =
          item.listing || property.currentListing || nft.currentListing || null;

        if (
          currentListing &&
          typeof currentListing === "object" &&
          !currentListing.type &&
          !(
            currentListing.price ||
            currentListing.amount ||
            currentListing.priceAmount
          )
        ) {
          currentListing = null;
        }

        return {
          id:
            property._id ||
            property.id ||
            nft.propertyId ||
            (nft.property && nft.property._id) ||
            `${tokenId}`,
          name:
            property.name || property.title || `Tài sản ${property._id || ""}`,
          images: property.images || property.photos || [],
          address: property.address || property.location?.address || "",
          area: property.area || property.size || null,
          status: property.status || (tokenId ? "active" : "draft"),
          nftData: nft
            ? {
                tokenId: tokenId ?? undefined,
                metadataUri:
                  nft.metadataUri ||
                  nft.tokenURI ||
                  nft.metadataCID ||
                  nft.metadata,
              }
            : null,
          currentListing,
        };
      };

      const mapped = Array.isArray(items) ? items.map(mapItemToProperty) : [];

      setProperties(mapped || []);
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
      setProperties([]);
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
    console.log("🔥 handleListProperty called:", { property, listingType });
    console.log("🔥 Setting selectedProperty:", { ...property, listingType });
    setSelectedProperty({ ...property, listingType });
    console.log("🔥 Setting showListingModal to true");
    setShowListingModal(true);
    console.log("🔥 Modal state should now be:", {
      showListingModal: true,
      selectedProperty: { ...property, listingType },
    });
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

  const formatAddress = (addr) => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;
    if (typeof addr === "object") {
      const parts = [];
      if (addr.street) parts.push(addr.street);
      if (addr.ward) parts.push(addr.ward);
      if (addr.district) parts.push(addr.district);
      if (addr.city) parts.push(addr.city);
      if (addr.country) parts.push(addr.country);
      return parts.filter(Boolean).join(", ");
    }
    return String(addr);
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
                      {property.nftData?.tokenId && (
                        <p className="property-token">
                          Token ID: {property.nftData.tokenId}
                        </p>
                      )}
                      <p className="property-address">
                        {formatAddress(property.address)}
                      </p>
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

                        {/* debug buttons removed */}
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

      {/* debug placeholder removed */}
      {showListingModal && selectedProperty && (
        <ListingModal
          isOpen={showListingModal}
          property={selectedProperty}
          userAccount={user?.walletAddress}
          onClose={() => {
            console.log("🔥 Modal closing...");
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
