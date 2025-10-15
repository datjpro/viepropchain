# 🔐 Admin Access Setup - Quick Guide

## ✅ Bước 1: Lấy địa chỉ ví admin

**Option A - Từ MetaMask:**

1. Mở MetaMask
2. Chọn account đã deploy smart contract
3. Click để copy địa chỉ (VD: `0x5B38Da6a701c568545dCfcB03FcB875f56beddC4`)

**Option B - Từ Ganache:**

1. Mở Ganache
2. Copy địa chỉ account đầu tiên (thường là deployer)

**Option C - Tự động (Script):**

```bash
node get-admin-address.js
```

## ✅ Bước 2: Thêm vào AdminContext

Mở file: `src/contexts/AdminContext.js`

Tìm dòng 21-24:

```javascript
const ADMIN_ADDRESSES = [
  // Thêm các địa chỉ admin vào đây (lowercase)
];
```

Thay bằng:

```javascript
const ADMIN_ADDRESSES = [
  "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4".toLowerCase(), // Thay bằng địa chỉ của bạn
];
```

## ✅ Bước 3: Test

1. **Khởi động app:**

   ```bash
   npm start
   ```

2. **Kết nối MetaMask:**

   - Click "Kết nối Ví" trên header
   - Chọn account admin

3. **Kiểm tra:**

   - ✅ Badge "👑 ADMIN" xuất hiện
   - ✅ Link "⚙️ Admin Panel" / "⚙️ Quản lý" xuất hiện
   - ✅ Console log: `🔐 Admin check: { account: "0x...", isAdmin: true }`

4. **Truy cập admin:**
   - Click link "Admin Panel"
   - Hoặc vào trực tiếp: `http://localhost:3000/admin/nft`

## 🎯 Kết quả

### Với Admin Account:

- ✅ Thấy badge vàng "👑 ADMIN"
- ✅ Thấy link "⚙️ Admin Panel"
- ✅ Truy cập được `/admin/nft`

### Với User Account:

- ❌ Không thấy badge
- ❌ Không thấy admin link
- ❌ Truy cập `/admin/nft` → "Access Denied"

## 🔧 Troubleshooting

### Badge không hiện?

```javascript
// Check console:
// 🔐 Admin check: { account: "0x...", isAdmin: false }

// Fix:
// 1. Verify địa chỉ trong ADMIN_ADDRESSES đúng
// 2. Đảm bảo dùng .toLowerCase()
// 3. Reconnect wallet
```

### Vẫn bị chặn?

```javascript
// Check App.js có đúng structure:
<LanguageProvider>
  <Web3Provider>
    <AdminProvider>
      {" "}
      {/* ← Đảm bảo có dòng này */}
      <Router>
        <Routes>
          <Route
            path="/admin/nft"
            element={
              <ProtectedRoute>
                {" "}
                {/* ← Đảm bảo có wrapper này */}
                <Nft />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AdminProvider>
  </Web3Provider>
</LanguageProvider>
```

## 📦 Các file liên quan

| File                              | Mô tả                                             |
| --------------------------------- | ------------------------------------------------- |
| `src/contexts/AdminContext.js`    | ⚙️ Context quản lý admin - **CẦN SỬA DÒNG 21-24** |
| `src/components/ProtectedRoute/`  | 🛡️ Bảo vệ route admin                             |
| `src/components/Header/header.js` | 🎨 Hiển thị admin UI                              |
| `get-admin-address.js`            | 🔍 Script lấy địa chỉ admin                       |
| `ADMIN_SETUP.md`                  | 📖 Hướng dẫn chi tiết                             |

## 🚀 Quick Copy-Paste

```javascript
// Paste vào src/contexts/AdminContext.js (dòng 21-24)
const ADMIN_ADDRESSES = [
  "0xYOUR_WALLET_ADDRESS_HERE".toLowerCase(), // ← Thay địa chỉ của bạn vào đây
];
```

---

**🎉 Done! Bây giờ bạn đã có hệ thống phân quyền admin hoàn chỉnh!**
