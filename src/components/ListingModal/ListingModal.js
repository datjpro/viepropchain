import React, { useState, useEffect } from "react";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/api";
import { Wallet, solidityPackedKeccak256, getBytes } from "ethers";
import { ethToWei } from "../../utils/priceUtils";
import "./ListingModal.css";

const ListingModal = ({ isOpen, onClose, property, userAccount }) => {
  const [listingType, setListingType] = useState("sale");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("🔥 ListingModal render:", {
    isOpen,
    property: property?.name,
    userAccount,
  });

  useEffect(() => {
    if (!isOpen) {
      setPrice("");
      setListingType("sale");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Kiểm tra xem property đã được mint thành NFT chưa
      const tokenId =
        property?.nftData?.tokenId !== undefined
          ? property.nftData.tokenId
          : property?.tokenId;

      if (tokenId === undefined || tokenId === null) {
        alert(
          "Tài sản này chưa được mint thành NFT. Vui lòng mint NFT trước khi niêm yết."
        );
        setLoading(false);
        return;
      }

      const priceInWei = ethToWei(price);

      const listingData = {
        tokenId: tokenId,
        contractAddress:
          property.nftData?.contractAddress ||
          "0x55f732E0d866A155b3A151A862996A13a22C0e8e",
        propertyId: property.id,
        price: priceInWei,
        listingType: listingType,
        description: `${listingType === "sale" ? "Bán" : "Cho thuê"}: ${
          property.name
        }`,
        ...(listingType === "rent" && {
          pricePerDay: priceInWei,
          maxDurationDays: 365,
        }),
      };

      // DEV: auto-sign the message if a private key is provided via env var
      try {
        const pk = process.env.REACT_APP_SELLER_PRIVATE_KEY;
        if (pk) {
          const wallet = new Wallet(pk);
          const contractAddr = listingData.contractAddress;
          const hash = solidityPackedKeccak256(
            ["uint256", "uint256", "address"],
            [
              String(listingData.tokenId),
              String(listingData.price),
              contractAddr,
            ]
          );
          const signature = await wallet.signMessage(getBytes(hash));
          listingData.signature = signature;
          listingData.seller = wallet.address;
          console.log("🔥 Auto-signed listing with", wallet.address, signature);
        } else {
          console.log(
            "No REACT_APP_SELLER_PRIVATE_KEY provided — listing created without signature"
          );
        }
      } catch (sigErr) {
        console.error("Signature generation failed:", sigErr);
      }

      console.log("🔥 Sending listing request:", listingData);
      console.log("🔥 Auth headers:", getAuthHeaders());

      const response = await fetch(API_ENDPOINTS.MARKETPLACE.LISTINGS, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(listingData),
      });

      console.log("🔥 Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("🔥 Success result:", result);
        alert(
          `Tài sản đã được niêm yết ${
            listingType === "sale" ? "bán" : "thuê"
          } thành công!`
        );
        onClose();
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.log("🔥 Error response:", errorData);
        let errorMessage = "Không thể tạo niêm yết";
        if (errorData.error === "NFT not found") {
          errorMessage = "Không tìm thấy NFT. Vui lòng kiểm tra lại tài sản.";
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Listing error:", error);
      alert("Lỗi niêm yết tài sản: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log("🔥 Before return null check, isOpen =", isOpen);
  if (!isOpen) {
    console.log("🔥 Modal not open, returning null");
    return null;
  }

  console.log("🔥 Modal SHOULD render now!");
  return (
    <div className="listing-modal-overlay">
      <div className="listing-modal">
        <div className="modal-header">
          <h2>Niêm Yết Tài Sản</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="property-preview">
            <img
              src={property?.metadata?.image || "/placeholder-property.jpg"}
              alt={property?.metadata?.name}
              className="preview-image"
            />
            <div className="preview-info">
              <h4>{property?.metadata?.name}</h4>
              <p>{property?.metadata?.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="listing-form">
            <div className="form-group">
              <label>Listing Type</label>
              <div className="tab-selector">
                <button
                  type="button"
                  className={`tab ${listingType === "sale" ? "active" : ""}`}
                  onClick={() => setListingType("sale")}
                >
                  Bán
                </button>
                <button
                  type="button"
                  className={`tab ${listingType === "rent" ? "active" : ""}`}
                  onClick={() => setListingType("rent")}
                >
                  Cho Thuê
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>
                Giá {listingType === "rent" ? "(ETH mỗi tháng)" : "(ETH)"}
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={`Nhập giá bằng ETH`}
                required
                className="price-input"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || !price}
              >
                {loading ? "Đang tạo niêm yết..." : "Tạo Niêm Yết"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListingModal;
