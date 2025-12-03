import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatPrice } from "../../utils/priceUtils";
import BuyNFTModal from "../../components/BuyNFTModal";
import RentNFTModal from "../../components/RentNFTModal";

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Lấy tất cả listings từ marketplace
      const response = await fetch(
        `${API_ENDPOINTS.MARKETPLACE.LISTINGS}?limit=200`
      );
      const data = await response.json();

      if (data.success) {
        setListings(data.data?.listings || data.data || []);
        setError("");
      } else {
        setError("Không thể tải marketplace");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSortedListings = () => {
    let filtered = listings;

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === "price_low") {
      sorted.sort((a, b) => {
        const priceA =
          typeof a.price === "object"
            ? BigInt(a.price.amount || 0) // eslint-disable-line no-undef
            : BigInt(a.price || 0); // eslint-disable-line no-undef
        const priceB =
          typeof b.price === "object"
            ? BigInt(b.price.amount || 0) // eslint-disable-line no-undef
            : BigInt(b.price || 0); // eslint-disable-line no-undef
        return priceA < priceB ? -1 : priceA > priceB ? 1 : 0;
      });
    } else if (sortBy === "price_high") {
      sorted.sort((a, b) => {
        const priceA =
          typeof a.price === "object"
            ? BigInt(a.price.amount || 0) // eslint-disable-line no-undef
            : BigInt(a.price || 0); // eslint-disable-line no-undef
        const priceB =
          typeof b.price === "object"
            ? BigInt(b.price.amount || 0) // eslint-disable-line no-undef
            : BigInt(b.price || 0); // eslint-disable-line no-undef
        return priceB < priceA ? -1 : priceB > priceA ? 1 : 0;
      });
    } else if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.listedAt || b.createdAt) -
          new Date(a.listedAt || a.createdAt)
      );
    }

    return sorted;
  };

  // formatPrice được import từ utils/priceUtils.js

  const sortedListings = getSortedListings();

  if (loading) {
    return <LoadingSpinner message="Đang tải marketplace..." />;
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>🛒 Marketplace</h1>
      <p style={{ color: "#666", marginBottom: "30px", fontSize: "16px" }}>
        Mua bán bất động sản NFT trên blockchain
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

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "#eff6ff",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "32px", fontWeight: "700", color: "#3b82f6" }}
          >
            {listings.length}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            Listings
          </div>
        </div>
        <div
          style={{
            background: "#f0fdf4",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "32px", fontWeight: "700", color: "#10b981" }}
          >
            {listings.filter((p) => p.nft?.isMinted).length}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            NFT Properties
          </div>
        </div>
        <div
          style={{
            background: "#faf5ff",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "32px", fontWeight: "700", color: "#8b5cf6" }}
          >
            {listings.reduce((sum, p) => sum + (p.analytics?.views || 0), 0)}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            Total Views
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Tìm kiếm..."
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

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "12px 20px",
            border: "2px solid #ddd",
            borderRadius: "8px",
            fontSize: "15px",
            cursor: "pointer",
            background: "#fff",
          }}
        >
          <option value="newest">Mới nhất</option>
          <option value="price_low">Giá thấp → cao</option>
          <option value="price_high">Giá cao → thấp</option>
        </select>

        <button
          onClick={fetchListings}
          style={{
            padding: "12px 24px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Listings Grid */}
      {sortedListings.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "80px 20px", color: "#999" }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏪</div>
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
            Chưa có listing nào
          </h2>
          <p>Hãy quay lại sau!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {sortedListings.map((listing) => (
            <div
              key={listing._id}
              style={{
                background: "#fff",
                border: "2px solid #e5e7eb",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(0,0,0,0.15)";
                e.currentTarget.style.borderColor = "#3b82f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: "relative",
                  height: "220px",
                  background: "#f3f4f6",
                }}
              >
                <img
                  src={
                    listing.media?.images?.[0]?.url ||
                    listing.images?.[0] ||
                    "https://via.placeholder.com/400x300?text=For+Sale"
                  }
                  alt={listing.name || listing.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=For+Sale";
                  }}
                />

                {listing.nft?.isMinted && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "700",
                      boxShadow: "0 4px 12px rgba(139,92,246,0.4)",
                    }}
                  >
                    🎨 NFT #{listing.nft.tokenId}
                  </div>
                )}

                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    padding: "40px 16px 16px",
                    color: "#fff",
                  }}
                >
                  <div style={{ fontSize: "24px", fontWeight: "800" }}>
                    💰 {formatPrice(listing.price)}
                  </div>
                </div>
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
                    display: "-webkit-box",
                    WebkitLineClamp: "2",
                    WebkitBoxOrient: "vertical",
                    minHeight: "48px",
                  }}
                >
                  {listing.name || listing.title || "Unnamed Property"}
                </h3>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  📍 {listing.location?.district || listing.address?.district},{" "}
                  {listing.location?.city || listing.address?.city || "TP.HCM"}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      background: "#f3f4f6",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    🏠 {listing.propertyType}
                  </span>
                  {listing.details?.area && (
                    <span
                      style={{
                        background: "#f3f4f6",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#374151",
                      }}
                    >
                      📏 {listing.details.area}m²
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {listing.listingType === "sale" || !listing.listingType ? (
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setShowBuyModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: "14px",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      🛒 Mua ngay
                    </button>
                  ) : listing.listingType === "rent" ? (
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setShowRentModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: "14px",
                        background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      🏠 Thuê ngay
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowBuyModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background:
                            "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        🛒 Mua
                      </button>
                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowRentModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background:
                            "linear-gradient(135deg, #8b5cf6, #ec4899)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        🏠 Thuê
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats */}
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
          Hiển thị <strong>{sortedListings.length}</strong> / {listings.length}{" "}
          listings
        </p>
      </div>

      {/* Modals */}
      {showBuyModal && selectedListing && (
        <BuyNFTModal
          listing={selectedListing}
          onClose={() => {
            setShowBuyModal(false);
            setSelectedListing(null);
          }}
          onSuccess={() => {
            fetchListings(); // Refresh listings
          }}
        />
      )}

      {showRentModal && selectedListing && (
        <RentNFTModal
          listing={selectedListing}
          onClose={() => {
            setShowRentModal(false);
            setSelectedListing(null);
          }}
          onSuccess={() => {
            fetchListings(); // Refresh listings
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;
