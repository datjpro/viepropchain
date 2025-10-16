# 🎨 Hướng Dẫn Hiển Thị NFT Trong MetaMask

## ❓ Tại sao NFT không tự động hiển thị?

**MetaMask KHÔNG tự động phát hiện NFT** trên mạng local (Ganache). Bạn cần **import thủ công** từng NFT.

## 🔍 Kiểm tra NFT

### 1. Chạy script kiểm tra

```bash
truffle exec scripts/check-nfts.js --network development
```

Script này sẽ hiển thị:

- ✅ Địa chỉ contract NFT
- ✅ Tổng số NFT đã mint
- ✅ Danh sách NFT của bạn (Token IDs)

### 2. Kiểm tra cho địa chỉ cụ thể

```bash
truffle exec scripts/check-nfts.js 0xYourAddress --network development
```

## 🎨 Mint NFT Mới

### 1. Mint cho địa chỉ mặc định (account[1])

```bash
truffle exec scripts/mint-nft.js --network development
```

### 2. Mint cho địa chỉ cụ thể

```bash
truffle exec scripts/mint-nft.js 0xYourAddress --network development
```

## 📱 Thêm NFT Vào MetaMask

### Bước 1: Lấy thông tin

Chạy script check để lấy:

- **Contract Address**: Địa chỉ của ViePropChainNFT contract
- **Token ID**: ID của NFT bạn sở hữu (ví dụ: 1, 2, 3...)

### Bước 2: Import trong MetaMask

1. **Mở MetaMask**

   - Đảm bảo đã kết nối đúng account
   - Đảm bảo đang ở mạng đúng (Ganache - localhost:8545)

2. **Chuyển sang tab NFTs**

   - Nhấn vào tab "NFTs" ở giữa màn hình
   - (Nếu không thấy tab này, vào Settings → Experimental → Enable NFT detection)

3. **Import NFT**
   - Kéo xuống dưới cùng
   - Nhấn nút "Import NFT" hoặc "Import tokens"
4. **Nhập thông tin**

   ```
   Address: 0x... (địa chỉ contract từ script check-nfts)
   Token ID: 1 (hoặc số khác từ danh sách NFT của bạn)
   ```

5. **Nhấn Import**
   - NFT sẽ xuất hiện trong danh sách

## 🔄 Tự động hiển thị NFT (Tùy chọn)

Để NFT tự động hiển thị, bạn cần deploy lên **mạng testnet** (Goerli, Sepolia) hoặc **mainnet**:

### 1. NFT cần có metadata hợp lệ

```javascript
{
  "name": "Property #1",
  "description": "Bất động sản tại Hà Nội",
  "image": "https://ipfs.io/ipfs/Qm...",
  "attributes": [...]
}
```

### 2. Metadata phải được host

- **IPFS** (khuyên dùng): `ipfs://QmXxx...`
- **HTTP**: `https://yourdomain.com/metadata/1.json`

### 3. Cập nhật contract để support metadata

Contract hiện tại đã support `ERC721URIStorage`, vì vậy bạn chỉ cần:

```javascript
// Khi mint, truyền URL metadata
await nftContract.mint(recipientAddress, "https://ipfs.io/ipfs/QmYourMetadata");
```

## 🐛 Troubleshooting

### NFT không hiển thị sau khi import?

1. **Kiểm tra owner**

   ```bash
   truffle console --network development
   ```

   ```javascript
   let nft = await ViePropChainNFT.deployed();
   await nft.ownerOf(1); // Thay 1 bằng token ID
   ```

2. **Kiểm tra mạng**

   - MetaMask phải kết nối đúng Ganache (localhost:8545)
   - Chain ID phải là 1337

3. **Kiểm tra địa chỉ contract**
   - Chạy lại `check-nfts.js` để xác nhận địa chỉ
   - Copy chính xác địa chỉ (không thiếu ký tự)

### Lỗi "Token ID không hợp lệ"?

```bash
# Kiểm tra token có tồn tại không
truffle console --network development
```

```javascript
let nft = await ViePropChainNFT.deployed();
let totalSupply = await nft.tokenCounter();
console.log("Total tokens:", totalSupply.toString());
```

## 💡 Tips

1. **Ganache vs Testnet**

   - Ganache: Phải import thủ công
   - Testnet/Mainnet: MetaMask tự động detect (nếu có metadata)

2. **Metadata quan trọng**

   - Không có metadata → NFT hiển thị nhưng không có ảnh
   - Có metadata → NFT hiển thị đầy đủ tên, ảnh, mô tả

3. **OpenSea Standard**
   Để NFT tương thích với OpenSea:

   ```json
   {
     "name": "Property Name",
     "description": "Description",
     "image": "ipfs://...",
     "attributes": [
       { "trait_type": "Location", "value": "Hanoi" },
       { "trait_type": "Area", "value": "100m²" }
     ]
   }
   ```

4. **IPFS Upload**
   - Sử dụng [Pinata](https://pinata.cloud) (free)
   - Hoặc [NFT.storage](https://nft.storage) (free)
   - Upload ảnh → lấy CID → upload metadata → mint NFT

## 📚 Scripts có sẵn

```bash
# Kiểm tra NFT
truffle exec scripts/check-nfts.js --network development

# Mint NFT mới
truffle exec scripts/mint-nft.js --network development

# Mint cho địa chỉ cụ thể
truffle exec scripts/mint-nft.js 0xAddress --network development

# Check cho địa chỉ cụ thể
truffle exec scripts/check-nfts.js 0xAddress --network development
```

## 🎯 Kết luận

- ❌ MetaMask **KHÔNG** tự động detect NFT trên Ganache
- ✅ Bạn **PHẢI** import thủ công bằng Contract Address + Token ID
- ✅ Sử dụng scripts để kiểm tra và lấy thông tin
- 💡 Để tự động detect, cần deploy lên testnet/mainnet với metadata hợp lệ
