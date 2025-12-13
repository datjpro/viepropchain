import React, { useState, useEffect } from "react";
import { ethToWei, isValidPrice } from "../../utils/priceUtils";
import marketplaceService from "../../services/marketplaceService";
import { ethers } from "ethers";
import { DEV_WALLETS } from "../../config/dev-wallets";
import "./ListNFTModal.css";

const ListNFTModal = ({ nft, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    price: "",
    description: "",
    listingType: "sale",
    expiresAt: "",
    pricePerDay: "",
    maxDurationDays: "30",
    selectedWallet: "", // Thêm selected wallet
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-select wallet based on stored account
  useEffect(() => {
    const storedAccount =
      localStorage.getItem("walletAccount") ||
      localStorage.getItem("selectedAccount");
    if (storedAccount) {
      const matchingWallet = DEV_WALLETS.find(
        (wallet) => wallet.address.toLowerCase() === storedAccount.toLowerCase()
      );
      if (matchingWallet) {
        setFormData((prev) => ({
          ...prev,
          selectedWallet: matchingWallet.address,
        }));
        console.log(
          "🔑 Auto-selected wallet from localStorage:",
          matchingWallet.name
        );
      } else {
        console.log(
          "⚠️ No matching wallet found for stored account:",
          storedAccount
        );
      }
    } else {
      console.log("⚠️ No wallet account found in localStorage");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.listingType === "sale" && !isValidPrice(formData.price)) {
      setError("Vui lòng nhập giá hợp lệ (ETH)");
      return;
    }

    // Allow empty selectedWallet (will use default wallet)
    if (
      formData.listingType === "sale" &&
      formData.selectedWallet === undefined
    ) {
      setError("Vui lòng chọn ví để ký signature cho off-chain listing");
      return;
    }

    if (
      formData.listingType === "rent" &&
      !isValidPrice(formData.pricePerDay)
    ) {
      setError("Vui lòng nhập giá thuê/ngày hợp lệ (ETH)");
      return;
    }

    try {
      setLoading(true);

      const listingData = {
        tokenId: nft.tokenId || nft.nft?.tokenId,
        contractAddress:
          nft.contractAddress ||
          nft.nft?.contractAddress ||
          "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8",
        propertyId: nft._id || nft.propertyId,
        listingType: formData.listingType,
        description: formData.description,
      };

      // Add price for sale listings (in ETH, backend will convert to wei)
      if (formData.listingType === "sale") {
        listingData.price = parseFloat(formData.price); // Send as ETH number
      }

      // Add rental info
      if (formData.listingType === "rent") {
        listingData.pricePerDay = parseFloat(formData.pricePerDay); // Send as ETH number
        listingData.maxDurationDays = parseInt(formData.maxDurationDays);
      }

      // Add expiration date if provided
      if (formData.expiresAt) {
        listingData.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      // Generate signature for off-chain listing
      try {
        if (formData.listingType === "sale") {
          // Auto-select first wallet if none selected
          const walletToUse = formData.selectedWallet || DEV_WALLETS[0].address;

          console.log("🔑 Starting signature generation...");
          console.log("Current selectedWallet:", formData.selectedWallet);
          console.log("Wallet to use:", walletToUse);
          console.log(
            "Available wallets:",
            DEV_WALLETS.map((w) => `${w.name}: ${w.address.substring(0, 6)}...`)
          );

          const selectedWalletData = DEV_WALLETS.find(
            (w) => w.address.toLowerCase() === walletToUse.toLowerCase()
          );
          console.log(
            "Found wallet data:",
            selectedWalletData ? selectedWalletData.name : "NOT FOUND"
          );

          if (!selectedWalletData) {
            throw new Error(`Wallet not found for address: ${walletToUse}`);
          }

          const wallet = new ethers.Wallet(selectedWalletData.privateKey);

          // Convert price to wei
          const priceWei = ethers.parseEther(formData.price.toString());

          // Create message hash (same as gen-signature.js)
          const messageHash = ethers.solidityPackedKeccak256(
            ["uint256", "uint256", "address"],
            [listingData.tokenId, priceWei, listingData.contractAddress]
          );
          const messageBytes = ethers.getBytes(messageHash);

          // Sign the message
          const signature = await wallet.signMessage(messageBytes);

          listingData.signature = signature;
          console.log(
            "✍️ Signature generated with wallet:",
            selectedWalletData.name
          );
          console.log("Signature:", signature.substring(0, 20) + "...");
        } else {
          console.log(
            "⚠️ Skipping signature generation - listingType:",
            formData.listingType
          );
        }
      } catch (signError) {
        console.warn(
          "⚠️ Could not generate signature, proceeding with on-chain listing:",
          signError.message
        );
        // Continue without signature (on-chain listing)
      }

      console.log("📤 Submitting listing:", listingData);
      console.log("Form data:", formData);
      console.log("Selected wallet:", formData.selectedWallet);

      const response = await marketplaceService.createListing(listingData);

      console.log("✅ Listing created:", response);

      if (onSuccess) {
        onSuccess(response.data);
      }

      onClose();
    } catch (err) {
      console.error("❌ Create listing error:", err);
      setError(err.message || "Không thể tạo listing");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calculate estimated price in wei for display
  const priceInWei =
    formData.price && isValidPrice(formData.price)
      ? ethToWei(formData.price)
      : "0";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🛒 Niêm Yết NFT Lên Marketplace</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">❌ {error}</div>}

          <form onSubmit={handleSubmit}>
            {/* NFT Info */}
            <div className="nft-info-section">
              <h3>NFT #{nft.tokenId || nft.nft?.tokenId}</h3>
              <p>{nft.name || nft.title}</p>
              {nft.media?.images?.[0]?.url && (
                <img
                  src={nft.media.images[0].url}
                  alt="NFT"
                  className="nft-preview-image"
                />
              )}
            </div>

            {/* Listing Type */}
            <div className="form-group">
              <label>Loại niêm yết</label>
              <select
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                className="form-control"
              >
                <option value="sale">Bán</option>
                <option value="rent">Cho thuê</option>
              </select>
            </div>

            {/* Price for Sale */}
            {formData.listingType === "sale" && (
              <div className="form-group">
                <label>
                  Giá bán (ETH) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="VD: 50"
                  step="0.0001"
                  min="0"
                  className="form-control"
                  required
                />
                {formData.price && isValidPrice(formData.price) && (
                  <small className="form-hint">
                    = {priceInWei} wei (giá trên blockchain)
                  </small>
                )}
              </div>
            )}

            {/* Price for Rent */}
            {formData.listingType === "rent" && (
              <>
                <div className="form-group">
                  <label>
                    Giá thuê/ngày (ETH) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="VD: 0.1"
                    step="0.0001"
                    min="0"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Thời gian thuê tối đa (ngày){" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxDurationDays"
                    value={formData.maxDurationDays}
                    onChange={handleChange}
                    placeholder="VD: 30"
                    min="1"
                    max="365"
                    className="form-control"
                    required
                  />
                </div>
              </>
            )}

            {/* Wallet Selection for Sale (Off-chain signature) */}
            {formData.listingType === "sale" && (
              <div className="form-group">
                <label>Chọn ví để ký (Off-chain listing)</label>
                <select
                  name="selectedWallet"
                  value={formData.selectedWallet}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">-- Dùng ví mặc định --</option>
                  {DEV_WALLETS.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {wallet.name} ({wallet.address.substring(0, 6)}...
                      {wallet.address.substring(wallet.address.length - 4)})
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  📝 Off-chain listing: Tự động tạo signature với private key
                </small>
              </div>
            )}

            {/* On-chain notice for rent */}
            {formData.listingType === "rent" && (
              <div className="form-info">
                🔗 On-chain listing: Cần transaction để niêm yết trên blockchain
              </div>
            )}

            {/* Description */}
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả về listing của bạn..."
                rows="4"
                className="form-control"
              />
            </div>

            {/* Expiration Date */}
            <div className="form-group">
              <label>Ngày hết hạn (tùy chọn)</label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Niêm yết NFT"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListNFTModal;
