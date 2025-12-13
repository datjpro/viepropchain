import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import uploadService from "../../services/uploadService";
import LoadingSpinner from "../../components/LoadingSpinner";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";
import "./EditProperty.css";

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [property, setProperty] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "house",
    legalDocumentId: "",
    city: "HoChiMinh",
    district: "",
    ward: "",
    street: "",
    images: [],
    imageUrls: [],
    legalDocuments: [],
    legalDocumentNames: [],
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const cities = [
    { value: "HoChiMinh", label: "Thành phố Hồ Chí Minh" },
    { value: "HaNoi", label: "Hà Nội" },
    { value: "DaNang", label: "Đà Nẵng" },
    { value: "CanTho", label: "Cần Thơ" },
    { value: "HaiPhong", label: "Hải Phòng" },
  ];

  const districts = {
    HoChiMinh: [
      "Quận 1",
      "Quận 2",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 9",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Quận Bình Thạnh",
      "Quận Tân Bình",
    ],
    HaNoi: ["Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Hai Bà Trưng"],
    DaNang: ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà"],
    CanTho: ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng"],
    HaiPhong: ["Quận Hồng Bàng", "Quận Lê Chân", "Quận Ngô Quyền"],
  };

  const propertyTypes = [
    { value: "house", label: "🏠 Nhà ở" },
    { value: "apartment", label: "🏢 Căn hộ" },
    { value: "land", label: "🌾 Đất nền" },
    { value: "villa", label: "🏰 Biệt thự" },
    { value: "commercial", label: "🏪 Thương mại" },
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProperty();
    }
  }, [id, user, isAuthenticated]);

  const fetchProperty = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("viepropchain_token");
      const userEmail = user?.email || localStorage.getItem("userEmail");

      console.log(
        "🔑 Fetching property - Token:",
        token ? "exists" : "missing"
      );

      const response = await fetch(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": userEmail,
        },
      });
      const data = await response.json();

      if (data.success) {
        const prop = data.data;

        // Kiểm tra quyền sở hữu
        if (prop.owner !== user.email) {
          setError("Bạn không có quyền chỉnh sửa tin đăng này");
          setTimeout(() => navigate("/my-properties"), 2000);
          return;
        }

        setProperty(prop);
        setFormData({
          title: prop.title || "",
          description: prop.description || "",
          price: prop.price || "",
          area: prop.area || "",
          bedrooms: prop.bedrooms || "",
          bathrooms: prop.bathrooms || "",
          propertyType: prop.propertyType || "house",
          legalDocumentId: prop.legalDocumentId || "",
          city: prop.address?.city || "HoChiMinh",
          district: prop.address?.district || "",
          ward: prop.address?.ward || "",
          street: prop.address?.street || "",
          images: [],
          imageUrls: prop.images || [],
          legalDocuments: [],
          legalDocumentNames:
            prop.legalDocuments?.map((doc) => doc.name || doc) || [],
        });
      } else {
        setError("Không tìm thấy tin đăng");
        setTimeout(() => navigate("/my-properties"), 2000);
      }
    } catch (err) {
      setError("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Upload hình ảnh nhà
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Kiểm tra số lượng ảnh
    if (formData.imageUrls.length + files.length > 10) {
      setError("⚠️ Tối đa 10 ảnh");
      return;
    }

    setUploadingImages(true);
    setError("");

    try {
      console.log(`📤 Uploading ${files.length} images to IPFS...`);

      // Upload từng ảnh lên IPFS
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`   Uploading ${i + 1}/${files.length}: ${file.name}`);

        const result = await uploadService.uploadImage(file, id);
        uploadedUrls.push(result.url); // Sử dụng Pinata gateway URL
        console.log(`   ✅ Uploaded: ${result.cid}`);
      }

      setFormData({
        ...formData,
        images: [...formData.images, ...files],
        imageUrls: [...formData.imageUrls, ...uploadedUrls],
      });

      console.log(`✅ All images uploaded successfully`);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError("⚠️ Lỗi upload ảnh: " + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages, imageUrls: newUrls });
  };

  // Upload hồ sơ pháp lý (Sổ đỏ) lên IPFS
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingDocs(true);
    setError("");

    try {
      console.log(`📤 Uploading ${files.length} documents to IPFS...`);

      // Upload từng tài liệu lên IPFS
      const uploadedDocs = [];
      const docNames = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`   Uploading ${i + 1}/${files.length}: ${file.name}`);

        const result = await uploadService.uploadDocument(file, id);
        uploadedDocs.push(result.url);
        docNames.push(file.name);
        console.log(`   ✅ Uploaded: ${result.cid}`);
      }

      setFormData({
        ...formData,
        legalDocuments: [...formData.legalDocuments, ...uploadedDocs],
        legalDocumentNames: [...formData.legalDocumentNames, ...docNames],
      });

      console.log(`✅ All documents uploaded successfully`);
    } catch (err) {
      console.error("❌ Upload document error:", err);
      setError("⚠️ Lỗi upload tài liệu: " + err.message);
    } finally {
      setUploadingDocs(false);
    }
  };

  const removeDocument = (index) => {
    const newDocs = formData.legalDocuments.filter((_, i) => i !== index);
    const newNames = formData.legalDocumentNames.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      legalDocuments: newDocs,
      legalDocumentNames: newNames,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.area) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        price: parseFloat(formData.price),
        currency: "VND",
        area: parseFloat(formData.area),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        address: {
          street: formData.street,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          country: "Vietnam",
        },
        legalDocumentId: formData.legalDocumentId,
        images: formData.imageUrls,
        legalDocuments: formData.legalDocuments, // IPFS URLs, not names
      };

      // Lấy token từ localStorage
      const token = localStorage.getItem("viepropchain_token");
      const userEmail = user?.email || localStorage.getItem("userEmail");

      console.log("🔑 Token:", token ? "exists" : "missing");
      console.log("👤 User email:", userEmail);

      const response = await fetch(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}`, {
        method: "PUT",
        credentials: "include", // Thêm credentials
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-email": userEmail, // Thêm email vào header
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        alert("✅ Cập nhật tin đăng thành công!");
        navigate("/my-properties");
      } else {
        const data = await response.json();
        setError(data.message || "Không thể cập nhật tin đăng");
      }
    } catch (err) {
      setError("Lỗi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2>🔒 Vui lòng đăng nhập</h2>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin..." />;
  }

  if (!property) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2>❌ Không tìm thấy tin đăng</h2>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="edit-property-page">
        <div className="edit-property-container">
          <div className="page-header">
            <h1>✏️ Chỉnh Sửa Tin Đăng</h1>
            <p>Cập nhật thông tin bất động sản của bạn</p>
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <form onSubmit={handleSubmit} className="edit-form">
            {/* Thông tin cơ bản */}
            <div className="form-section">
              <h2 className="section-title">📝 Thông tin cơ bản</h2>

              <div className="form-group">
                <label>
                  Tiêu đề <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="form-input"
                  placeholder="VD: Bán nhà mặt tiền đường Nguyễn Huệ"
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="form-textarea"
                  rows="4"
                  placeholder="Mô tả về căn nhà..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại hình BĐS</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) =>
                      handleInputChange("propertyType", e.target.value)
                    }
                    className="form-select"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Giá (VNĐ) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="form-input"
                    placeholder="VD: 3100000000"
                  />
                  {formData.price && (
                    <small className="form-hint">
                      ≈ {(formData.price / 1000000000).toFixed(2)} tỷ VNĐ
                    </small>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Diện tích (m²) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Số phòng ngủ</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      handleInputChange("bedrooms", e.target.value)
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Số phòng tắm</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      handleInputChange("bathrooms", e.target.value)
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mã số Sổ đỏ</label>
                <input
                  type="text"
                  value={formData.legalDocumentId}
                  onChange={(e) =>
                    handleInputChange("legalDocumentId", e.target.value)
                  }
                  className="form-input"
                  placeholder="VD: CS987654326"
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="form-section">
              <h2 className="section-title">📍 Địa chỉ</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      handleInputChange("city", e.target.value);
                      handleInputChange("district", "");
                    }}
                    className="form-select"
                  >
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <select
                    value={formData.district}
                    onChange={(e) =>
                      handleInputChange("district", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts[formData.city]?.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phường/Xã</label>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) => handleInputChange("ward", e.target.value)}
                    className="form-input"
                    placeholder="VD: Phường Bến Nghé"
                  />
                </div>

                <div className="form-group">
                  <label>Số nhà, Tên đường</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                    className="form-input"
                    placeholder="VD: 123 Nguyễn Huệ"
                  />
                </div>
              </div>
            </div>

            {/* Hình ảnh nhà */}
            <div className="form-section">
              <h2 className="section-title">📷 Hình ảnh nhà</h2>

              <div className="upload-zone">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="image-upload" className="upload-label">
                  {uploadingImages ? (
                    <div className="uploading">⏳ Đang tải lên...</div>
                  ) : (
                    <>
                      <div className="upload-icon">📸</div>
                      <div className="upload-text">
                        Kéo thả ảnh vào đây hoặc <span>nhấn để chọn</span>
                      </div>
                      <div className="upload-hint">Hỗ trợ: JPG, PNG</div>
                    </>
                  )}
                </label>
              </div>

              {formData.imageUrls.length > 0 && (
                <div className="image-preview-grid">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hồ sơ pháp lý */}
            <div className="form-section">
              <h2 className="section-title">🔒 Hồ sơ pháp lý (Sổ đỏ/CCCD)</h2>

              <div className="security-notice">
                <div className="notice-icon">🔐</div>
                <div className="notice-content">
                  <h4>Thông tin được bảo mật</h4>
                  <p>Tài liệu chỉ Admin mới được xem để xác minh</p>
                </div>
              </div>

              <div className="upload-zone document-upload">
                <input
                  type="file"
                  id="document-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleDocumentUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="document-upload" className="upload-label">
                  {uploadingDocs ? (
                    <div className="uploading">⏳ Đang tải lên...</div>
                  ) : (
                    <>
                      <div className="upload-icon">📄</div>
                      <div className="upload-text">
                        Tải lên Sổ đỏ / CCCD / Giấy tờ pháp lý
                      </div>
                      <div className="upload-hint">Hỗ trợ: PDF, JPG, PNG</div>
                    </>
                  )}
                </label>
              </div>

              {formData.legalDocumentNames.length > 0 && (
                <div className="document-list">
                  <h4>Tài liệu đã tải lên:</h4>
                  {formData.legalDocumentNames.map((name, index) => (
                    <div key={index} className="document-item">
                      <div className="document-info">
                        <span className="document-icon">✅</span>
                        <span className="document-name">{name}</span>
                      </div>
                      <button
                        type="button"
                        className="remove-doc-btn"
                        onClick={() => removeDocument(index)}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/my-properties")}
                disabled={saving}
              >
                ← Hủy
              </button>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditProperty;
