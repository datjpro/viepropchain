# 🎯 Admin Header - Business Navigation Guide

## ✅ Updated Admin Navigation

### **New Menu Structure:**

```
📊 Dashboard       → /admin/dashboard      - Tổng quan hệ thống
🏠 Bất động sản    → /admin/properties     - Quản lý properties database
🎨 Mint NFT        → /admin/nft            - Tạo NFT mới cho BĐS
📋 NFT Manager     → /admin/list-nft       - Quản lý danh sách NFTs
🏪 Marketplace     → /admin/marketplace    - Quản lý chợ (Coming Soon)
🔑 Cho thuê        → /admin/rentals        - Quản lý rental (Coming Soon)
👥 Users           → /admin/users          - Quản lý người dùng
```

---

## 📋 Menu Items Detail

### **1. Dashboard (📊)**

- **Route:** `/admin/dashboard`
- **Function:** Tổng quan hệ thống
- **Features:**
  - Stats cards (Properties, Users, NFTs, Revenue)
  - System health monitoring
  - Recent activities
  - Quick actions

### **2. Bất động sản (🏠)**

- **Route:** `/admin/properties`
- **Function:** Quản lý properties database
- **Features:**
  - List all properties
  - Filter by status (Draft, Published, Minted, For Sale, Sold)
  - Search properties
  - View property details
  - Delete properties
  - Pagination

### **3. Mint NFT (🎨)**

- **Route:** `/admin/nft`
- **Function:** Tạo NFT mới cho bất động sản
- **Features:**
  - Property type templates (Apartment, House, Land, etc.)
  - Dynamic form fields based on property type
  - Image upload to IPFS
  - Metadata generation
  - Mint NFT on-chain
  - One-click create + mint

### **4. NFT Manager (📋)**

- **Route:** `/admin/list-nft`
- **Function:** Quản lý danh sách NFTs đã mint
- **Features:**
  - List all minted NFTs
  - Filter by status
  - Search NFTs
  - View NFT details & metadata
  - View on blockchain
  - Transfer/Burn functions

### **5. Marketplace (🏪) - Coming Soon**

- **Route:** `/admin/marketplace`
- **Status:** 🚧 Under Development
- **Planned Features:**
  - Quản lý listings (sale & rental)
  - Approve/reject listings
  - View offers
  - Transaction history
  - Commission management

### **6. Cho thuê (🔑) - Coming Soon**

- **Route:** `/admin/rentals`
- **Status:** 🚧 Under Development
- **Planned Features:**
  - Rental listings management
  - Active rentals tracking
  - Rental history
  - ERC4907 user management
  - Expiration monitoring

### **7. Users (👥)**

- **Route:** `/admin/users`
- **Function:** Quản lý người dùng
- **Features:**
  - List all users
  - Filter (With wallet, No wallet, Verified)
  - Search users
  - View user details
  - Update user roles
  - Wallet linking status

---

## 🎨 Header Features

### **Desktop View:**

```
[Logo] [Nav Items...........................] [Email] [Logout]
```

### **Tablet View (1024px):**

```
[Logo]                              [Email] [Logout]
[Nav Items centered...........................]
```

### **Mobile View (768px):**

```
[Logo]                                   [Hamburger]
[Mobile Menu Dropdown when clicked]
```

---

## 🔐 User Menu

**Right side of header:**

- **Email display:** Shows logged-in admin email
- **Logout button:** 🚪 Đăng xuất
  - Calls `logout()` from AuthContext
  - Clears token from localStorage
  - Redirects to home page

---

## 🎯 Business Workflows

### **Workflow 1: Property → NFT → Marketplace**

```
1. Bất động sản → Create property
2. Mint NFT → Create NFT for property
3. Marketplace → List NFT for sale (Coming Soon)
```

### **Workflow 2: Rental Management**

```
1. NFT Manager → View available NFTs
2. Cho thuê → Create rental listing (Coming Soon)
3. Marketplace → Manage active rentals (Coming Soon)
```

### **Workflow 3: User Management**

```
1. Users → View user list
2. Users → Verify user wallet
3. Dashboard → Monitor user growth
```

---

## 📱 Responsive Behavior

### **Desktop (>1024px):**

- Full horizontal menu
- User menu visible
- All labels shown

### **Tablet (768px - 1024px):**

- Menu wraps to second line
- User email hidden
- Icons + text labels

### **Mobile (<768px):**

- Hamburger menu
- Dropdown navigation
- Mobile user section at bottom
- Full-width items

---

## 🎨 Visual Design

### **Colors:**

- **Header background:** Purple gradient `#667eea → #764ba2`
- **Active item:** White overlay 25%
- **Hover:** White overlay 15%
- **Coming Soon badge:** Red `#f56565`

### **Typography:**

- **Logo:** 20px, bold
- **Nav items:** 14px, semi-bold
- **User email:** 13px

### **Spacing:**

- **Header height:** 70px
- **Item padding:** 10px 20px
- **Item gap:** 8px

---

## 🛠️ Implementation Details

### **Import:**

```javascript
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
```

### **Usage:**

```javascript
<AdminHeader />
```

### **Required Contexts:**

- `AuthContext` - For user info and logout
- `react-router-dom` - For navigation

---

## ✅ Testing Checklist

- [ ] Logo links to dashboard
- [ ] All active routes highlight correctly
- [ ] Coming Soon items are disabled
- [ ] Hover effects work
- [ ] User email displays correctly
- [ ] Logout button works
- [ ] Mobile hamburger menu opens/closes
- [ ] Responsive design works on all screen sizes
- [ ] Navigation persists across page transitions

---

## 🔮 Future Enhancements

### **Planned:**

1. **Dropdown menus** for grouped items
2. **Notifications badge** on relevant items
3. **Search bar** in header
4. **Theme toggle** (Light/Dark mode)
5. **Quick actions menu**
6. **Breadcrumbs** for deep navigation

### **Marketplace Menu (Soon):**

- View listings
- Pending approvals
- Transaction history
- Sales analytics

### **Rentals Menu (Soon):**

- Active rentals
- Rental requests
- Expiration alerts
- Rental history

---

## 📞 Summary

**Updated Menu Items:**
✅ Dashboard
✅ Bất động sản (Properties)
✅ Mint NFT
✅ NFT Manager (List)
🚧 Marketplace (Coming Soon)
🚧 Cho thuê (Coming Soon)
✅ Users

**New Features:**
✅ User email display
✅ Logout button
✅ Improved responsive design
✅ Tooltip descriptions
✅ Better visual hierarchy
✅ Mobile user section

**Business Focus:**
🎯 Property management workflow
🎯 NFT lifecycle tracking
🎯 User administration
🎯 Future marketplace integration
