import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";
import ListingModal from "../../components/ListingModal/ListingModal";
import "./MyDashboard.css";
/* global BigInt */

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

        // Accept listing from multiple shapes: item.listing (indexer), nft.currentListing, or top-level listing fields
        let currentListing =
          item.listing || property.currentListing || nft.currentListing || null;

        // If not present, check for flat listing fields returned by the indexer
        if (!currentListing) {
          const listingTypeField =
            item.listingType || nft.listingType || item.listing_type;
          const currentPriceField =
            item.currentPrice ||
            nft.currentPrice ||
            item.currentPrice ||
            item.price;
          const isListedFlag = item.isListed || nft.isListed;
          if (listingTypeField || currentPriceField || isListedFlag) {
            currentListing = {
              type:
                listingTypeField === "rental" || listingTypeField === "rent"
                  ? "rent"
                  : listingTypeField === "sale"
                  ? "sale"
                  : undefined,
              price: currentPriceField,
            };
          }
        }

        // If listing is an object but missing meaningful fields, treat as null
        if (
          currentListing &&
          typeof currentListing === "object" &&
          !currentListing.type &&
          !(
            currentListing.price ||
            currentListing.amount ||
            currentListing.currentPrice
          )
        ) {
          currentListing = null;
        }

        // try to find contract address from various possible shapes
        const contractAddress =
          nft?.contractAddress ||
          nft?.contract ||
          nft?.contractAddr ||
          item.contractAddress ||
          property.nft?.contractAddress ||
          undefined;

        // build a lightweight metadata object for ListingModal preview
        const metadata =
          property.metadata || property.metadataObj || (nft && nft.metadata)
            ? nft.metadata
            : {
                name: property.name || property.title,
                description: property.description || property.summary || "",
                image: property.images?.[0] || null,
              };

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
                contractAddress,
              }
            : null,
          currentListing,
          metadata,
        };
      };

      let mapped = Array.isArray(items) ? items.map(mapItemToProperty) : [];

      // For NFTs that lack currentListing but have a tokenId, try fetching indexer history
      const needHistory = mapped.filter(
        (p) => !p.currentListing && p.nftData?.tokenId
      );

      if (needHistory.length > 0) {
        await Promise.all(
          needHistory.map(async (p) => {
            try {
              const token = p.nftData.tokenId;
              const url = `${API_ENDPOINTS.INDEXER.BASE}/nft/${token}/history`;
              const resp = await fetch(url, { headers: getAuthHeaders() });
              if (!resp.ok) return;
              const json = await resp.json();
              const listings = json?.listings || json?.data?.listings || [];
              // pick the latest active listing if any
              const active = listings.find(
                (l) => l.status === "active" || l.status === "Active"
              );
              if (active) {
                p.currentListing = {
                  type:
                    active.listingType === "rental" ||
                    active.listingType === "rent"
                      ? "rent"
                      : active.listingType === "sale"
                      ? "sale"
                      : active.listingType,
                  price:
                    active.price?.amount ||
                    active.price ||
                    active.currentPrice ||
                    null,
                };
                // ensure contractAddress from listing
                if (!p.nftData.contractAddress && active.contractAddress) {
                  p.nftData.contractAddress = active.contractAddress;
                }
              }
            } catch (err) {
              // ignore per-item errors
              console.debug(
                "history fetch failed for token",
                p.nftData?.tokenId,
                err.message
              );
            }
          })
        );
      }

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
    // prevent opening listing when required NFT info missing
    if (!property?.nftData?.tokenId) {
      alert("Không thể niêm yết: thiếu tokenId.");
      return;
    }
    if (!property?.nftData?.contractAddress) {
      alert(
        "Không thể niêm yết: thiếu contract address. Vui lòng liên hệ admin."
      );
      return;
    }

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
    // If there's an active listing, show listing status first
    if (property.currentListing) {
      const type =
        property.currentListing.type === "sale" ? "Đang bán" : "Đang cho thuê";
      return {
        label: type,
        color: "listed",
        icon: property.currentListing.type === "sale" ? "🔵" : "🟣",
      };
    }

    if (property.status === "draft") {
      return { label: "Bản nháp", color: "draft", icon: "⚪" };
    }
    if (property.status === "pending") {
      return { label: "Chờ duyệt", color: "pending", icon: "🟡" };
    }

    // Otherwise, unknown / not yet listed
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

  const formatWeiToEth = (value) => {
    if (value === null || value === undefined) return "";
    // handle object like { amount: '123', currency: 'ETH' }
    if (typeof value === "object") {
      const amt = value.amount ?? value.price ?? value.currentPrice;
      return formatWeiToEth(amt);
    }
    const s = String(value);
    // if already decimal (contains dot) treat as ETH
    if (s.includes(".")) {
      const n = Number(s);
      if (Number.isFinite(n)) return n.toString();
      return s;
    }

    // digits-only string -> treat as wei
    if (/^\d+$/.test(s)) {
      try {
        const bn = BigInt(s);
        const WEI = 10n ** 18n;
        const whole = bn / WEI;
        const rem = bn % WEI;
        if (rem === 0n) return whole.toString();
        // take first 4 decimal places
        const frac = rem.toString().padStart(18, "0").slice(0, 4);
        const fracTrim = frac.replace(/0+$/, "");
        return fracTrim ? `${whole.toString()}.${fracTrim}` : whole.toString();
      } catch (e) {
        return s;
      }
    }

    return s;
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
                      {property.nftData &&
                        !property.nftData.contractAddress && (
                          <div className="property-warning">
                            ⚠️ Thiếu contract address — không thể niêm yết
                          </div>
                        )}
                      <p className="property-address">
                        {formatAddress(property.address)}
                      </p>
                      <p className="property-area">{property.area} m²</p>

                      {property.currentListing && (
                        <div className="listing-price">
                          💰 {formatWeiToEth(property.currentListing.price)} ETH
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

                        {/* Listing area: show Sale/Rent buttons when NFT exists and not listed */}
                        {property.nftData && !property.currentListing && (
                          <div className="listing-actions">
                            {property.nftData.contractAddress ? (
                              <>
                                <button
                                  className="btn-action btn-list btn-list-sale"
                                  title="Niêm yết để bán"
                                  onClick={() =>
                                    handleListProperty(property, "sale")
                                  }
                                >
                                  💰 Niêm yết bán
                                </button>
                                <button
                                  className="btn-action btn-list btn-list-rent"
                                  title="Niêm yết cho thuê"
                                  onClick={() =>
                                    handleListProperty(property, "rent")
                                  }
                                >
                                  🏠 Niêm yết cho thuê
                                </button>
                              </>
                            ) : (
                              <div className="action-warning">
                                ⚠️ Thiếu contract address — không thể niêm yết
                              </div>
                            )}
                          </div>
                        )}

                        {/* If already listed, show brief info and an Edit action */}
                        {property.currentListing && (
                          <div className="listing-info">
                            <div className="listing-badge">
                              {property.currentListing.type === "sale"
                                ? "Đang bán"
                                : "Đang cho thuê"}
                              {property.currentListing.price
                                ? ` · ${formatWeiToEth(
                                    property.currentListing.price
                                  )} ETH`
                                : ""}
                            </div>
                            <div className="action-buttons">
                              <button
                                className="btn-action btn-edit"
                                onClick={() =>
                                  handleListProperty(
                                    property,
                                    property.currentListing?.type || "sale"
                                  )
                                }
                              >
                                ✏️ Chỉnh sửa niêm yết
                              </button>
                              <button
                                className="btn-action btn-remove"
                                onClick={() => handleRemoveListing(property)}
                              >
                                ❌ Gỡ niêm yết
                              </button>
                            </div>
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
