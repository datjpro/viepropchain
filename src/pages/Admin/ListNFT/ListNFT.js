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
      const response = await fetch("http://localhost:3002/nfts");
      const data = await response.json();

      if (data.success) {
        setNfts(data.data);
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
      filtered = filtered.filter((nft) => nft.status === filter);
    }

    // Search by name or owner
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.metadata?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.tokenId.includes(searchTerm)
      );
    }

    return filtered;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      NOT_FOR_SALE: { text: "Chưa bán", class: "status-not-for-sale" },
      FOR_SALE: { text: "Đang bán", class: "status-for-sale" },
      IN_TRANSACTION: {
        text: "Đang giao dịch",
        class: "status-in-transaction",
      },
      SOLD: { text: "Đã bán", class: "status-sold" },
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
            <div className="stat-label">Tổng NFT</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {nfts.filter((n) => n.status === "FOR_SALE").length}
            </div>
            <div className="stat-label">Đang bán</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {nfts.filter((n) => n.status === "SOLD").length}
            </div>
            <div className="stat-label">Đã bán</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {nfts.reduce((sum, nft) => sum + (nft.viewCount || 0), 0)}
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
              Chưa bán
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
                      nft.metadata?.image || "https://via.placeholder.com/300"
                    }
                    alt={nft.metadata?.name || "NFT"}
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
                    {nft.metadata?.name || "Unnamed NFT"}
                  </h3>

                  <div className="nft-info-row">
                    <span className="info-label">Token ID:</span>
                    <span className="info-value">#{nft.tokenId}</span>
                  </div>

                  <div className="nft-info-row">
                    <span className="info-label">Owner:</span>
                    <span className="info-value">
                      {formatAddress(nft.owner)}
                    </span>
                  </div>

                  {nft.metadata?.attributes && (
                    <div className="nft-attributes-preview">
                      {nft.metadata.attributes.slice(0, 3).map((attr, idx) => (
                        <div key={idx} className="attribute-tag">
                          {attr.trait_type}: {attr.value}
                        </div>
                      ))}
                      {nft.metadata.attributes.length > 3 && (
                        <div className="attribute-tag more">
                          +{nft.metadata.attributes.length - 3} more
                        </div>
                      )}
                    </div>
                  )}

                  <div className="nft-footer">
                    <div className="nft-views">
                      👁️ {nft.viewCount || 0} lượt xem
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
                    src={selectedNFT.metadata?.image}
                    alt={selectedNFT.metadata?.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/500?text=No+Image";
                    }}
                  />
                </div>

                <div className="modal-details">
                  <h2>{selectedNFT.metadata?.name}</h2>
                  {getStatusBadge(selectedNFT.status)}

                  <p className="modal-description">
                    {selectedNFT.metadata?.description}
                  </p>

                  <div className="detail-section">
                    <h3>📋 Thông tin Blockchain</h3>
                    <div className="detail-item">
                      <strong>Token ID:</strong>
                      <code>#{selectedNFT.tokenId}</code>
                    </div>
                    <div className="detail-item">
                      <strong>Contract:</strong>
                      <code>{selectedNFT.contractAddress}</code>
                    </div>
                    <div className="detail-item">
                      <strong>Owner:</strong>
                      <code>{selectedNFT.owner}</code>
                    </div>
                    <div className="detail-item">
                      <strong>Transaction Hash:</strong>
                      <code>{selectedNFT.transactionHash}</code>
                    </div>
                    {selectedNFT.ipfsHash && (
                      <div className="detail-item">
                        <strong>IPFS Hash:</strong>
                        <code>{selectedNFT.ipfsHash}</code>
                      </div>
                    )}
                  </div>

                  {selectedNFT.metadata?.attributes && (
                    <div className="detail-section">
                      <h3>🏷️ Thuộc tính</h3>
                      <div className="attributes-grid">
                        {selectedNFT.metadata.attributes.map((attr, idx) => (
                          <div key={idx} className="attribute-item">
                            <div className="attribute-type">
                              {attr.trait_type}
                            </div>
                            <div className="attribute-value">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedNFT.transactionHistory &&
                    selectedNFT.transactionHistory.length > 0 && (
                      <div className="detail-section">
                        <h3>📜 Lịch sử giao dịch</h3>
                        <div className="history-list">
                          {selectedNFT.transactionHistory.map((tx, idx) => (
                            <div key={idx} className="history-item">
                              <div className="history-type">{tx.type}</div>
                              <div className="history-details">
                                {tx.from && (
                                  <div>From: {formatAddress(tx.from)}</div>
                                )}
                                {tx.to && <div>To: {formatAddress(tx.to)}</div>}
                                <div className="history-date">
                                  {formatDate(tx.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="modal-actions">
                    {selectedNFT.ipfsHash && (
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${selectedNFT.ipfsHash}`}
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
