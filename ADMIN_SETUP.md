# Hướng dẫn Cấu hình Admin

## 🔐 Cấu hình địa chỉ Admin

Để thêm địa chỉ ví admin, bạn cần cập nhật file `src/contexts/AdminContext.js`:

### Bước 1: Lấy địa chỉ ví đã deploy smart contract

1. Kết nối MetaMask với địa chỉ ví đã deploy smart contract
2. Copy địa chỉ ví từ MetaMask

### Bước 2: Thêm địa chỉ vào ADMIN_ADDRESSES

Mở file `src/contexts/AdminContext.js` và tìm dòng:

```javascript
const ADMIN_ADDRESSES = [
  // Thêm các địa chỉ admin vào đây (lowercase)
  // VD: "0x1234567890123456789012345678901234567890".toLowerCase()
];
```

Thêm địa chỉ của bạn vào mảng (chuyển về lowercase):

```javascript
const ADMIN_ADDRESSES = [
  "0xYOUR_WALLET_ADDRESS_HERE".toLowerCase(),
  // Có thể thêm nhiều địa chỉ admin
  "0xANOTHER_ADMIN_ADDRESS".toLowerCase(),
];
```

### Ví dụ:

```javascript
const ADMIN_ADDRESSES = [
  "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4".toLowerCase(),
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2".toLowerCase(),
];
```

## 📝 Tích hợp với Smart Contract (Tùy chọn)

Nếu smart contract của bạn có hàm `owner()`, bạn có thể tự động lấy địa chỉ owner:

1. Import ABI của contract vào `AdminContext.js`
2. Thêm địa chỉ contract vào biến môi trường
3. Uncomment phần code check owner trong useEffect

```javascript
// Thêm vào đầu file
import CONTRACT_ABI from "../contracts/YourContract.json";

// Trong component
const CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS";

// Trong useEffect
if (web3Api.web3 && CONTRACT_ADDRESS) {
  const contract = new web3Api.web3.eth.Contract(
    CONTRACT_ABI,
    CONTRACT_ADDRESS
  );
  const owner = await contract.methods.owner().call();
  const ownerLower = owner.toLowerCase();
  setContractOwner(ownerLower);
  setIsAdmin(accountLower === ownerLower || isInAdminList);
}
```

## ✅ Kiểm tra

Sau khi cấu hình:

1. Kết nối ví với địa chỉ admin
2. Kiểm tra console log: `🔐 Admin check: { account: "0x...", isAdmin: true }`
3. Bạn sẽ thấy badge "👑 ADMIN" trên header
4. Link "⚙️ Admin Panel" sẽ xuất hiện
5. Truy cập `/admin/nft` sẽ không bị chặn

## 🛡️ Bảo mật

- **ProtectedRoute** sẽ tự động kiểm tra quyền admin
- User không phải admin sẽ thấy màn hình "Access Denied"
- User chưa kết nối ví sẽ được yêu cầu kết nối
- Admin status được check real-time khi account thay đổi

## 🎨 Tùy chỉnh giao diện

### Màu sắc Admin Badge

File: `src/components/Header/header.css`

```css
.admin-badge {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  /* Đổi màu badge tại đây */
}
```

### Text hiển thị

File: `src/components/Header/header.js`

```javascript
{
  isAdmin && (
    <span className="admin-badge">
      👑 {language === "en" ? "ADMIN" : "QUẢN TRỊ"}
    </span>
  );
}
```

## 🚀 Sử dụng

### Cho Admin:

1. Kết nối ví admin
2. Badge "👑 ADMIN" xuất hiện trên header
3. Click "⚙️ Admin Panel" để vào trang quản lý
4. Hoặc truy cập trực tiếp: `/admin/nft`

### Cho User thường:

1. Không thấy badge admin
2. Không thấy link admin panel
3. Truy cập `/admin/nft` sẽ bị chặn với thông báo "Access Denied"

## 📦 Các file đã tạo/cập nhật

✅ `src/contexts/AdminContext.js` - Context quản lý admin
✅ `src/components/ProtectedRoute/ProtectedRoute.js` - Component bảo vệ route
✅ `src/components/ProtectedRoute/ProtectedRoute.css` - Style cho protected route
✅ `src/App.js` - Thêm AdminProvider và ProtectedRoute
✅ `src/components/Header/header.js` - Hiển thị admin UI
✅ `src/components/Header/header.css` - Style cho admin badge & link

## 🔧 Troubleshooting

### Admin badge không hiện

- Check console log: `🔐 Admin check`
- Verify địa chỉ trong ADMIN_ADDRESSES đã lowercase
- Đảm bảo địa chỉ ví đã kết nối đúng

### Vẫn bị chặn khi vào /admin/nft

- Check AdminProvider đã wrap đúng trong App.js
- Verify ProtectedRoute đã wrap Nft component
- Check console không có error

### Admin status không update

- Check useEffect trong AdminContext có chạy không
- Verify account từ useWeb3 đã đúng
- Clear localStorage và reconnect wallet
