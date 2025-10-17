# 📖 HƯỚNG DẪN TRANG ADMIN NFT

## 🎯 **TRANG NÀY LÀM GÌ?**

Trang **Admin NFT** (`/admin/nft`) là trang chính để **NFT hóa bất động sản** - tức là biến một bất động sản thực tế thành NFT trên blockchain.

---

## 🔄 **QUY TRÌNH HOẠT ĐỘNG (12 BƯỚC)**

### **Khi Admin điền form và nhấn "Tạo NFT":**

```
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 1-2: NHẬP LIỆU TRÊN FRONTEND                      │
├─────────────────────────────────────────────────────────┤
│ • Admin chọn loại BĐS (căn hộ/đất/nhà/villa)          │
│ • Điền thông tin cơ bản (tên, giá, địa chỉ, hình)     │
│ • Điền thông tin chi tiết theo từng loại BĐS           │
│ • Nhập địa chỉ ví người nhận NFT                       │
└─────────────────────────────────────────────────────────┘
                         ⬇️
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 3: GỬI REQUEST ĐẾN PROPERTY SERVICE               │
├─────────────────────────────────────────────────────────┤
│ POST http://localhost:3003/properties/create-and-mint   │
│                                                          │
│ Body: {                                                  │
│   recipient: "0x...",        // Địa chỉ ví nhận NFT    │
│   propertyType: "apartment", // Loại BĐS               │
│   name: "Căn hộ ABC",       // Tên                     │
│   description: "...",        // Mô tả                   │
│   price: { amount: 5000000000, currency: "VND" },      │
│   location: { address, ward, district, city },         │
│   details: { ... },          // Chi tiết theo loại     │
│   media: { images: [...] },  // Hình ảnh               │
│   status: "published"                                   │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
                         ⬇️
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 4-5: PROPERTY SERVICE XỬ LÝ                       │
├─────────────────────────────────────────────────────────┤
│ ✅ Tạo Property record trong MongoDB                    │
│ ✅ Đổi status → "pending_mint"                          │
│ ✅ Build metadata theo chuẩn ERC-721                    │
└─────────────────────────────────────────────────────────┘
                         ⬇️
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 6: UPLOAD METADATA LÊN IPFS                        │
├─────────────────────────────────────────────────────────┤
│ ✅ Upload file metadata.json lên Pinata                 │
│ ✅ Nhận IPFS CID (QmXxx...)                            │
│ ✅ Tạo tokenURI: "ipfs://QmXxx..." hoặc gateway URL    │
│ ✅ Lưu ipfsMetadataCid vào MongoDB                     │
│                                                          │
│ 🔑 ĐÂY LÀ BƯỚC QUAN TRỌNG - metadata phải tồn tại      │
│    trước khi mint NFT (chuẩn ERC-721)                  │
└─────────────────────────────────────────────────────────┘
                         ⬇️
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 7-8: GỬI YÊU CẦU MINT ĐẾN MINTING SERVICE        │
├─────────────────────────────────────────────────────────┤
│ POST http://localhost:3002/mint                         │
│                                                          │
│ Body: {                                                  │
│   recipient: "0x...",        // Địa chỉ nhận NFT       │
│   tokenURI: "ipfs://QmXxx..." // Link metadata trên IPFS│
│ }                                                        │
│                                                          │
│ ⚠️ CHÚ Ý: KHÔNG gửi metadata object nữa,              │
│          chỉ gửi tokenURI đã upload                    │
└─────────────────────────────────────────────────────────┘
                         ⬇️
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 9-10: MINTING SERVICE MINT LÊN BLOCKCHAIN         │
├─────────────────────────────────────────────────────────┤
│ ✅ Kết nối Ganache (localhost:8545)                     │
│ ✅ Gọi contract.mint(recipient, tokenURI)               │
│ ✅ Chờ transaction được confirm                         │
│ ✅ Lấy tokenId từ Transfer event                        │
│ ✅ Return kết quả về Property Service                   │
└─────────────────────────────────────────────────────────┘
                         ⬇️
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 11: PROPERTY SERVICE UPDATE DATABASE               │
├─────────────────────────────────────────────────────────┤
│ ✅ Cập nhật property trong MongoDB:                     │
│    - nft.isMinted = true                                │
│    - nft.tokenId = X                                    │
│    - nft.contractAddress = "0x..."                      │
│    - nft.owner = "0x..."                                │
│    - nft.transactionHash = "0x..."                      │
│    - nft.tokenURI = "ipfs://..."                        │
│    - status = "minted"                                  │
└─────────────────────────────────────────────────────────┘
                         ⬇️
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 12: HIỂN THỊ KẾT QUẢ CHO ADMIN                    │
├─────────────────────────────────────────────────────────┤
│ Frontend nhận response và hiển thị:                     │
│                                                          │
│ 🎉 Hoàn thành NFT hóa bất động sản - Quy trình 12 bước │
│                                                          │
│ 📋 GIAI ĐOẠN 1: OFF-CHAIN (Hoàn tất ✅)                │
│    ✅ Bước 1-3: Tạo Property trong MongoDB              │
│    ✅ Bước 4: Metadata uploaded to IPFS                 │
│    ✅ Bước 5: Lưu MongoDB với ipfsMetadataCid          │
│                                                          │
│ 🎨 GIAI ĐOẠN 2: ON-CHAIN (Hoàn tất ✅)                 │
│    ✅ Bước 6: Gửi tokenURI → Minting Service           │
│    ✅ Bước 7-8: Mint NFT lên Blockchain                │
│    Token ID: #7                                         │
│                                                          │
│ ✅ GIAI ĐOẠN 3: HOÀN TẤT                               │
│    ✅ Bước 9-12: Update MongoDB & Response Frontend     │
│    🎊 NFT hóa bất động sản hoàn tất 100%!              │
│                                                          │
│ [🔗 Xem Metadata trên IPFS] [🌐 Xem Token URI] [Đóng]  │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 **CÁC CHỨC NĂNG CHÍNH**

### **1. Chọn Loại Bất Động Sản**

```javascript
propertyTemplates = {
  apartment: "Căn hộ Chung cư" (12 trường),
  land: "Đất nền" (11 trường),
  house: "Nhà phố" (12 trường),
  villa: "Biệt thự" (12 trường)
}
```

**Ví dụ Căn hộ:**

- Tên dự án, Mã căn hộ, Tòa, Tầng
- Diện tích tim tường, thông thủy
- Số phòng ngủ, phòng tắm
- Hướng ban công, Nội thất, Pháp lý

**Ví dụ Đất nền:**

- Số thửa, Tờ bản đồ, Tọa độ GPS
- Diện tích, Chiều ngang, dài
- Loại đất (ODT/ONT/CLN/LUA/SKC)
- Quy hoạch, Mặt tiền đường

### **2. Form Nhập Liệu**

```javascript
Thông tin bắt buộc (*):
✅ Loại BĐS
✅ Địa chỉ ví người nhận (0x...)
✅ Tên BĐS
✅ Mô tả
✅ Giá (VND)
✅ Địa chỉ (Thành phố, Quận, Phường, Địa chỉ chi tiết)
✅ URL hình ảnh
✅ Thông tin chi tiết (tùy theo loại BĐS)
```

### **3. Xử Lý Submit**

```javascript
handleSubmit(e) {
  // 1. Validate dữ liệu
  // 2. Chuyển attributes → details object
  // 3. Build request data
  // 4. POST /properties/create-and-mint
  // 5. Hiển thị kết quả hoặc lỗi
}
```

### **4. Hiển Thị Kết Quả**

Khi thành công, hiển thị:

**GIAI ĐOẠN 1: OFF-CHAIN**

- ✅ Property ID
- ✅ IPFS Metadata CID (QmXxx...)
- ✅ Status: minted

**GIAI ĐOẠN 2: ON-CHAIN**

- ✅ Token ID: #X
- ✅ Contract Address
- ✅ Owner Address
- ✅ Transaction Hash
- ✅ Token URI

**GIAI ĐOẠN 3: HOÀN TẤT**

- 🎊 Thông báo thành công 100%

**Actions:**

- 🔗 Link xem Metadata trên IPFS
- 🌐 Link xem Token URI
- Button đóng kết quả

---

## 🎨 **GIAO DIỆN**

### **Màu sắc:**

- Background: Gradient tím (#667eea → #764ba2)
- Form: Nền trắng, bo góc 16px
- Card loại BĐS: Border 3px, hover effect
- Kết quả: Gradient tím với backdrop blur

### **Animation:**

- Slide in khi hiển thị message/result
- Hover effects trên buttons
- Transform translateY khi hover
- Loading spinner khi submit

### **Responsive:**

- Desktop: 4 cột property types
- Tablet: 2 cột
- Mobile: 1 cột

---

## 🔧 **ĐIỂM KHÁC BIỆT SAU KHI SỬA**

### **TRƯỚC ĐÂY (SAI):**

```javascript
// ❌ Thiếu bước upload IPFS
const metadata = buildNFTMetadata(property);
await requestMinting(recipient, metadata); // Gửi object
```

**Vấn đề:**

- Không upload metadata lên IPFS
- Gửi metadata object thay vì URI
- Vi phạm chuẩn ERC-721

### **BÂY GIỜ (ĐÚNG):**

```javascript
// ✅ Đầy đủ quy trình
const metadata = buildNFTMetadata(property);

// Upload lên IPFS
const { ipfsHash, tokenURI } = await uploadMetadataToIPFS(metadata);
property.ipfsMetadataCid = ipfsHash;
await property.save();

// Gửi tokenURI
await requestMinting(recipient, tokenURI);
```

**Đúng:**

- ✅ Upload metadata trước
- ✅ Lưu IPFS CID
- ✅ Gửi tokenURI (chuẩn ERC-721)
- ✅ Metadata tồn tại vĩnh viễn trên IPFS

---

## 📊 **LUỒNG DỮ LIỆU**

### **Input (Frontend → Backend):**

```json
{
  "recipient": "0xC6890b26A32d9d92aefbc8635C4588247529CdfE",
  "propertyType": "apartment",
  "name": "Căn hộ Vinhomes Grand Park",
  "description": "Căn hộ 2PN, view đẹp",
  "price": {
    "amount": 5000000000,
    "currency": "VND"
  },
  "location": {
    "address": "123 Nguyễn Văn A",
    "ward": "Long Thạnh Mỹ",
    "district": "Quận 9",
    "city": "TP. Hồ Chí Minh"
  },
  "details": {
    "tenduan": "Vinhomes Grand Park",
    "macanho": "S1.01.12A08",
    "toa": "S1.01",
    "tang": "12",
    "dientichtimtuong": "75.2m2",
    "dientichthongthuy": "69.5m2",
    "sophongngu": "2",
    "sophongtam": "2",
    "huongbancon": "Đông",
    "tinhtranhnoithat": "Nội thất cơ bản",
    "phaply": "Hợp đồng mua bán"
  },
  "media": {
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "isPrimary": true
      }
    ]
  },
  "status": "published"
}
```

### **Output (Backend → Frontend):**

```json
{
  "success": true,
  "message": "Property created and minted successfully",
  "data": {
    "property": {
      "_id": "68f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Căn hộ Vinhomes Grand Park",
      "propertyType": "apartment",
      "ipfsMetadataCid": "QmXYZ123abc...",
      "status": "minted",
      "nft": {
        "isMinted": true,
        "tokenId": 7,
        "contractAddress": "0x52B42Ac0e051A4c3386791b04391510C3cE06632",
        "owner": "0xC6890b26A32d9d92aefbc8635C4588247529CdfE",
        "tokenURI": "https://gateway.pinata.cloud/ipfs/QmXYZ123abc...",
        "transactionHash": "0xabc123def456...",
        "ipfsHash": "QmXYZ123abc...",
        "mintedAt": "2025-10-17T09:30:00.000Z"
      }
    },
    "nft": {
      "tokenId": 7,
      "contractAddress": "0x52B42Ac0e051A4c3386791b04391510C3cE06632",
      "owner": "0xC6890b26A32d9d92aefbc8635C4588247529CdfE",
      "tokenURI": "https://gateway.pinata.cloud/ipfs/QmXYZ123abc...",
      "transactionHash": "0xabc123def456...",
      "ipfsHash": "QmXYZ123abc..."
    }
  }
}
```

---

## 🚀 **CÁCH SỬ DỤNG**

### **1. Đảm bảo các service đang chạy:**

```bash
# Terminal 1: Ganache
ganache -m "arm either chef prosper..." --server.port 8545

# Terminal 2: Minting Service
cd minting-service && npm start

# Terminal 3: Property Service
cd property-service && npm start

# Terminal 4: Frontend
cd viepropchain && npm start
```

### **2. Truy cập trang:**

```
http://localhost:3000/admin/nft
```

### **3. Điền form:**

1. **Chọn loại BĐS** (click vào card)
2. **Nhập địa chỉ ví nhận NFT** (0x...)
3. **Điền thông tin cơ bản** (tên, mô tả, giá)
4. **Chọn địa chỉ** (thành phố, quận, phường, địa chỉ)
5. **Nhập URL hình ảnh**
6. **Điền thông tin chi tiết** (hiện ra sau khi chọn loại)

### **4. Nhấn "Tạo NFT"**

⏳ Đợi xử lý (5-10 giây):

- Tạo property trong MongoDB
- Upload metadata lên IPFS
- Mint NFT trên blockchain
- Cập nhật database

### **5. Xem kết quả:**

✅ Hiển thị đầy đủ thông tin 3 giai đoạn

- Property info + IPFS CID
- NFT info + Token ID
- Links xem trên IPFS

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

### **Địa chỉ ví nhận NFT:**

- Phải là địa chỉ Ethereum hợp lệ (0x...)
- Ví này sẽ là owner của NFT
- Có thể dùng địa chỉ từ Ganache accounts

### **URL hình ảnh:**

- Phải là URL công khai truy cập được
- Định dạng: jpg, png, webp
- Tốt nhất upload lên IPFS/Pinata trước

### **Giá:**

- Nhập đơn vị VND đầy đủ
- VD: 5.000.000.000 = 5 tỷ
- Hiển thị preview dưới dạng "X.XX tỷ VND"

### **Thông tin chi tiết:**

- Các trường bắt buộc có dấu \*
- Một số trường là dropdown
- Một số trường là readonly (tự động điền)

---

## 🎯 **MỤC ĐÍCH CUỐI CÙNG**

Trang này giúp Admin **NFT hóa bất động sản một cách đơn giản**:

1. ✅ Nhập thông tin BĐS qua form thân thiện
2. ✅ Tự động xử lý toàn bộ quy trình phức tạp
3. ✅ Tạo NFT chuẩn ERC-721 trên blockchain
4. ✅ Metadata lưu vĩnh viễn trên IPFS
5. ✅ Tích hợp MongoDB để quản lý
6. ✅ Hiển thị kết quả đầy đủ, rõ ràng

**Một action duy nhất = Bất động sản trở thành NFT! 🚀**
