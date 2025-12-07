import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import uploadService from "../../services/uploadService";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";
import "./CreateProperty.css";

const CreateProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    // Bước 1: Thông tin cơ bản
    title: "",
    description: "",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "house",
    legalDocumentId: "", // Mã số Sổ đỏ
    // Địa chỉ
    city: "HoChiMinh",
    district: "",
    ward: "",
    street: "",
    // Bước 2: Hình ảnh
    images: [],
    imageUrls: [],
    // Bước 3: Hồ sơ pháp lý
    legalDocuments: [],
    legalDocumentNames: [],
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  // Danh sách tỉnh/thành phố
  const cities = [
    { value: "HoChiMinh", label: "Thành phố Hồ Chí Minh" },
    { value: "HaNoi", label: "Hà Nội" },
    { value: "DaNang", label: "Đà Nẵng" },
    { value: "CanTho", label: "Cần Thơ" },
    { value: "HaiPhong", label: "Hải Phòng" },
  ];

  // Danh sách quận/huyện theo thành phố
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
      "Quận Phú Nhuận",
      "Quận Gò Vấp",
      "Quận Thủ Đức",
    ],
    HaNoi: [
      "Quận Ba Đình",
      "Quận Hoàn Kiếm",
      "Quận Hai Bà Trưng",
      "Quận Đống Đa",
      "Quận Cầu Giấy",
      "Quận Tây Hồ",
    ],
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

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Upload hình ảnh công khai lên IPFS
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

        const result = await uploadService.uploadImage(file);
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

  // Upload hồ sơ pháp lý (private)
  // Upload tài liệu pháp lý lên IPFS (mã hóa)
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

        const result = await uploadService.uploadDocument(file);
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

  // Validate từng bước
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.title || !formData.price || !formData.area) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc");
        return false;
      }
      if (!formData.legalDocumentId) {
        setError("Vui lòng nhập Mã số Sổ đỏ");
        return false;
      }
      if (!formData.street || !formData.district) {
        setError("Vui lòng nhập đầy đủ địa chỉ");
        return false;
      }
    }
    if (step === 2) {
      if (formData.imageUrls.length === 0) {
        setError("Vui lòng tải lên ít nhất 1 hình ảnh");
        return false;
      }
    }
    if (step === 3) {
      if (formData.legalDocuments.length === 0) {
        setError("Vui lòng tải lên hồ sơ pháp lý (Sổ đỏ/CCCD)");
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

  // Submit form
  const handleSubmit = async (paymentMethod) => {
    setLoading(true);
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
        legalDocuments: formData.legalDocuments, // IPFS URLs from uploaded docs
        owner: user?.email || localStorage.getItem("userEmail"),
        status: "draft",
        verificationStatus: "pending_kyc",
        paymentMethod: paymentMethod, // "bank" hoặc "crypto"
        listingFee: 100000, // 100k VND
      };

      const token = localStorage.getItem("viepropchain_token");
      const userEmail = user?.email || localStorage.getItem("userEmail");

      console.log(
        "🔑 Creating property - Token:",
        token ? "exists" : "missing"
      );

      const response = await fetch(API_ENDPOINTS.ADMIN.PROPERTIES, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-email": userEmail,
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        alert("✅ Đăng tin thành công! Tin đăng của bạn đang chờ duyệt.");
        navigate("/my-properties");
      } else {
        const data = await response.json();
        setError(data.message || "Không thể đăng tin");
      }
    } catch (err) {
      setError("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Demo (bỏ qua validation và thanh toán)
  const handleDemoSubmit = async () => {
    setLoading(true);
    try {
      // Tạo dữ liệu demo với format hợp lệ
      const demoData = {
        title: formData.title || "Demo Property - " + Date.now(),
        description: formData.description || "Demo property for testing",
        propertyType: formData.propertyType || "house",
        price: parseFloat(formData.price) || 5000000000,
        currency: "VND",
        area: parseFloat(formData.area) || 100,
        bedrooms: parseInt(formData.bedrooms) || 3,
        bathrooms: parseInt(formData.bathrooms) || 2,
        address: {
          street: formData.street || "123 Demo Street",
          ward: formData.ward || "Ward 1",
          district: formData.district || "Quận 1",
          city: formData.city || "HoChiMinh",
          country: "Vietnam",
        },
        // Legal document ID với format đúng: CS + 5 số
        legalDocumentId: "CS" + Math.floor(10000 + Math.random() * 90000),
        images:
          formData.imageUrls.length > 0
            ? formData.imageUrls
            : ["https://via.placeholder.com/800x600?text=Demo+Property"],
        legalDocuments:
          formData.legalDocuments.length > 0
            ? formData.legalDocuments
            : ["demo_legal_doc_" + Date.now()],
        owner:
          user?.email ||
          localStorage.getItem("userEmail") ||
          "demo@viepropchain.com",
        status: "approved", // Demo tự động approved
        verificationStatus: "verified", // Demo tự động verified
        paymentMethod: "demo",
        listingFee: 0, // Demo miễn phí
        isDemo: true, // Đánh dấu là demo
      };

      const token = localStorage.getItem("viepropchain_token");
      const userEmail = user?.email || localStorage.getItem("userEmail");

      console.log("🎮 Creating DEMO property:", demoData);

      const response = await fetch(API_ENDPOINTS.ADMIN.PROPERTIES, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-email": userEmail,
        },
        body: JSON.stringify(demoData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          "✅ Demo property created successfully! PropertyId: " +
            result.data._id
        );
        navigate("/my-properties");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create demo property");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render progress bar
  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: "Thông tin" },
      { num: 2, label: "Hình ảnh" },
      { num: 3, label: "Pháp lý" },
      { num: 4, label: "Thanh toán" },
    ];

    return (
      <div className="progress-bar">
        {steps.map((step, index) => (
          <div key={step.num} className="progress-step-wrapper">
            <div
              className={`progress-step ${
                currentStep >= step.num ? "active" : ""
              } ${currentStep > step.num ? "completed" : ""}`}
            >
              <div className="step-number">
                {currentStep > step.num ? "✓" : step.num}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`progress-line ${
                  currentStep > step.num ? "completed" : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render Step 1: Thông tin cơ bản
  const renderStep1 = () => (
    <div className="form-step">
      <h2 className="step-title">📝 Bước 1: Thông tin cơ bản</h2>

      <div className="form-group">
        <label>
          Tiêu đề tin đăng <span className="required">*</span>
        </label>
        <input
          type="text"
          placeholder="VD: Bán nhà mặt tiền đường Nguyễn Huệ"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Mô tả chi tiết</label>
        <textarea
          placeholder="Mô tả về căn nhà: vị trí, hướng nhà, gần trường học, bệnh viện..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="form-textarea"
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>
            Loại hình bất động sản <span className="required">*</span>
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => handleInputChange("propertyType", e.target.value)}
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
            Giá tiền (VNĐ) <span className="required">*</span>
          </label>
          <input
            type="number"
            placeholder="VD: 3100000000"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            className="form-input"
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
            placeholder="VD: 140"
            value={formData.area}
            onChange={(e) => handleInputChange("area", e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Số phòng ngủ</label>
          <input
            type="number"
            placeholder="VD: 3"
            value={formData.bedrooms}
            onChange={(e) => handleInputChange("bedrooms", e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Số phòng tắm</label>
          <input
            type="number"
            placeholder="VD: 2"
            value={formData.bathrooms}
            onChange={(e) => handleInputChange("bathrooms", e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group highlight-group">
        <label>
          🔴 Mã số Sổ đỏ <span className="required">*</span>
        </label>
        <input
          type="text"
          placeholder="VD: CS987654326"
          value={formData.legalDocumentId}
          onChange={(e) => handleInputChange("legalDocumentId", e.target.value)}
          className="form-input"
        />
        <small className="form-hint warning">
          ⚠️ Nhập chính xác mã số trên Sổ đỏ để kiểm tra trùng lặp
        </small>
      </div>

      <h3 className="section-subtitle">📍 Địa chỉ</h3>

      <div className="form-row">
        <div className="form-group">
          <label>
            Tỉnh/Thành phố <span className="required">*</span>
          </label>
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
          <label>
            Quận/Huyện <span className="required">*</span>
          </label>
          <select
            value={formData.district}
            onChange={(e) => handleInputChange("district", e.target.value)}
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
            placeholder="VD: Phường Bến Nghé"
            value={formData.ward}
            onChange={(e) => handleInputChange("ward", e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            Số nhà, Tên đường <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: 123 Nguyễn Huệ"
            value={formData.street}
            onChange={(e) => handleInputChange("street", e.target.value)}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  // Render Step 2: Hình ảnh
  const renderStep2 = () => (
    <div className="form-step">
      <h2 className="step-title">📷 Bước 2: Hình ảnh nhà</h2>
      <p className="step-description">
        Tải lên hình ảnh bên ngoài, bên trong nhà để thu hút người mua
      </p>

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
              <div className="upload-hint">
                Hỗ trợ: JPG, PNG (Tối đa 10 ảnh)
              </div>
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
  );

  // Render Step 3: Hồ sơ pháp lý
  const renderStep3 = () => (
    <div className="form-step">
      <h2 className="step-title">🔒 Bước 3: Hồ sơ pháp lý</h2>

      <div className="security-notice">
        <div className="notice-icon">🔐</div>
        <div className="notice-content">
          <h4>Thông tin được bảo mật tuyệt đối</h4>
          <p>
            Tài liệu này được mã hóa và chỉ Admin mới được xem để xác minh.
            Chúng tôi cam kết không chia sẻ thông tin của bạn với bên thứ ba.
          </p>
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
  );

  // Render Step 4: Xác nhận & Thanh toán
  const renderStep4 = () => (
    <div className="form-step">
      <h2 className="step-title">✅ Bước 4: Xác nhận & Thanh toán</h2>

      <div className="review-section">
        <h3>📋 Thông tin đã nhập:</h3>

        <div className="review-item">
          <strong>Tiêu đề:</strong> {formData.title}
        </div>
        <div className="review-item">
          <strong>Loại hình:</strong>{" "}
          {propertyTypes.find((t) => t.value === formData.propertyType)?.label}
        </div>
        <div className="review-item">
          <strong>Giá:</strong>{" "}
          {(parseFloat(formData.price) / 1000000000).toFixed(2)} tỷ VNĐ
        </div>
        <div className="review-item">
          <strong>Diện tích:</strong> {formData.area} m²
        </div>
        <div className="review-item">
          <strong>Địa chỉ:</strong> {formData.street}, {formData.district},{" "}
          {cities.find((c) => c.value === formData.city)?.label}
        </div>
        <div className="review-item">
          <strong>Mã Sổ đỏ:</strong> {formData.legalDocumentId}
        </div>
        <div className="review-item">
          <strong>Hình ảnh:</strong> {formData.imageUrls.length} ảnh
        </div>
        <div className="review-item">
          <strong>Tài liệu pháp lý:</strong> {formData.legalDocuments.length}{" "}
          file
        </div>
      </div>

      <div className="payment-section">
        <h3>💰 Phí niêm yết:</h3>
        <div className="fee-amount">100,000 VNĐ</div>
        <p className="fee-description">
          Phí này dùng để xác minh tài liệu và đưa tin đăng lên hệ thống
        </p>

        <div className="payment-methods">
          <h4>Chọn phương thức thanh toán:</h4>

          <button
            className="payment-btn bank-btn"
            onClick={() => handleSubmit("bank")}
            disabled={loading}
          >
            <span className="btn-icon">🏦</span>
            <div className="btn-content">
              <div className="btn-title">Quét QR Ngân hàng</div>
              <div className="btn-subtitle">Chuyển khoản qua QR Code</div>
            </div>
          </button>

          <button
            className="payment-btn crypto-btn"
            onClick={() => handleSubmit("crypto")}
            disabled={loading}
          >
            <span className="btn-icon">💎</span>
            <div className="btn-content">
              <div className="btn-title">Trả bằng Ví Crypto</div>
              <div className="btn-subtitle">Thanh toán bằng MetaMask</div>
            </div>
          </button>

          <button
            className="payment-btn demo-btn"
            onClick={handleDemoSubmit}
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              marginTop: "20px",
            }}
          >
            <span className="btn-icon">🎮</span>
            <div className="btn-content">
              <div className="btn-title">Tạo Demo (Miễn phí)</div>
              <div className="btn-subtitle">Bỏ qua validation & thanh toán</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="create-property-page">
        <div className="create-property-container">
          <div className="page-header">
            <h1>🏠 Đăng Tin Bất Động Sản</h1>
            <p>Điền thông tin theo từng bước để đăng tin</p>
          </div>

          {renderProgressBar()}

          {error && <div className="error-message">❌ {error}</div>}

          <div className="form-container">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <div className="form-actions">
            {currentStep > 1 && currentStep < 4 && (
              <button className="btn-secondary" onClick={prevStep}>
                ← Quay lại
              </button>
            )}

            {currentStep < 4 && (
              <button className="btn-primary" onClick={nextStep}>
                Tiếp theo →
              </button>
            )}

            {currentStep === 4 && (
              <button className="btn-secondary" onClick={prevStep}>
                ← Sửa thông tin
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateProperty;
