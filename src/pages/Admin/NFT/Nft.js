import React, { useState } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import "./Nft.css";

const Nft = () => {
  const [propertyType, setPropertyType] = useState("");
  const [formData, setFormData] = useState({
    recipient: "",
    name: "",
    description: "",
    image: "",
    attributes: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
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

    try {
      const response = await fetch("http://localhost:3002/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `NFT đã được mint thành công! Token ID: ${data.tokenId}`,
        });
        setMintResult(data);

        // Reset form sau 3 giây
        setTimeout(() => {
          setPropertyType("");
          setFormData({
            recipient: "",
            name: "",
            description: "",
            image: "",
            attributes: [],
          });
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Có lỗi xảy ra khi tạo NFT",
        });
        setMintResult(null);
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
    <>
      <AdminHeader />
      <div className="nft-admin-container">
        <div className="nft-admin-wrapper">
          <h1 className="nft-admin-title">NFT Hóa Bất Động Sản</h1>
          <p className="nft-admin-subtitle">Tạo NFT cho tài sản bất động sản</p>

          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          {mintResult && (
            <div className="mint-result">
              <h3>✅ Thông tin NFT đã tạo</h3>
              <div className="result-item">
                <strong>Token ID:</strong> {mintResult.tokenId}
              </div>
              <div className="result-item">
                <strong>Transaction Hash:</strong>
                <code>{mintResult.transactionHash}</code>
              </div>
              <div className="result-item">
                <strong>Contract Address:</strong>
                <code>0x52B42Ac0e051A4c3386791b04391510C3cE06632</code>
              </div>
              {mintResult.ipfsHash && (
                <div className="result-item">
                  <strong>IPFS Hash:</strong>
                  <code>{mintResult.ipfsHash}</code>
                </div>
              )}
              {mintResult.tokenURI && (
                <div className="result-item">
                  <strong>Token URI:</strong>
                  <code>{mintResult.tokenURI}</code>
                </div>
              )}
              <div className="result-actions">
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${mintResult.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-view-ipfs"
                >
                  🔗 Xem trên IPFS
                </a>
                <button
                  onClick={() => setMintResult(null)}
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
                  {propertyTemplates[propertyType].fields.map(
                    (field, index) => (
                      <div key={index} className="attribute-field">
                        <label>{field.trait_type}</label>
                        {renderAttributeField(field, index)}
                      </div>
                    )
                  )}
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
    </>
  );
};

export default Nft;
