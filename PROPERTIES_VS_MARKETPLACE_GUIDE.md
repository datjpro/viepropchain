# Hướng dẫn sử dụng 2 trang mua/thuê NFT

## 🏘️ Properties Page (http://localhost:3000/properties)

**Dành cho NFT chưa có giá cố định - Tạo đấu giá/đề xuất**

- Hiển thị tất cả bất động sản đã được mint thành NFT
- NFT chưa được list trên marketplace với giá cố định
- **Chức năng:** Tạo đấu giá hoặc đề xuất giá để mua/thuê
- **Smart Contract:** Sử dụng `Auction.sol`
- **Modal:** `OfferNFTModal`

### Luồng hoạt động:

1. User nhấn "Đặt giá mua" hoặc "Đặt giá thuê"
2. OfferNFTModal mở ra cho phép nhập:
   - Giá đề xuất (ETH)
   - Thời gian đấu giá (1-30 ngày)
   - Với rental: số ngày thuê
3. Tạo auction trên blockchain với `createAuction()` hoặc `createRentalAuction()`
4. Chủ sở hữu NFT có thể xem và chấp nhận đề xuất

---

## 🛒 Marketplace Page (http://localhost:3000/marketplace)

**Dành cho NFT đã có giá cố định - Mua/thuê ngay lập tức**

- Hiển thị NFT đã được list trên marketplace với giá cố định
- Đã được duyệt và sẵn sàng giao dịch
- **Chức năng:** Mua hoặc thuê ngay với giá niêm yết
- **Smart Contract:** Sử dụng `Marketplace.sol`
- **Modal:** `BuyNFTModal` và `RentNFTModal`

### Luồng hoạt động:

1. User nhấn "Mua ngay" hoặc "Thuê ngay"
2. Modal mở ra hiển thị giá cố định
3. Xác nhận thanh toán bằng ETH
4. Giao dịch được thực hiện ngay lập tức với `buyItem()` hoặc `rentItem()`

---

## 🔄 Smart Contracts

### Auction.sol (Properties Page)

```solidity
- createAuction(tokenId, startingBid, duration)
- createRentalAuction(tokenId, pricePerDay, auctionDuration, rentalDays)
- placeBid(auctionId)
- endAuction(auctionId)
```

### Marketplace.sol (Marketplace Page)

```solidity
- listItem(tokenId, price)
- listForRent(tokenId, pricePerDay, maxDuration)
- buyItem(listingId)
- rentItem(listingId, rentalDays)
```

---

## 🎯 Tóm tắt phân biệt

| Tiêu chí           | Properties Page     | Marketplace Page         |
| ------------------ | ------------------- | ------------------------ |
| **Loại NFT**       | Chưa có giá cố định | Đã có giá cố định        |
| **Cơ chế**         | Đấu giá/Đề xuất     | Mua/thuê ngay            |
| **Smart Contract** | Auction.sol         | Marketplace.sol          |
| **Modal**          | OfferNFTModal       | BuyNFTModal/RentNFTModal |
| **Thời gian**      | Chờ chấp nhận       | Tức thì                  |
| **Giá**            | User đặt giá        | Giá cố định              |
