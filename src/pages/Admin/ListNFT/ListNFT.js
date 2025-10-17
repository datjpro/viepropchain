import React, { useState, useEffect } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import "./ListNFT.css";

const ListNFT = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      // Gọi Property Service thay vì Minting Service
      const response = await fetch("http://localhost:3003/properties");
      const data = await response.json();

      if (data.success) {
        setNfts(data.data);
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

  const getFilteredNFTs = () => {
    let filtered = nfts;

    // Filter by status - cập nhật để phù hợp với Property Service
    if (filter !== "ALL") {
      const statusMap = {
        NOT_FOR_SALE: ["draft", "published", "pending_mint"],
        FOR_SALE: ["for_sale", "in_transaction"],
        MINTED: ["minted"],
        SOLD: ["sold"],
      };
      const statuses = statusMap[filter] || [];
      filtered = filtered.filter((nft) => statuses.includes(nft.status));
    }

    // Search by name or owner
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.nft?.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (nft.nft?.tokenId && nft.nft.tokenId.toString().includes(searchTerm))
      );
    }

    return filtered;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { text: "Nháp", class: "status-draft" },
      published: { text: "Đã xuất bản", class: "status-published" },
      pending_mint: { text: "Chờ mint", class: "status-pending" },
      minted: { text: "Đã mint", class: "status-minted" },
      for_sale: { text: "Đang bán", class: "status-for-sale" },
      in_transaction: {
        text: "Đang giao dịch",
        class: "status-in-transaction",
      },
      sold: { text: "Đã bán", class: "status-sold" },
      archived: { text: "Đã lưu trữ", class: "status-archived" },
    };

    const statusInfo = statusMap[status] || { text: status, class: "" };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
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

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const openNFTDetail = (nft) => {
    setSelectedNFT(nft);
  };

  const closeNFTDetail = () => {
    setSelectedNFT(null);
  };

  const filteredNFTs = getFilteredNFTs();

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="list-nft-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="list-nft-container">
        <div className="list-nft-header">
          <h1>📊 Giám Sát NFT</h1>
          <p>Quản lý và theo dõi tất cả NFT bất động sản</p>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
            <button onClick={fetchNFTs} className="btn-retry">
              Thử lại
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="nft-stats">
          <div className="stat-card">
            <div className="stat-number">{nfts.length}</div>
            <div className="stat-label">Tổng BĐS</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {nfts.filter((n) => n.nft?.isMinted).length}
            </div>
            <div className="stat-label">Đã mint NFT</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {nfts.filter((n) => n.status === "for_sale").length}
            </div>
            <div className="stat-label">Đang bán</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {nfts.reduce((sum, nft) => sum + (nft.analytics?.views || 0), 0)}
            </div>
            <div className="stat-label">Lượt xem</div>
          </div>
        </div>

        {/* Filters */}
        <div className="nft-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tên, owner, token ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={filter === "ALL" ? "active" : ""}
              onClick={() => setFilter("ALL")}
            >
              Tất cả
            </button>
            <button
              className={filter === "NOT_FOR_SALE" ? "active" : ""}
              onClick={() => setFilter("NOT_FOR_SALE")}
            >
              Chưa mint
            </button>
            <button
              className={filter === "MINTED" ? "active" : ""}
              onClick={() => setFilter("MINTED")}
            >
              Đã mint
            </button>
            <button
              className={filter === "FOR_SALE" ? "active" : ""}
              onClick={() => setFilter("FOR_SALE")}
            >
              Đang bán
            </button>
            <button
              className={filter === "SOLD" ? "active" : ""}
              onClick={() => setFilter("SOLD")}
            >
              Đã bán
            </button>
          </div>

          <button onClick={fetchNFTs} className="btn-refresh">
            🔄 Làm mới
          </button>
        </div>

        {/* NFT Grid */}
        {filteredNFTs.length === 0 ? (
          <div className="empty-state">
            <p>📭 Không tìm thấy NFT nào</p>
          </div>
        ) : (
          <div className="nft-grid">
            {filteredNFTs.map((nft) => (
              <div
                key={nft._id}
                className="nft-card"
                onClick={() => openNFTDetail(nft)}
              >
                <div className="nft-image-wrapper">
                  <img
                    src={
                      nft.media?.images?.[0]?.url ||
                      "https://via.placeholder.com/300"
                    }
                    alt={nft.name || "Property"}
                    className="nft-image"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300?text=No+Image";
                    }}
                  />
                  {getStatusBadge(nft.status)}
                </div>

                <div className="nft-card-body">
                  <h3 className="nft-name">{nft.name || "Unnamed Property"}</h3>

                  <div className="nft-info-row">
                    <span className="info-label">Loại:</span>
                    <span className="info-value">{nft.propertyType}</span>
                  </div>

                  {nft.nft?.isMinted && (
                    <div className="nft-info-row">
                      <span className="info-label">Token ID:</span>
                      <span className="info-value">#{nft.nft.tokenId}</span>
                    </div>
                  )}

                  {nft.nft?.owner && (
                    <div className="nft-info-row">
                      <span className="info-label">Owner:</span>
                      <span className="info-value">
                        {formatAddress(nft.nft.owner)}
                      </span>
                    </div>
                  )}

                  {nft.price && (
                    <div className="nft-price">
                      💰 {(nft.price.amount / 1000000000).toFixed(2)} tỷ VND
                    </div>
                  )}

                  <div className="nft-footer">
                    <div className="nft-views">
                      👁️ {nft.analytics?.views || 0} lượt xem
                    </div>
                    <div className="nft-date">{formatDate(nft.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NFT Detail Modal */}
        {selectedNFT && (
          <div className="modal-overlay" onClick={closeNFTDetail}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeNFTDetail}>
                ×
              </button>

              <div className="modal-body">
                <div className="modal-image">
                  <img
                    src={
                      selectedNFT.media?.images?.[0]?.url ||
                      "https://via.placeholder.com/500"
                    }
                    alt={selectedNFT.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/500?text=No+Image";
                    }}
                  />
                </div>

                <div className="modal-details">
                  <h2>{selectedNFT.name}</h2>
                  {getStatusBadge(selectedNFT.status)}

                  <p className="modal-description">{selectedNFT.description}</p>

                  {selectedNFT.price && (
                    <div className="modal-price">
                      💰 Giá:{" "}
                      <strong>
                        {(selectedNFT.price.amount / 1000000000).toFixed(2)} tỷ
                        VND
                      </strong>
                    </div>
                  )}

                  {selectedNFT.location && (
                    <div className="detail-section">
                      <h3>📍 Vị trí</h3>
                      <div className="detail-item">
                        <strong>Địa chỉ:</strong>
                        <span>{selectedNFT.location.address}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Phường/Xã:</strong>
                        <span>{selectedNFT.location.ward}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Quận/Huyện:</strong>
                        <span>{selectedNFT.location.district}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Thành phố:</strong>
                        <span>{selectedNFT.location.city}</span>
                      </div>
                    </div>
                  )}

                  {selectedNFT.nft?.isMinted && (
                    <div className="detail-section">
                      <h3>📋 Thông tin NFT</h3>
                      <div className="detail-item">
                        <strong>Token ID:</strong>
                        <code>#{selectedNFT.nft.tokenId}</code>
                      </div>
                      <div className="detail-item">
                        <strong>Contract:</strong>
                        <code>{selectedNFT.nft.contractAddress}</code>
                      </div>
                      <div className="detail-item">
                        <strong>Owner:</strong>
                        <code>{selectedNFT.nft.owner}</code>
                      </div>
                      <div className="detail-item">
                        <strong>Transaction Hash:</strong>
                        <code>{selectedNFT.nft.transactionHash}</code>
                      </div>
                      {selectedNFT.nft.ipfsHash && (
                        <div className="detail-item">
                          <strong>IPFS Hash:</strong>
                          <code>{selectedNFT.nft.ipfsHash}</code>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedNFT.details &&
                    Object.keys(selectedNFT.details).length > 0 && (
                      <div className="detail-section">
                        <h3>🏷️ Thông tin chi tiết</h3>
                        <div className="attributes-grid">
                          {Object.entries(selectedNFT.details).map(
                            ([key, value], idx) => (
                              <div key={idx} className="attribute-item">
                                <div className="attribute-type">{key}</div>
                                <div className="attribute-value">{value}</div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {selectedNFT.analytics && (
                    <div className="detail-section">
                      <h3>� Thống kê</h3>
                      <div className="analytics-grid">
                        <div className="analytic-item">
                          <div className="analytic-value">
                            {selectedNFT.analytics.views || 0}
                          </div>
                          <div className="analytic-label">Lượt xem</div>
                        </div>
                        <div className="analytic-item">
                          <div className="analytic-value">
                            {selectedNFT.analytics.favorites || 0}
                          </div>
                          <div className="analytic-label">Yêu thích</div>
                        </div>
                        <div className="analytic-item">
                          <div className="analytic-value">
                            {selectedNFT.analytics.shares || 0}
                          </div>
                          <div className="analytic-label">Chia sẻ</div>
                        </div>
                        <div className="analytic-item">
                          <div className="analytic-value">
                            {selectedNFT.analytics.inquiries || 0}
                          </div>
                          <div className="analytic-label">Liên hệ</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="modal-actions">
                    {selectedNFT.nft?.ipfsHash && (
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${selectedNFT.nft.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-action"
                      >
                        🔗 Xem trên IPFS
                      </a>
                    )}
                    <button
                      onClick={closeNFTDetail}
                      className="btn-action secondary"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListNFT;
