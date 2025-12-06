import React, { useState, useEffect } from "react";
import { Web3 } from "web3";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/api";

const ListingModal = ({ isOpen, onClose, property, userAccount }) => {
  const [listingType, setListingType] = useState("sale");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

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
      const priceInWei = Web3.utils.toWei(price, "ether");

      const listingData = {
        propertyId: property.id,
        tokenId: property.tokenId,
        listingType: listingType,
        price: priceInWei,
        listingPrice: price, // Store readable price
        status: "active",
        listedBy: userAccount,
      };

      const response = await fetch(API_ENDPOINTS.MARKETPLACE.LISTINGS, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(listingData),
      });

      if (response.ok) {
        alert(`Property successfully listed for ${listingType}!`);
        onClose();
        // Refresh the dashboard
        window.location.reload();
      } else {
        throw new Error("Failed to create listing");
      }
    } catch (error) {
      console.error("Listing error:", error);
      alert("Failed to list property: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="listing-modal-overlay">
      <div className="listing-modal">
        <div className="modal-header">
          <h2>List Property</h2>
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
                  For Sale
                </button>
                <button
                  type="button"
                  className={`tab ${listingType === "rent" ? "active" : ""}`}
                  onClick={() => setListingType("rent")}
                >
                  For Rent
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>
                Price {listingType === "rent" ? "(ETH per month)" : "(ETH)"}
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={`Enter price in ETH`}
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
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || !price}
              >
                {loading ? "Creating Listing..." : "Create Listing"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListingModal;
