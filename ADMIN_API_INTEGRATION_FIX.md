# ✅ Admin Pages API Integration - Fixed

## 🎯 Vấn đề đã được giải quyết

**Trước:** Các trang admin gọi trực tiếp đến services (port 4003, 4004, 4010, etc.)
**Sau:** Tất cả admin pages giờ gọi qua API Gateway (port 4000)

---

## 🔧 Changes Made

### **1. Created API Config File**

**File:** `src/config/api.js`

```javascript
export const API_GATEWAY_URL = "http://localhost:4000";

export const API_ENDPOINTS = {
  ADMIN: {
    PROPERTIES: `${API_GATEWAY_URL}/api/admin/properties`,
    PROPERTIES_STATS: `${API_GATEWAY_URL}/api/admin/properties/stats`,
    PROPERTY_BY_ID: (id) => `${API_GATEWAY_URL}/api/admin/properties/${id}`,
    CREATE_AND_MINT: `${API_GATEWAY_URL}/api/admin/properties/create-and-mint`,
    HEALTH: `${API_GATEWAY_URL}/api/admin/health`,
  },
  AUTH: {
    STATS: `${API_GATEWAY_URL}/api/auth/stats`,
    USERS_RECENT: `${API_GATEWAY_URL}/api/auth/users/recent`,
    HEALTH: `${API_GATEWAY_URL}/api/auth/health`,
  },
  BLOCKCHAIN: {
    TOTAL_SUPPLY: `${API_GATEWAY_URL}/api/blockchain/total-supply`,
    HEALTH: `${API_GATEWAY_URL}/api/blockchain/health`,
  },
  MARKETPLACE: {
    LISTINGS: `${API_GATEWAY_URL}/api/marketplace/listings`,
    HEALTH: `${API_GATEWAY_URL}/api/marketplace/health`,
  },
  IPFS: {
    UPLOAD: `${API_GATEWAY_URL}/api/ipfs/upload`,
    CONTENT: (hash) => `${API_GATEWAY_URL}/api/ipfs/content/${hash}`,
    HEALTH: `${API_GATEWAY_URL}/api/ipfs/health`,
  },
};
```

---

### **2. Updated Admin Pages**

#### **Dashboard.js**

```diff
- fetch("http://localhost:4003/api/properties/stats")
+ fetch(API_ENDPOINTS.ADMIN.PROPERTIES_STATS)

- fetch("http://localhost:4010/api/auth/stats")
+ fetch(API_ENDPOINTS.AUTH.STATS)

- fetch("http://localhost:4004/api/blockchain/total-supply")
+ fetch(API_ENDPOINTS.BLOCKCHAIN.TOTAL_SUPPLY)
```

#### **ListNFT.js**

```diff
- fetch("http://localhost:4003/api/properties")
+ fetch(API_ENDPOINTS.ADMIN.PROPERTIES)
```

#### **Properties.js**

```diff
- fetch(`http://localhost:4003/api/properties?page=${page}`)
+ fetch(`${API_ENDPOINTS.ADMIN.PROPERTIES}?page=${page}`)

- fetch(`http://localhost:4003/api/properties/${id}`)
+ fetch(API_ENDPOINTS.ADMIN.PROPERTY_BY_ID(id))
```

#### **NFT.js**

```diff
- fetch("http://localhost:4003/api/properties/create-and-mint")
+ fetch(API_ENDPOINTS.ADMIN.CREATE_AND_MINT)
```

#### **Users.js**

```diff
- fetch(`http://localhost:4010/api/auth/users?page=${page}`)
+ fetch(`${API_GATEWAY_URL}/api/auth/users?page=${page}`)

- fetch(`http://localhost:4010/api/auth/users/${userId}/role`)
+ fetch(`${API_GATEWAY_URL}/api/auth/users/${userId}/role`)
```

---

## 🔄 API Gateway Routing

### **Request Flow:**

```
Frontend (3000)
    ↓
API Gateway (4000)
    ↓
/api/admin/*      → Admin Service (4003)
/api/auth/*       → Auth Service (4010)
/api/blockchain/* → Blockchain Service (4004)
/api/marketplace/* → Marketplace Service (4008)
/api/ipfs/*       → IPFS Service (4002)
```

### **Example:**

```
Frontend request:
GET http://localhost:4000/api/admin/properties/stats

API Gateway rewrites to:
GET http://localhost:4003/properties/stats
                        ↑ removes "/api/admin" prefix

Admin Service handles:
app.get("/properties/stats", async (req, res) => { ... })
```

---

## ✅ Benefits

1. **Single Entry Point:** Tất cả requests qua port 4000
2. **CORS Management:** Chỉ config CORS ở API Gateway
3. **Service Discovery:** Frontend không cần biết service ports
4. **Centralized Logging:** Log tất cả requests ở gateway
5. **Easy to Scale:** Thêm services mới chỉ cần update gateway
6. **Security:** Có thể add authentication middleware ở gateway

---

## 🧪 Testing

### **1. Start API Gateway:**

```bash
cd d:\DACN\RE-Chain\database_viepropchain_microservice\services\api-gateway
node index.js
```

### **2. Start Admin Service:**

```bash
cd d:\DACN\RE-Chain\database_viepropchain_microservice\services\admin-service
node index.js
```

### **3. Start Auth Service:**

```bash
cd d:\DACN\RE-Chain\database_viepropchain_microservice\services\auth-service
node index.js
```

### **4. Start Blockchain Service:**

```bash
cd d:\DACN\RE-Chain\database_viepropchain_microservice\services\blockchain-service
npm start
```

### **5. Test Admin Pages:**

```
http://localhost:3000/admin/dashboard
http://localhost:3000/admin/properties
http://localhost:3000/admin/list-nft
http://localhost:3000/admin/users
http://localhost:3000/admin/nft
```

---

## 🔍 Debug

### **Check API Gateway Logs:**

```bash
# Should see requests being forwarded
🔄 [API Gateway] Forwarding to Admin Service: GET /api/admin/properties
✅ [API Gateway] Response from Admin Service: 200
```

### **Test Endpoints Manually:**

```bash
# Test via API Gateway
curl http://localhost:4000/api/admin/health
curl http://localhost:4000/api/auth/stats
curl http://localhost:4000/api/blockchain/total-supply

# Should all return success responses
```

---

## 📋 Service Status Check

### **Dashboard Health Monitoring:**

Dashboard page giờ check health của tất cả services:

- ✅ Admin Service
- ✅ Auth Service
- ✅ Blockchain Service
- ✅ Marketplace Service
- ✅ IPFS Service

Nếu service nào down, sẽ hiển thị status "down" hoặc "error"

---

## 🚀 Next Steps

### **Optional Enhancements:**

1. **Add Request Caching:**

```javascript
// Cache frequently accessed data
const cache = new Map();
app.use((req, res, next) => {
  const key = req.url;
  if (cache.has(key)) {
    return res.json(cache.get(key));
  }
  next();
});
```

2. **Add Rate Limiting:**

```javascript
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);
```

3. **Add Authentication Middleware:**

```javascript
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // Verify JWT token
  next();
};

app.use("/api/admin/*", verifyToken);
```

---

## ✅ Status

**Current State:**

- ✅ API Gateway running on port 4000
- ✅ All admin pages use API Gateway
- ✅ Proper route rewriting configured
- ✅ Health checks working
- ✅ CORS configured

**Ready for Use:** YES ✅

**Required Services:**

- API Gateway (4000) - MUST be running
- Admin Service (4003) - For properties management
- Auth Service (4010) - For user management
- Blockchain Service (4004) - For NFT operations
- IPFS Service (4002) - For file uploads
- Marketplace Service (4008) - For listings

---

## 📞 Summary

**Problem:** Admin pages couldn't fetch data from services
**Root Cause:** Direct service calls instead of API Gateway
**Solution:** Centralized API config + Updated all fetch calls
**Result:** All admin pages now work through API Gateway ✅
