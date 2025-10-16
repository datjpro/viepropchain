# 🚀 Hướng dẫn khởi động Ganache đúng cách

## ⚠️ Vấn đề Network ID

Khi Ganache khởi động mỗi lần với network ID khác nhau, Truffle sẽ không tìm thấy contract đã deploy.

## ✅ Giải pháp: Sử dụng Network ID cố định

### Cách 1: Ganache CLI (Khuyên dùng)

```powershell
# Khởi động với network ID 1337 và lưu database
ganache-cli --networkId 1337 --port 8545 --db ./ganache-data-dev
```

**Tham số quan trọng:**

- `--networkId 1337`: Network ID cố định (quan trọng!)
- `--port 8545`: Port chuẩn của Ethereum
- `--db ./ganache-data-dev`: Lưu trạng thái blockchain vào folder

### Cách 2: Ganache GUI

1. Mở Ganache GUI
2. Chọn "New Workspace" hoặc mở workspace có sẵn
3. Vào Settings → Server:
   - **Port Number**: `8545`
   - **Network ID**: `1337`
   - **Hostname**: `127.0.0.1`
4. Lưu và restart workspace

## 📋 Quy trình làm việc đầy đủ

### 1. Khởi động Ganache

```powershell
# Terminal 1 - Khởi động Ganache
ganache-cli --networkId 1337 --port 8545 --db ./ganache-data-dev
```

### 2. Deploy Contracts (lần đầu hoặc sau khi thay đổi code)

```powershell
# Terminal 2 - Deploy
truffle migrate --reset --network development
```

### 3. Kiểm tra NFT

```powershell
# Xem danh sách NFT và lấy thông tin contract
truffle exec scripts/check-nfts.js --network development
```

### 4. Mint NFT mới

```powershell
# Mint cho account mặc định
truffle exec scripts/mint-nft.js --network development

# Mint cho địa chỉ cụ thể
truffle exec scripts/mint-nft.js 0xYourAddress --network development
```

### 5. Chạy React App

```powershell
# Terminal 3 - Frontend
npm start
```

## 🔧 Nếu gặp lỗi "network mismatch"

```powershell
# Xóa build cũ và deploy lại
Remove-Item -Recurse -Force .\build\contracts ; truffle migrate --reset --network development
```

## 💡 Tips

### Giữ database Ganache giữa các lần chạy

```powershell
ganache-cli --networkId 1337 --port 8545 --db ./ganache-data-dev
```

- Lợi ích: Contract address không đổi, NFT được giữ lại

### Xóa database và bắt đầu lại

```powershell
# Xóa folder database
Remove-Item -Recurse -Force .\ganache-data-dev

# Khởi động lại Ganache
ganache-cli --networkId 1337 --port 8545 --db ./ganache-data-dev

# Deploy lại contracts
truffle migrate --reset --network development
```

## 🎯 Cấu hình hiện tại

File `truffle-config.js` đã được cấu hình:

```javascript
networks: {
  development: {
    host: "127.0.0.1",
    port: 8545,
    network_id: "1337", // ← Network ID cố định
  }
}
```

## ⚠️ Lưu ý quan trọng

1. **Luôn dùng network ID 1337** khi khởi động Ganache
2. **Không dùng `network_id: "*"`** trong truffle-config (sẽ gây mismatch)
3. **Dùng --db** để lưu trạng thái blockchain giữa các lần chạy
4. **Deploy lại** sau mỗi lần restart Ganache (nếu không dùng --db)

## 📱 MetaMask Configuration

Sau khi Ganache chạy, cấu hình MetaMask:

1. **Add Network**

   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. **Import Account**

   - Copy private key từ Ganache
   - Import vào MetaMask

3. **Import NFT**
   - Chạy `check-nfts.js` để lấy Contract Address và Token ID
   - Vào MetaMask → NFTs → Import NFT
   - Nhập Contract Address và Token ID
