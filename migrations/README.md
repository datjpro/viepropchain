# Migration Guide for ViePropChain

Các file migration này sẽ deploy và cấu hình toàn bộ hệ thống smart contracts cho dự án ViePropChain.

## Thứ tự Deploy

1. **1_initial_migration.js** - Deploy contract Migrations (built-in của Truffle)
2. **2_deploy_contracts.js** - Deploy ViePropChainNFT và Marketplace contracts
3. **3_deploy_offers.js** - Deploy Offers contract và cấu hình
4. **4_complete_setup.js** - Verify và hiển thị thông tin deployment

## Cách chạy Migration

### Deploy tất cả contracts:

```bash
npx truffle migrate
```

### Deploy trên mạng cụ thể:

```bash
npx truffle migrate --network development
npx truffle migrate --network testnet
npx truffle migrate --network mainnet
```

### Reset và deploy lại:

```bash
npx truffle migrate --reset
```

## Thông tin Contracts

### ViePropChainNFT

- **Chức năng**: ERC721 NFT contract cho real estate tokens
- **Symbol**: VPC
- **Tính năng**: Mint NFT với metadata URI

### Marketplace

- **Chức năng**: Marketplace để list và bán NFT
- **Fee**: 2% (có thể thay đổi)
- **Tính năng**: List, buy, cancel listings

### Offers

- **Chức năng**: Hệ thống đặt offer cho NFT
- **Fee**: 2.5% (250 basis points)
- **Tính năng**: Make offer, cancel offer, accept offer

## Cấu hình sau khi Deploy

Sau khi chạy migration, bạn sẽ nhận được địa chỉ contracts. Cập nhật các địa chỉ này vào:

1. **Frontend React App**: Cập nhật contract addresses trong config
2. **Environment Variables**: Lưu addresses vào .env file
3. **Documentation**: Cập nhật README với addresses mới

## Kiểm tra Deployment

Sau khi migration hoàn thành, bạn có thể kiểm tra:

```bash
# Mở Truffle console
npx truffle console

# Kiểm tra contracts
let nft = await ViePropChainNFT.deployed()
let marketplace = await Marketplace.deployed()
let offers = await Offers.deployed()

# Xem địa chỉ contracts
console.log("NFT:", nft.address)
console.log("Marketplace:", marketplace.address)
console.log("Offers:", offers.address)
```

## Lưu ý quan trọng

1. **Backup Private Keys**: Luôn backup private keys của accounts deploy
2. **Contract Verification**: Verify contracts trên block explorer sau khi deploy
3. **Test trước**: Test kỹ trên testnet trước khi deploy mainnet
4. **Gas Fees**: Đảm bảo có đủ ETH để trả gas fees

## Troubleshooting

### Lỗi thường gặp:

1. **Out of gas**: Tăng gas limit trong truffle-config.js
2. **Contract already deployed**: Sử dụng --reset flag
3. **Network connection**: Kiểm tra RPC URL và network config
4. **Permission denied**: Đảm bảo account có đủ ETH và quyền deploy
