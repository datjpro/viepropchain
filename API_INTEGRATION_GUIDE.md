# ViePropChain - API Integration Guide

## 📋 Tổng Quan

Toàn bộ hệ thống ViePropChain sử dụng **API Gateway** làm điểm vào duy nhất cho frontend. Tất cả các services backend được truy cập thông qua API Gateway.

## 🏗️ Kiến Trúc

```
Frontend (React - Port 3000)
    ↓
API Gateway (Port 4000) - Điểm vào duy nhất
    ↓
    ├─ Auth Service (Port 4010) - Gmail OAuth + Wallet Linking
    ├─ IPFS Service (Port 4002) - Upload files
    ├─ Admin Service (Port 4003) - CRUD Properties
    ├─ Blockchain Service (Port 4004) - Mint NFT
    ├─ Query Service (Port 4005) - Read-only queries
    ├─ User Service (Port 4006) - User profiles
    └─ KYC Service (Port 4007) - KYC verification
```

## 🚀 Khởi Động Services

### 1. Start API Gateway

```bash
cd database_viepropchain_microservice/services/api-gateway
npm start
```

### 2. Start Backend Services

```bash
# Terminal 1: Auth Service (Gmail OAuth)
cd database_viepropchain_microservice/services/auth-service
npm start

# Terminal 2: IPFS Service
cd database_viepropchain_microservice/services/ipfs-service
npm start

# Terminal 3: Admin Service
cd database_viepropchain_microservice/services/admin-service
npm start

# Terminal 4: Blockchain Service
cd database_viepropchain_microservice/services/blockchain-service
npm start

# Terminal 5: Query Service
cd database_viepropchain_microservice/services/query-service
npm start

# Terminal 6: User Service
cd database_viepropchain_microservice/services/user-service
npm start

# Terminal 7: KYC Service
cd database_viepropchain_microservice/services/kyc-service
npm start
```

### 3. Start Frontend

```bash
cd viepropchain
npm start
```

## 📡 API Routes

### Auth Service (Gmail OAuth)

- `GET  /api/auth/google` - Đăng nhập bằng Gmail
- `GET  /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/link-wallet/message` - Lấy message để ký
- `POST /api/auth/link-wallet` - Link wallet với tài khoản
- `POST /api/auth/unlink-wallet` - Unlink wallet

### KYC Service

- `POST /api/kyc` - Submit KYC
- `GET  /api/kyc/me` - Lấy KYC của user hiện tại
- `GET  /api/kyc/me/verified` - Check trạng thái verified
- `GET  /api/kyc/verified/all` - Lấy tất cả users đã verified
- `GET  /api/kyc/statistics` - Thống kê KYC

### User Service

- `GET  /api/user/profile/me` - Lấy profile của user hiện tại
- `GET  /api/user/profile/user/:userId` - Lấy profile theo userId
- `PUT  /api/user/profile/user/:userId` - Cập nhật profile
- `GET  /api/user/profile/user/:userId/favorites` - Lấy favorites
- `POST /api/user/profile/user/:userId/favorites` - Thêm favorite
- `DELETE /api/user/profile/user/:userId/favorites/:propertyId` - Xóa favorite

### Property Service (Admin)

- `POST /api/admin/properties` - Tạo property mới
- `GET  /api/admin/properties` - Lấy danh sách properties
- `GET  /api/admin/properties/:id` - Lấy chi tiết property
- `PUT  /api/admin/properties/:id` - Cập nhật property
- `DELETE /api/admin/properties/:id` - Xóa property
- `POST /api/admin/properties/:id/mint` - Mint property thành NFT

### Property Service (Query - Public)

- `GET  /api/query/properties` - Search properties với filters
- `GET  /api/query/properties/:id` - Lấy chi tiết property
- `GET  /api/query/properties/featured/list` - Lấy featured properties
- `POST /api/query/properties/:id/view` - Track view
- `GET  /api/query/stats/overview` - Thống kê tổng quan
- `GET  /api/query/stats/price-trends` - Xu hướng giá
- `GET  /api/query/nfts/:tokenId` - Lấy NFT info
- `GET  /api/query/locations/cities` - Lấy danh sách cities
- `GET  /api/query/locations/districts` - Lấy danh sách districts

### IPFS Service

- `POST /api/ipfs/upload/image` - Upload ảnh
- `POST /api/ipfs/upload/document` - Upload tài liệu
- `POST /api/ipfs/upload/metadata` - Upload metadata JSON
- `GET  /api/ipfs/content/:cid` - Lấy content theo CID

### Blockchain Service

- `GET  /api/blockchain/health` - Health check
- `POST /api/blockchain/mint` - Mint NFT (Admin)
- `GET  /api/blockchain/nft/:tokenId` - Lấy NFT info
- `GET  /api/blockchain/nfts/:owner` - Lấy NFTs của owner
- `POST /api/blockchain/transfer` - Transfer NFT
- `GET  /api/blockchain/token-counter` - Lấy tổng số NFT đã mint

## 💻 Sử Dụng Trong Frontend

### Import Services

```javascript
import {
  authService,
  kycService,
  userService,
  propertyService,
  ipfsService,
  blockchainService,
} from "./services";
```

### Example: Gmail Login

```javascript
// AuthContext.js đã tích hợp sẵn
// User chỉ cần click "Login with Gmail"
const { login, user, isAuthenticated } = useAuth();

// Login
login(); // Redirect đến Google OAuth

// Check user
if (isAuthenticated) {
  console.log("User:", user);
  console.log("Email:", user.email);
  console.log("Wallet:", user.walletAddress); // null nếu chưa link
}
```

### Example: Submit KYC

```javascript
import { kycService } from "../services";

const submitKYC = async () => {
  try {
    const result = await kycService.submitKYC({
      fullName: "Nguyen Van A",
      idNumber: "123456789012",
    });

    console.log("KYC submitted:", result);
  } catch (error) {
    console.error("KYC error:", error);
  }
};
```

### Example: Link Wallet

```javascript
import { authService } from "../services";
import { ethers } from "ethers";

const linkWallet = async (walletAddress) => {
  try {
    // 1. Get message to sign
    const { message } = await authService.getLinkWalletMessage(walletAddress);

    // 2. Sign message with MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);

    // 3. Link wallet
    const result = await authService.linkWallet(walletAddress, signature);
    console.log("Wallet linked:", result);
  } catch (error) {
    console.error("Link wallet error:", error);
  }
};
```

### Example: Search Properties

```javascript
import { propertyService } from "../services";

const searchProperties = async () => {
  try {
    const result = await propertyService.searchProperties({
      page: 1,
      limit: 20,
      city: "Ho Chi Minh City",
      minPrice: 1000000000,
      maxPrice: 5000000000,
      propertyType: "villa",
    });

    console.log("Properties:", result.data);
    console.log("Total:", result.pagination.total);
  } catch (error) {
    console.error("Search error:", error);
  }
};
```

### Example: Upload Image

```javascript
import { ipfsService } from "../services";

const uploadImage = async (file, propertyId) => {
  try {
    const result = await ipfsService.uploadImage(file, propertyId);

    console.log("Image uploaded:", result.data.cid);
    console.log("URL:", result.data.url);
    console.log("IPFS URL:", result.data.ipfsUrl);
  } catch (error) {
    console.error("Upload error:", error);
  }
};
```

### Example: Mint NFT (Admin)

```javascript
import { propertyService } from "../services";

const mintPropertyNFT = async (propertyId, recipientWallet) => {
  try {
    const result = await propertyService.mintPropertyNFT(
      propertyId,
      recipientWallet
    );

    console.log("NFT minted:", result.data.tokenId);
    console.log("Transaction:", result.data.transactionHash);
  } catch (error) {
    console.error("Mint error:", error);
  }
};
```

## 🔐 Authentication Flow

### 1. Gmail OAuth Login

```
User clicks "Login with Gmail"
    ↓
Frontend redirects to: /api/auth/google
    ↓
API Gateway forwards to: Auth Service (4010)
    ↓
Google OAuth consent screen
    ↓
User grants permission
    ↓
Redirect to callback: /api/auth/google/callback
    ↓
Auth Service creates JWT token
    ↓
Redirect to frontend with token: http://localhost:3000?token=xxx
    ↓
Frontend saves token to localStorage
    ↓
Frontend uses token for API calls
```

### 2. API Authentication

```javascript
// Token tự động được thêm vào header
// File: services/api.js

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("viepropchain_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📝 Environment Variables

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:4000
```

### API Gateway (.env)

```env
PORT=4000
```

### Auth Service (.env)

```env
PORT=4010
MONGODB_URI=mongodb+srv://...
JWT_SECRET=viepropchain-secret-key-2025
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:4010/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing

### Test với Postman

Import file: `ViePropChain_Gmail_OAuth_Flow.postman_collection.json`

**Lưu ý:** Google OAuth phải test bằng Browser, không test được trong Postman!

### Test Flow

1. Start tất cả services
2. Mở browser: `http://localhost:4010/auth/google`
3. Login bằng Gmail
4. Copy JWT token từ URL
5. Paste token vào Postman Environment
6. Test các endpoints khác trong Postman

## 🐛 Troubleshooting

### API Gateway not available

```bash
# Check API Gateway đang chạy
curl http://localhost:4000/health
```

### Service not responding

```bash
# Check từng service
curl http://localhost:4010/health  # Auth
curl http://localhost:4002/health  # IPFS
curl http://localhost:4003/health  # Admin
curl http://localhost:4004/health  # Blockchain
curl http://localhost:4005/health  # Query
curl http://localhost:4006/health  # User
curl http://localhost:4007/health  # KYC
```

### CORS Error

Đảm bảo API Gateway có CORS config cho frontend:

```javascript
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
```

## 📚 Tài Liệu Tham Khảo

- [Gmail OAuth Flow](./GMAIL_AUTH_ARCHITECTURE.md)
- [Wallet Linking Guide](./WALLET_LINKING_GUIDE.md)
- [Postman Collection](./ViePropChain_Gmail_OAuth_Flow.postman_collection.json)
