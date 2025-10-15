import React, { useState } from "react";
import "./Nft.css";

const Nft = () => {
  const [formData, setFormData] = useState({
    recipient: "",
    name: "",
    description: "",
    image: "",
    attributes: [
      { trait_type: "Loại BDS", value: "" },
      { trait_type: "Vị trí", value: "" },
      { trait_type: "Diện tích", value: "" },
      { trait_type: "Số phòng ngủ", value: "" },
      { trait_type: "Giá", value: "" },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAttributeChange = (index, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index].value = value;
    setFormData((prev) => ({
      ...prev,
      attributes: newAttributes,
    }));
  };

  const addAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: "", value: "" }],
    }));
  };

  const removeAttribute = (index) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const updateAttributeType = (index, newType) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index].trait_type = newType;
    setFormData((prev) => ({
      ...prev,
      attributes: newAttributes,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:3002/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "NFT đã được tạo thành công!" });
        // Reset form
        setFormData({
          recipient: "",
          name: "",
          description: "",
          image: "",
          attributes: [
            { trait_type: "Loại BDS", value: "" },
            { trait_type: "Vị trí", value: "" },
            { trait_type: "Diện tích", value: "" },
            { trait_type: "Số phòng ngủ", value: "" },
            { trait_type: "Giá", value: "" },
          ],
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Có lỗi xảy ra khi tạo NFT",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Không thể kết nối đến server: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nft-admin-container">
      <div className="nft-admin-wrapper">
        <h1 className="nft-admin-title">NFT Hóa Bất Động Sản</h1>
        <p className="nft-admin-subtitle">Tạo NFT cho tài sản bất động sản</p>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="nft-form">
          {/* Recipient Address */}
          <div className="form-group">
            <label htmlFor="recipient">Địa chỉ ví người nhận *</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              placeholder="0x..."
              required
              className="form-input"
            />
          </div>

          {/* Property Name */}
          <div className="form-group">
            <label htmlFor="name">Tên bất động sản *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ví dụ: Căn hộ Vinhomes Central Park"
              required
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Mô tả *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết về bất động sản..."
              required
              className="form-textarea"
              rows="4"
            />
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="image">URL hình ảnh *</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              required
              className="form-input"
            />
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Preview" />
              </div>
            )}
          </div>

          {/* Attributes Section */}
          <div className="form-group">
            <label className="attributes-label">
              Thuộc tính
              <button
                type="button"
                onClick={addAttribute}
                className="btn-add-attribute"
              >
                + Thêm thuộc tính
              </button>
            </label>

            <div className="attributes-list">
              {formData.attributes.map((attr, index) => (
                <div key={index} className="attribute-row">
                  <input
                    type="text"
                    value={attr.trait_type}
                    onChange={(e) => updateAttributeType(index, e.target.value)}
                    placeholder="Loại thuộc tính"
                    className="attribute-input attribute-type"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(index, e.target.value)
                    }
                    placeholder="Giá trị"
                    className="attribute-input attribute-value"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="btn-remove-attribute"
                    title="Xóa thuộc tính"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Đang xử lý..." : "Tạo NFT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Nft;
