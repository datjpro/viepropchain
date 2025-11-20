# Tích hợp API cho Trang Profile

## 📋 Tổng quan

Trang Profile đã được tích hợp với các API backend để hiển thị dữ liệu thực từ:

- **NFTs của user** từ blockchain
- **Properties (Bất động sản)** của user
- **Lịch sử giao dịch** từ marketplace
- **Thống kê tổng quan** (tự động tính toán)

## 🔌 API Endpoints được sử dụng

### 1. Lấy NFTs của User

```http
GET http://localhost:4008/api/marketplace/my-nfts/{walletAddress}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "tokenId": "1",
      "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
      "metadata": {
        "name": "Property NFT #1",
        "description": "Beautiful apartment in District 1",
        "image": "ipfs://QmXxx..."
      },
      "price": "50000000000000000000",
      "isListed": true
    }
  ]
}
```

### 2. Lấy Properties của User

```http
GET http://localhost:4000/api/properties/my-properties
Headers: Authorization: Bearer {jwt_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "xxx",
      "name": "Căn hộ cao cấp Q1",
      "propertyType": "apartment",
      "address": {
        "city": "TP. Hồ Chí Minh",
        "district": "Quận 1"
      },
      "area": 80,
      "bedrooms": 2,
      "bathrooms": 2,
      "images": ["QmXxx..."]
    }
  ]
}
```

### 3. Lấy Lịch sử Giao dịch

```http
GET http://localhost:4008/api/marketplace/transactions/{walletAddress}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "xxx",
      "tokenId": "1",
      "type": "sale",
      "from": "0x742d35Cc...",
      "to": "0x1234567...",
      "price": "50000000000000000000",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "transactionHash": "0xabc..."
    }
  ]
}
```

## 🔧 Cấu hình Backend

### Khởi động các Services cần thiết:

```bash
# 1. API Gateway (Port 4000)
cd database_viepropchain_microservice/services/api-gateway
npm start

# 2. Marketplace Service (Port 4008)
cd database_viepropchain_microservice/services/marketplace-service
npm start

# 3. Blockchain Service (Port 4004)
cd database_viepropchain_microservice/services/blockchain-service
npm start

# 4. Admin Service (Port 4003) - Cho properties API
cd database_viepropchain_microservice/services/admin-service
npm start

# 5. Ganache (Port 8545)
ganache -m "arm either chef prosper fish lonely rigid antique dawn stumble wife camera" --database.dbPath "./ganache-data-dev" --chain.networkId 1337 --server.port 8545
```

## 📊 Tính năng đã Implement

### ✅ Tab Overview

- Hiển thị thông tin tài khoản (email, ngày tham gia, trạng thái)
- Hiển thị thông tin ví (địa chỉ, network)
- Copy địa chỉ ví bằng cách click

### ✅ Tab Properties

- **Khi có dữ liệu:** Hiển thị grid các properties với:
  - Hình ảnh từ IPFS
  - Tên, địa điểm
  - Loại BĐS
  - Diện tích, phòng ngủ, phòng tắm
- **Khi chưa có:** Empty state với nút "Xem sàn giao dịch"

### ✅ Tab NFTs

- **Khi có dữ liệu:** Hiển thị grid các NFTs với:
  - Hình ảnh NFT từ metadata
  - Token ID badge
  - Tên và mô tả
  - Giá (nếu đang listed)
  - Trạng thái (Listed/Owned)
- **Khi chưa có:** Empty state với nút "Khám phá NFT"

### ✅ Tab Transaction History

- **Khi có dữ liệu:** Hiển thị danh sách giao dịch với:
  - Icon theo loại giao dịch (Bán/Mua/Chuyển)
  - NFT Token ID
  - Giá giao dịch
  - Địa chỉ From/To
  - Ngày giao dịch
  - Link xem trên Explorer
- **Khi chưa có:** Empty state

### ✅ Stats Cards (Tự động tính)

- **Properties:** Đếm từ API properties
- **NFTs Owned:** Đếm từ API NFTs
- **Transactions:** Đếm từ API transactions
- **Total Value:** Tổng giá trị các NFTs (ETH)

## 🎯 Cách hoạt động

### 1. Khi User Connect Wallet

```javascript
useEffect(() => {
  const fetchUserData = async () => {
    const walletAddress = account || user?.walletAddress;

    // Fetch NFTs
    const nftsResponse = await fetch(
      `http://localhost:4008/api/marketplace/my-nfts/${walletAddress}`
    );

    // Fetch Properties (cần JWT token)
    const token = localStorage.getItem("jwt_token");
    const propertiesResponse = await fetch(
      `http://localhost:4000/api/properties/my-properties`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Fetch Transactions
    const transactionsResponse = await fetch(
      `http://localhost:4008/api/marketplace/transactions/${walletAddress}`
    );
  };

  fetchUserData();
}, [account, user?.walletAddress]);
```

### 2. Auto-refresh khi:

- User connect/disconnect wallet
- Wallet address thay đổi
- Component mount lần đầu

## 🔐 Authentication

Profile page yêu cầu authentication. Nếu user chưa login, sẽ tự động redirect về trang chủ.

JWT token được lưu trong localStorage với key: `jwt_token`

## 🎨 UI Features

### Loading State

- Hiển thị "Đang tải..." khi fetch data
- Animation pulse effect

### Empty State

- Icon lớn với opacity thấp
- Text mô tả
- CTA button để navigate đến marketplace

### NFT/Property Cards

- Hover effect (translateY + shadow)
- Image từ IPFS với fallback
- Responsive grid layout
- Chi tiết đầy đủ

### Transaction Items

- Icon theo loại giao dịch
- Metadata đầy đủ
- Link to blockchain explorer
- Hover highlight

## 🐛 Troubleshooting

### Không hiển thị NFTs

1. Kiểm tra wallet đã connect chưa
2. Kiểm tra Marketplace Service đang chạy (Port 4008)
3. Kiểm tra wallet có NFTs trong Ganache không

### Không hiển thị Properties

1. Kiểm tra đã login chưa
2. Kiểm tra JWT token trong localStorage
3. Kiểm tra Admin Service đang chạy (Port 4003)

### API Error

1. Mở DevTools Console để xem error
2. Kiểm tra CORS settings của backend
3. Kiểm tra API endpoints đúng port chưa

## 📝 Lưu ý

1. **IPFS Images:** Sử dụng `https://ipfs.io/ipfs/{cid}` để load hình
2. **Price Format:** Backend trả về Wei, frontend convert sang ETH
3. **Date Format:** Sử dụng `toLocaleDateString()` để hiển thị
4. **Address Format:** Shorten địa chỉ thành `0x742d...0bEb2`

## 🚀 Next Steps

Có thể mở rộng thêm:

- [ ] Filter/Sort NFTs và Properties
- [ ] Pagination cho danh sách
- [ ] Refresh button
- [ ] Real-time updates với WebSocket
- [ ] Export transaction history
- [ ] NFT detail modal
- [ ] Property detail modal
