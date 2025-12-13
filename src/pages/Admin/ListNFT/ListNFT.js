import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
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
      const token = localStorage.getItem("viepropchain_token");

      // Lấy tất cả properties, server sẽ trả về đầy đủ nft info
      const response = await fetch(
        `${API_ENDPOINTS.ADMIN.PROPERTIES}?limit=500`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const allProperties = data.data.properties || data.data || [];
        // Chỉ lấy những BĐS đã mint NFT
        const mintedNFTs = allProperties.filter((p) => p.nft?.isMinted);
        setNfts(mintedNFTs);
        setError("");
      } else {
        setError("Không thể tải danh sách NFT");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNFTs = () => {
    let filtered = nfts;

    // Filter by status
    if (filter !== "ALL") {
      if (filter === "FOR_SALE") {
        filtered = filtered.filter((nft) => nft.status === "for_sale");
      } else if (filter === "SOLD") {
        filtered = filtered.filter((nft) => nft.status === "sold");
      } else if (filter === "MINTED") {
        // Tất cả NFT đã mint (không phân biệt trạng thái bán)
        filtered = filtered.filter((nft) => nft.nft?.isMinted);
      }
    }

    // Search by name, owner, token ID
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.nft?.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.nft?.currentOwner
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
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
      <div className="list-nft-container">
        <LoadingSpinner message="Đang tải danh sách NFT..." />
      </div>
    );
  }

  return (
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
            Tất cả NFT
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
                <h3 className="nft-name">
                  {nft.name || nft.title || "Unnamed Property"}
                </h3>

                <div className="nft-info-row">
                  <span className="info-label">🎨 Token ID:</span>
                  <span className="info-value">#{nft.nft.tokenId}</span>
                </div>

                <div className="nft-info-row">
                  <span className="info-label">🏠 Loại:</span>
                  <span className="info-value">{nft.propertyType}</span>
                </div>

                {(nft.nft?.currentOwner || nft.nft?.owner) && (
                  <div className="nft-info-row">
                    <span className="info-label">👤 Owner:</span>
                    <span className="info-value">
                      {formatAddress(nft.nft.currentOwner || nft.nft.owner)}
                    </span>
                  </div>
                )}

                {nft.nft?.contractAddress && (
                  <div className="nft-info-row">
                    <span className="info-label">📜 Contract:</span>
                    <span className="info-value" style={{ fontSize: "11px" }}>
                      {formatAddress(nft.nft.contractAddress)}
                    </span>
                  </div>
                )}

                {nft.price && (
                  <div className="nft-price">
                    💰{" "}
                    {typeof nft.price === "object"
                      ? (nft.price.amount / 1000000000).toFixed(2)
                      : (nft.price / 1000000000).toFixed(2)}{" "}
                    tỷ VND
                  </div>
                )}

                <div className="nft-footer">
                  <div className="nft-views">
                    👁️ {nft.nft?.views || nft.analytics?.views || 0} views
                  </div>
                  <div className="nft-date">
                    {nft.nft?.mintedAt
                      ? formatDate(nft.nft.mintedAt)
                      : formatDate(nft.createdAt)}
                  </div>
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
                  <div className="detail-section nft-section">
                    <h3>🎨 Thông tin NFT On-Chain</h3>

                    <div className="detail-item highlight">
                      <strong>Token ID:</strong>
                      <span className="token-id-badge">
                        #{selectedNFT.nft.tokenId}
                      </span>
                    </div>

                    <div className="detail-item">
                      <strong>Contract Address:</strong>
                      <code className="contract-code">
                        {selectedNFT.nft.contractAddress}
                      </code>
                      <button
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedNFT.nft.contractAddress
                          );
                          alert("Đã copy contract address!");
                        }}
                        title="Copy contract address"
                      >
                        📋
                      </button>
                    </div>

                    <div className="detail-item">
                      <strong>Owner (Wallet):</strong>
                      <code className="owner-code">
                        {selectedNFT.nft.currentOwner || selectedNFT.nft.owner}
                      </code>
                      <button
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedNFT.nft.currentOwner ||
                              selectedNFT.nft.owner
                          );
                          alert("Đã copy owner address!");
                        }}
                        title="Copy owner address"
                      >
                        📋
                      </button>
                    </div>

                    {selectedNFT.nft.originalOwner &&
                      selectedNFT.nft.originalOwner !==
                        (selectedNFT.nft.currentOwner ||
                          selectedNFT.nft.owner) && (
                        <div className="detail-item">
                          <strong>Original Owner:</strong>
                          <code className="owner-code">
                            {selectedNFT.nft.originalOwner}
                          </code>
                          <button
                            className="btn-copy"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                selectedNFT.nft.originalOwner
                              );
                              alert("Đã copy original owner!");
                            }}
                            title="Copy original owner"
                          >
                            📋
                          </button>
                        </div>
                      )}

                    {selectedNFT.nft.mintTransactionHash && (
                      <div className="detail-item">
                        <strong>Mint Transaction:</strong>
                        <code className="tx-code">
                          {selectedNFT.nft.mintTransactionHash}
                        </code>
                        <button
                          className="btn-copy"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedNFT.nft.mintTransactionHash
                            );
                            alert("Đã copy mint tx hash!");
                          }}
                          title="Copy mint transaction hash"
                        >
                          📋
                        </button>
                      </div>
                    )}

                    {selectedNFT.nft.transactionHash && (
                      <div className="detail-item">
                        <strong>Transaction Hash:</strong>
                        <code className="tx-code">
                          {selectedNFT.nft.transactionHash}
                        </code>
                        <button
                          className="btn-copy"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedNFT.nft.transactionHash
                            );
                            alert("Đã copy transaction hash!");
                          }}
                          title="Copy transaction hash"
                        >
                          📋
                        </button>
                      </div>
                    )}

                    {selectedNFT.nft.tokenURI && (
                      <div className="detail-item">
                        <strong>Token URI:</strong>
                        <code className="uri-code">
                          {selectedNFT.nft.tokenURI}
                        </code>
                        <a
                          href={selectedNFT.nft.tokenURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-link"
                          title="Xem metadata"
                        >
                          🔗
                        </a>
                      </div>
                    )}

                    {selectedNFT.nft.metadataUri &&
                      selectedNFT.nft.metadataUri !==
                        selectedNFT.nft.tokenURI && (
                        <div className="detail-item">
                          <strong>Metadata URI:</strong>
                          <code className="uri-code">
                            {selectedNFT.nft.metadataUri}
                          </code>
                          <a
                            href={selectedNFT.nft.metadataUri.replace(
                              "ipfs://",
                              "https://gateway.pinata.cloud/ipfs/"
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-view-link"
                            title="Xem metadata"
                          >
                            🔗
                          </a>
                        </div>
                      )}

                    {(selectedNFT.ipfsMetadataCid ||
                      selectedNFT.nft.metadataCID) && (
                      <div className="detail-item highlight-ipfs">
                        <strong>IPFS Metadata CID:</strong>
                        <code className="ipfs-code">
                          {selectedNFT.ipfsMetadataCid ||
                            selectedNFT.nft.metadataCID}
                        </code>
                        <button
                          className="btn-copy"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedNFT.ipfsMetadataCid ||
                                selectedNFT.nft.metadataCID
                            );
                            alert("Đã copy IPFS CID!");
                          }}
                          title="Copy IPFS CID"
                        >
                          📋
                        </button>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${
                            selectedNFT.ipfsMetadataCid ||
                            selectedNFT.nft.metadataCID
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-link"
                          title="Xem trên IPFS"
                        >
                          🔗
                        </a>
                      </div>
                    )}

                    {selectedNFT.nft.mintedAt && (
                      <div className="detail-item">
                        <strong>Minted At:</strong>
                        <span className="date-value">
                          {formatDate(selectedNFT.nft.mintedAt)}
                        </span>
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
                  {selectedNFT.ipfsMetadataCid && (
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${selectedNFT.ipfsMetadataCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action primary"
                      title="Xem metadata JSON trên IPFS"
                    >
                      🔗 Xem Metadata trên IPFS
                    </a>
                  )}
                  {selectedNFT.nft?.tokenURI && (
                    <a
                      href={selectedNFT.nft.tokenURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action"
                      title="Xem Token URI"
                    >
                      🌐 Xem Token URI
                    </a>
                  )}
                  {selectedNFT.media?.images?.[0]?.url && (
                    <a
                      href={selectedNFT.media.images[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action"
                      title="Xem ảnh gốc"
                    >
                      🖼️ Xem ảnh gốc
                    </a>
                  )}
                  <button
                    onClick={closeNFTDetail}
                    className="btn-action secondary"
                  >
                    ✖️ Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListNFT;
