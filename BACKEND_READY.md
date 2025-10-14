# ✅ SẴN SÀNG LÀM BACKEND - ViePropChain

## 🎯 Tóm tắt: BẠN ĐÃ CÓ ĐỦ MỌI THỨ!

---

## 📦 FILE QUAN TRỌNG NHẤT

### 1. `deployments/contract-abi.json` ⭐⭐⭐

**Đây là file chính bạn cần để làm backend!**

```javascript
const contractAbi = require("./deployments/contract-abi.json");

// Có sẵn:
// - 3 contract addresses
// - 3 contract ABIs đầy đủ
// - 10 account addresses
// - Network info (chainId, name)
```

### 2. `deployments/backend-example.js`

**File ví dụ đã test thành công!**

- ✅ Web3 setup với port 8545 (đúng)
- ✅ Contract initialization
- ✅ Các function mẫu: mint, get owner, get balance, listen events
- ✅ Export để dùng trong project khác

---

## 🚀 3 CÁCH BẮT ĐẦU

### Cách 1: Copy file vào backend project

```bash
cp deployments/contract-abi.json ../backend/config/
```

### Cách 2: Import trực tiếp

```javascript
const contractAbi = require("../viepropchain/deployments/contract-abi.json");
```

### Cách 3: Dùng module có sẵn

```javascript
const {
  web3,
  contracts,
} = require("../viepropchain/deployments/backend-example.js");
```

---

## 💻 SETUP BACKEND MỚI

### 1. Cài packages

```bash
npm install web3 express cors dotenv
```

### 2. Tạo file .env

```env
RPC_URL=http://localhost:8545
CHAIN_ID=1337
NFT_CONTRACT=0xA5FAf5e76a6336b0bAb5C2dCC8B88CEA64122AA2
MARKETPLACE_CONTRACT=0x81a567Cf00c2B862Aa250246e1C3973300a7ad33
OFFERS_CONTRACT=0xbb1De761881f47a6128C60dcf5aD954Df95d58D6
```

### 3. Code mẫu Express.js

```javascript
const express = require("express");
const { Web3 } = require("web3");
const contractAbi = require("./config/contract-abi.json");

const app = express();
const web3 = new Web3(process.env.RPC_URL || "http://localhost:8545");

// Initialize NFT contract
const nftContract = new web3.eth.Contract(
  contractAbi.contracts.ViePropChainNFT.abi,
  contractAbi.contracts.ViePropChainNFT.address
);

// API: Get token counter
app.get("/api/nft/count", async (req, res) => {
  const count = await nftContract.methods.tokenCounter().call();
  res.json({ count: count.toString() });
});

// API: Get NFT info
app.get("/api/nft/:tokenId", async (req, res) => {
  const { tokenId } = req.params;
  try {
    const owner = await nftContract.methods.ownerOf(tokenId).call();
    const uri = await nftContract.methods.tokenURI(tokenId).call();
    res.json({ tokenId, owner, uri });
  } catch (error) {
    res.status(404).json({ error: "NFT not found" });
  }
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
```

---

## 📊 THÔNG TIN CONTRACTS

### Addresses (Development Network)

```
ViePropChainNFT:  0xA5FAf5e76a6336b0bAb5C2dCC8B88CEA64122AA2
Marketplace:      0x81a567Cf00c2B862Aa250246e1C3973300a7ad33
Offers:           0xbb1De761881f47a6128C60dcf5aD954Df95d58D6
```

### Network

```
Name: development
Chain ID: 1337
RPC URL: http://localhost:8545
```

### Fees

```
Marketplace: 2%
Offers: 2.5% (250 basis points)
Fee Account: 0xC6890b26A32d9d92aefbc8635C4588247529CdfE
```

---

## 🧪 TEST

### Test backend-example.js

```bash
node deployments/backend-example.js
```

**Kết quả mong đợi:**

```
✅ Contract Information: OK
✅ Token Counter: 0
✅ Marketplace Config: 2% fee
✅ Offers Config: 2.5% fee
✅ All examples completed successfully!
```

---

## 📚 FUNCTIONS CÓ SẴN TRONG backend-example.js

### NFT Functions

- `getTokenCounter()` - Đếm số NFT đã mint
- `getNFTOwner(tokenId)` - Lấy owner của NFT
- `getTokenURI(tokenId)` - Lấy metadata URI
- `getBalance(address)` - Số NFT của một địa chỉ
- `mintNFT(recipient, tokenURI, privateKey)` - Mint NFT mới

### Marketplace Functions

- `getMarketplaceConfig()` - Lấy config (fee, fee account)

### Offers Functions

- `getOffersConfig()` - Lấy config (fee, fee address)

### Event Functions

- `listenToEvents()` - Lắng nghe events real-time
- `getPastEvents(eventName, fromBlock)` - Lấy events trong quá khứ

---

## 🎨 CẤU TRÚC BACKEND GỢI Ý

```
backend/
├── config/
│   ├── contract-abi.json        ← Copy từ viepropchain/deployments/
│   └── web3.js
├── controllers/
│   ├── nft.controller.js
│   ├── marketplace.controller.js
│   └── offers.controller.js
├── services/
│   ├── contract.service.js
│   └── event.service.js
├── routes/
│   ├── nft.routes.js
│   ├── marketplace.routes.js
│   └── offers.routes.js
├── .env
├── .env.example
└── server.js
```

---

## 🔐 BẢO MẬT

### ⚠️ KHÔNG:

- ❌ Commit private keys lên Git
- ❌ Hardcode private keys trong code

### ✅ NÊN:

- ✅ Dùng .env file
- ✅ Thêm .env vào .gitignore
- ✅ Dùng environment variables

---

## 🔄 KHI DEPLOY LẠI CONTRACTS

Mỗi khi chạy:

```bash
truffle migrate --reset
```

→ File `contract-abi.json` sẽ **TỰ ĐỘNG UPDATE** với addresses mới!

Không cần làm gì thêm, chỉ cần restart backend.

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Contract ABIs đầy đủ
- [x] Contract Addresses
- [x] Ganache đang chạy (port 8545)
- [x] Web3 kết nối thành công
- [x] File example test OK
- [x] Documentation đầy đủ
- [x] 10 accounts có sẵn

---

## 🎉 BẠN ĐÃ SẴN SÀNG!

### Bước tiếp theo:

1. Tạo backend project
2. Copy `contract-abi.json`
3. Install `web3`
4. Code theo example
5. Build APIs

### Cần hỗ trợ?

- Xem file: `BACKEND_CHECKLIST.md` (chi tiết đầy đủ)
- Xem file: `deployments/README.md`
- Tham khảo: `deployments/backend-example.js`

---

**Good luck! 🚀**
