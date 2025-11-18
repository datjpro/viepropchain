import React, { useState } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import "./Nft.css";

const Nft = () => {
  const [propertyType, setPropertyType] = useState("");
  const [formData, setFormData] = useState({
    recipient: "",
    name: "",
    description: "",
    image: "",
    price: "",
    city: "TP. Hồ Chí Minh",
    district: "",
    ward: "",
    address: "",
    attributes: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [propertyResult, setPropertyResult] = useState(null);
  const [mintResult, setMintResult] = useState(null);

  // Định nghĩa template cho từng loại BĐS
  const propertyTemplates = {
    apartment: {
      name: "Căn hộ Chung cư",
      icon: "🏢",
      fields: [
        {
          trait_type: "Loại hình BĐS",
          type: "text",
          value: "Căn hộ chung cư",
          readonly: true,
        },
        {
          trait_type: "Tên dự án",
          type: "text",
          placeholder: "VD: Vinhomes Grand Park",
        },
        {
          trait_type: "Mã căn hộ",
          type: "text",
          placeholder: "VD: S1.01.12A08",
        },
        {
          trait_type: "Tòa (Block/Tower)",
          type: "text",
          placeholder: "VD: S1.01",
        },
        { trait_type: "Tầng (Floor)", type: "number", placeholder: "VD: 12" },
        {
          trait_type: "Diện tích tim tường",
          type: "text",
          placeholder: "VD: 75.2m2",
        },
        {
          trait_type: "Diện tích thông thủy",
          type: "text",
          placeholder: "VD: 69.5m2",
        },
        { trait_type: "Số phòng ngủ", type: "number", placeholder: "VD: 2" },
        { trait_type: "Số phòng tắm", type: "number", placeholder: "VD: 2" },
        {
          trait_type: "Hướng ban công",
          type: "select",
          options: [
            "Đông",
            "Tây",
            "Nam",
            "Bắc",
            "Đông Nam",
            "Đông Bắc",
            "Tây Nam",
            "Tây Bắc",
          ],
        },
        {
          trait_type: "Tình trạng nội thất",
          type: "select",
          options: [
            "Bàn giao thô",
            "Nội thất cơ bản",
            "Nội thất đầy đủ",
            "Nội thất cao cấp",
          ],
        },
        {
          trait_type: "Pháp lý",
          type: "select",
          options: ["Hợp đồng mua bán", "Đã có sổ hồng", "Đang chờ sổ"],
        },
      ],
    },
    land: {
      name: "Đất nền",
      icon: "🌍",
      fields: [
        {
          trait_type: "Loại hình BĐS",
          type: "text",
          value: "Đất nền",
          readonly: true,
        },
        { trait_type: "Số thửa", type: "text", placeholder: "VD: 123" },
        { trait_type: "Tờ bản đồ số", type: "text", placeholder: "VD: 4" },
        {
          trait_type: "Địa chỉ",
          type: "text",
          placeholder: "VD: Đường D1, KDC ABC, P. Long Thạnh Mỹ, Q.9",
        },
        {
          trait_type: "Tọa độ GPS",
          type: "text",
          placeholder: "VD: 10.8532, 106.7981",
        },
        { trait_type: "Diện tích", type: "text", placeholder: "VD: 100m2" },
        {
          trait_type: "Chiều ngang (Mặt tiền)",
          type: "text",
          placeholder: "VD: 5m",
        },
        { trait_type: "Chiều dài", type: "text", placeholder: "VD: 20m" },
        {
          trait_type: "Loại đất",
          type: "select",
          options: [
            "ODT (Đất ở tại đô thị)",
            "ONT (Đất ở nông thôn)",
            "CLN (Đất trồng cây lâu năm)",
            "LUA (Đất trồng lúa)",
            "SKC (Đất sản xuất kinh doanh)",
          ],
        },
        {
          trait_type: "Quy hoạch",
          type: "text",
          placeholder: "VD: Khu dân cư hiện hữu",
        },
        {
          trait_type: "Mặt tiền đường",
          type: "text",
          placeholder: "VD: Đường nhựa 8m",
        },
      ],
    },
    house: {
      name: "Nhà phố",
      icon: "🏡",
      fields: [
        {
          trait_type: "Loại hình BĐS",
          type: "text",
          value: "Nhà phố",
          readonly: true,
        },
        {
          trait_type: "Địa chỉ",
          type: "text",
          placeholder: "VD: 123 Nguyễn Văn A, P. Đa Kao, Q.1",
        },
        {
          trait_type: "Pháp lý",
          type: "select",
          options: [
            "Sổ hồng riêng hoàn công",
            "Sổ hồng chung",
            "Sổ hồng riêng chưa hoàn công",
            "Giấy tờ khác",
          ],
        },
        {
          trait_type: "Diện tích đất",
          type: "text",
          placeholder: "VD: 80m2 (5m x 16m)",
        },
        {
          trait_type: "Diện tích xây dựng",
          type: "text",
          placeholder: "VD: 60m2",
        },
        {
          trait_type: "Diện tích sử dụng",
          type: "text",
          placeholder: "VD: 180m2",
        },
        {
          trait_type: "Kết cấu",
          type: "text",
          placeholder: "VD: 1 trệt, 2 lầu, 1 sân thượng",
        },
        { trait_type: "Số phòng ngủ", type: "number", placeholder: "VD: 4" },
        { trait_type: "Số phòng tắm", type: "number", placeholder: "VD: 3" },
        {
          trait_type: "Hướng nhà",
          type: "select",
          options: [
            "Đông",
            "Tây",
            "Nam",
            "Bắc",
            "Đông Nam",
            "Đông Bắc",
            "Tây Nam",
            "Tây Bắc",
          ],
        },
        {
          trait_type: "Mặt tiền đường",
          type: "text",
          placeholder: "VD: Đường 12m có vỉa hè",
        },
        { trait_type: "Năm xây dựng", type: "number", placeholder: "VD: 2020" },
      ],
    },
    villa: {
      name: "Biệt thự",
      icon: "🏰",
      fields: [
        {
          trait_type: "Loại hình BĐS",
          type: "text",
          value: "Biệt thự",
          readonly: true,
        },
        {
          trait_type: "Địa chỉ",
          type: "text",
          placeholder: "VD: 456 Đường XYZ, KDC ABC",
        },
        {
          trait_type: "Pháp lý",
          type: "select",
          options: [
            "Sổ hồng riêng hoàn công",
            "Sổ hồng chung",
            "Sổ hồng riêng chưa hoàn công",
            "Giấy tờ khác",
          ],
        },
        {
          trait_type: "Diện tích đất",
          type: "text",
          placeholder: "VD: 200m2 (10m x 20m)",
        },
        {
          trait_type: "Diện tích xây dựng",
          type: "text",
          placeholder: "VD: 150m2",
        },
        {
          trait_type: "Diện tích sử dụng",
          type: "text",
          placeholder: "VD: 400m2",
        },
        {
          trait_type: "Kết cấu",
          type: "text",
          placeholder: "VD: 1 hầm, 1 trệt, 2 lầu, sân thượng",
        },
        { trait_type: "Số phòng ngủ", type: "number", placeholder: "VD: 5" },
        { trait_type: "Số phòng tắm", type: "number", placeholder: "VD: 4" },
        {
          trait_type: "Hướng nhà",
          type: "select",
          options: [
            "Đông",
            "Tây",
            "Nam",
            "Bắc",
            "Đông Nam",
            "Đông Bắc",
            "Tây Nam",
            "Tây Bắc",
          ],
        },
        {
          trait_type: "Mặt tiền đường",
          type: "text",
          placeholder: "VD: Đường 15m có vỉa hè rộng",
        },
        { trait_type: "Năm xây dựng", type: "number", placeholder: "VD: 2021" },
      ],
    },
  };

  // Xử lý thay đổi loại BĐS
  const handlePropertyTypeChange = (type) => {
    setPropertyType(type);
    if (type && propertyTemplates[type]) {
      const template = propertyTemplates[type];
      const newAttributes = template.fields.map((field) => ({
        trait_type: field.trait_type,
        value: field.value || "",
      }));
      setFormData((prev) => ({
        ...prev,
        attributes: newAttributes,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        attributes: [],
      }));
    }
  };

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

  const renderAttributeField = (field, index) => {
    const attr = formData.attributes[index];

    if (field.readonly) {
      return (
        <input
          type="text"
          value={attr.value}
          readOnly
          className="form-input readonly"
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={attr.value}
          onChange={(e) => handleAttributeChange(index, e.target.value)}
          className="form-select"
        >
          <option value="">-- Chọn {field.trait_type} --</option>
          {field.options.map((option, i) => (
            <option key={i} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        value={attr.value}
        onChange={(e) => handleAttributeChange(index, e.target.value)}
        placeholder={field.placeholder}
        className="form-input"
      />
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    setPropertyResult(null);
    setMintResult(null);

    try {
      console.log("� Tạo và mint NFT trong 1 lần...");

      // Chuyển đổi attributes thành details object
      const details = {};
      formData.attributes.forEach((attr) => {
        if (attr.value) {
          // Chuyển tên thuộc tính thành key không dấu
          const key = attr.trait_type
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase();
          details[key] = attr.value;
        }
      });

      const requestData = {
        recipient: formData.recipient,
        propertyType: propertyType,
        name: formData.name,
        description: formData.description,
        price: {
          amount: parseFloat(formData.price),
          currency: "VND",
        },
        location: {
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
        },
        details: details,
        media: {
          images: [
            {
              url: formData.image,
              isPrimary: true,
            },
          ],
        },
        status: "published",
      };

      // Gọi endpoint create-and-mint - TẤT CẢ TRONG 1 LẦN
      const response = await fetch(API_ENDPOINTS.ADMIN.CREATE_AND_MINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || "Không thể tạo NFT");
      }

      console.log("✅ Hoàn thành:", data.data);

      setPropertyResult(data.data.property);
      setMintResult(data.data);

      setMessage({
        type: "success",
        text: `🎉 Thành công! Bất động sản đã được tạo và mint thành NFT. Token ID: ${data.data.nft.tokenId}`,
      });

      // Reset form sau 5 giây
      setTimeout(() => {
        setPropertyType("");
        setFormData({
          recipient: "",
          name: "",
          description: "",
          image: "",
          price: "",
          city: "TP. Hồ Chí Minh",
          district: "",
          ward: "",
          address: "",
          attributes: [],
        });
        setPropertyResult(null);
        setMintResult(null);
      }, 5000);
    } catch (error) {
      console.error("❌ Lỗi:", error);
      setMessage({
        type: "error",
        text: "Lỗi: " + error.message,
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

        {mintResult && (
          <div className="mint-result">
            <h3>🎉 Hoàn thành NFT hóa bất động sản - Quy trình 12 bước</h3>

            {propertyResult && (
              <div className="result-section">
                <h4>📋 GIAI ĐOẠN 1: OFF-CHAIN (Hoàn tất ✅)</h4>
                <div className="result-item">
                  <strong>✅ Bước 1-3:</strong> Tạo Property trong MongoDB
                </div>
                <div className="result-item">
                  <strong>Property ID:</strong>
                  <code>{propertyResult._id}</code>
                </div>
                <div className="result-item">
                  <strong>Tên:</strong> {propertyResult.name}
                </div>
                <div className="result-item">
                  <strong>Loại:</strong> {propertyResult.propertyType}
                </div>

                {propertyResult.ipfsMetadataCid && (
                  <>
                    <div className="result-item highlight">
                      <strong>✅ Bước 4:</strong> Metadata uploaded to IPFS
                    </div>
                    <div className="result-item">
                      <strong>IPFS Metadata CID:</strong>
                      <code>{propertyResult.ipfsMetadataCid}</code>
                    </div>
                  </>
                )}

                <div className="result-item">
                  <strong>✅ Bước 5:</strong> Lưu MongoDB với ipfsMetadataCid
                </div>
                <div className="result-item">
                  <strong>Trạng thái:</strong>
                  <span className="status-badge">{propertyResult.status}</span>
                </div>
              </div>
            )}

            <div className="result-section">
              <h4>🎨 GIAI ĐOẠN 2: ON-CHAIN (Hoàn tất ✅)</h4>
              <div className="result-item">
                <strong>✅ Bước 6:</strong> Gửi tokenURI → Minting Service
              </div>
              <div className="result-item">
                <strong>✅ Bước 7-8:</strong> Mint NFT lên Blockchain
              </div>
              <div className="result-item">
                <strong>Token ID:</strong>
                <span className="token-id">#{mintResult.nft.tokenId}</span>
              </div>
              <div className="result-item">
                <strong>Contract Address:</strong>
                <code>{mintResult.nft.contractAddress}</code>
              </div>
              <div className="result-item">
                <strong>Owner:</strong>
                <code>{mintResult.nft.owner}</code>
              </div>
              <div className="result-item">
                <strong>Transaction Hash:</strong>
                <code>{mintResult.nft.transactionHash}</code>
              </div>
              {mintResult.nft.tokenURI && (
                <div className="result-item">
                  <strong>Token URI:</strong>
                  <code className="small-code">{mintResult.nft.tokenURI}</code>
                </div>
              )}
            </div>

            <div className="result-section">
              <h4>✅ GIAI ĐOẠN 3: HOÀN TẤT</h4>
              <div className="result-item">
                <strong>✅ Bước 9-12:</strong> Update MongoDB & Response
                Frontend
              </div>
              <div className="result-item success-message">
                🎊 NFT hóa bất động sản hoàn tất 100%!
              </div>
            </div>

            <div className="result-actions">
              {propertyResult.ipfsMetadataCid && (
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${propertyResult.ipfsMetadataCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-view-ipfs"
                >
                  🔗 Xem Metadata trên IPFS
                </a>
              )}
              {mintResult.nft.tokenURI && (
                <a
                  href={mintResult.nft.tokenURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-view-ipfs secondary"
                >
                  🌐 Xem Token URI
                </a>
              )}
              <button
                onClick={() => {
                  setMintResult(null);
                  setPropertyResult(null);
                }}
                className="btn-close-result"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="nft-form">
          {/* Property Type Selection */}
          <div className="form-group">
            <label htmlFor="propertyType">Chọn loại bất động sản *</label>
            <div className="property-type-grid">
              {Object.keys(propertyTemplates).map((key) => {
                const template = propertyTemplates[key];
                return (
                  <div
                    key={key}
                    className={`property-type-card ${
                      propertyType === key ? "active" : ""
                    }`}
                    onClick={() => handlePropertyTypeChange(key)}
                  >
                    <div className="property-icon">{template.icon}</div>
                    <div className="property-name">{template.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

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

          {/* Price */}
          <div className="form-group">
            <label htmlFor="price">Giá (VND) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Ví dụ: 5000000000"
              required
              className="form-input"
            />
            {formData.price && (
              <small className="price-display">
                ≈ {(parseFloat(formData.price) / 1000000000).toFixed(2)} tỷ VND
              </small>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Địa chỉ *</label>
            <div className="location-grid">
              <div className="location-field">
                <label htmlFor="city">Thành phố</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Đồng Nai">Đồng Nai</option>
                </select>
              </div>
              <div className="location-field">
                <label htmlFor="district">Quận/Huyện</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="VD: Quận 1"
                  required
                  className="form-input"
                />
              </div>
              <div className="location-field">
                <label htmlFor="ward">Phường/Xã</label>
                <input
                  type="text"
                  id="ward"
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  placeholder="VD: Phường Bến Nghé"
                  required
                  className="form-input"
                />
              </div>
              <div className="location-field full-width">
                <label htmlFor="address">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="VD: 123 Nguyễn Văn A"
                  required
                  className="form-input"
                />
              </div>
            </div>
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

          {/* Dynamic Attributes based on Property Type */}
          {propertyType && propertyTemplates[propertyType] && (
            <div className="form-group">
              <label className="attributes-label">
                Thông tin chi tiết {propertyTemplates[propertyType].name}
              </label>

              <div className="attributes-grid">
                {propertyTemplates[propertyType].fields.map((field, index) => (
                  <div key={index} className="attribute-field">
                    <label>{field.trait_type}</label>
                    {renderAttributeField(field, index)}
                  </div>
                ))}
              </div>
            </div>
          )}

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
