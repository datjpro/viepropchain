# Backend Integration Guide

## Giới thiệu

Sau khi deploy contracts, bạn có thể sử dụng thông tin ABI và địa chỉ contract để tích hợp vào backend.

## Cách sử dụng

### 1. Deploy contracts và tự động export

Khi bạn chạy migration, file `contracts.json` sẽ tự động được tạo trong thư mục `backend/`:

```bash
truffle migrate --network development
# hoặc
truffle migrate --reset --network development
```

### 2. Export thủ công (nếu cần)

Nếu bạn muốn export lại thông tin contracts sau khi đã deploy:

```bash
truffle exec scripts/export-contracts.js --network development
```

## Files được tạo

Sau khi chạy, các file sau sẽ được tạo trong thư mục `backend/`:

### 1. `contracts.json` (Tất cả thông tin)

```json
{
  "network": {
    "id": 1337,
    "type": "private"
  },
  "exportedAt": "2025-10-16T...",
  "contracts": {
    "ViePropChainNFT": {
      "address": "0x...",
      "abi": [...]
    },
    "Marketplace": {
      "address": "0x...",
      "abi": [...]
    }
  }
}
```

### 2. `ViePropChainNFT.json` (Riêng biệt)

```json
{
  "address": "0x...",
  "abi": [...]
}
```

### 3. `Marketplace.json` (Riêng biệt)

```json
{
  "address": "0x...",
  "abi": [...]
}
```

### 4. `.env.contracts` (Environment variables)

```env
NFT_CONTRACT_ADDRESS=0x...
MARKETPLACE_CONTRACT_ADDRESS=0x...
NETWORK_ID=1337
```

## Sử dụng trong Backend

### Node.js/Express Example

```javascript
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

// Đọc thông tin contracts
const contractsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "backend/contracts.json"), "utf8")
);

// Khởi tạo Web3
const web3 = new Web3("http://localhost:8545");

// Khởi tạo contract instances
const nftContract = new web3.eth.Contract(
  contractsData.contracts.ViePropChainNFT.abi,
  contractsData.contracts.ViePropChainNFT.address
);

const marketplaceContract = new web3.eth.Contract(
  contractsData.contracts.Marketplace.abi,
  contractsData.contracts.Marketplace.address
);

// Sử dụng contracts
async function getNFTOwner(tokenId) {
  return await nftContract.methods.ownerOf(tokenId).call();
}

async function getAllListings() {
  return await marketplaceContract.methods.getAllListings().call();
}
```

### Python/Flask Example

```python
from web3 import Web3
import json

# Đọc thông tin contracts
with open('backend/contracts.json', 'r') as f:
    contracts_data = json.load(f)

# Khởi tạo Web3
w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))

# Khởi tạo contract instances
nft_contract = w3.eth.contract(
    address=contracts_data['contracts']['ViePropChainNFT']['address'],
    abi=contracts_data['contracts']['ViePropChainNFT']['abi']
)

marketplace_contract = w3.eth.contract(
    address=contracts_data['contracts']['Marketplace']['address'],
    abi=contracts_data['contracts']['Marketplace']['abi']
)

# Sử dụng contracts
def get_nft_owner(token_id):
    return nft_contract.functions.ownerOf(token_id).call()

def get_all_listings():
    return marketplace_contract.functions.getAllListings().call()
```

### TypeScript/NestJS Example

```typescript
import Web3 from "web3";
import * as contractsData from "./backend/contracts.json";

export class Web3Service {
  private web3: Web3;
  private nftContract: any;
  private marketplaceContract: any;

  constructor() {
    this.web3 = new Web3("http://localhost:8545");

    this.nftContract = new this.web3.eth.Contract(
      contractsData.contracts.ViePropChainNFT.abi as any,
      contractsData.contracts.ViePropChainNFT.address
    );

    this.marketplaceContract = new this.web3.eth.Contract(
      contractsData.contracts.Marketplace.abi as any,
      contractsData.contracts.Marketplace.address
    );
  }

  async getNFTOwner(tokenId: number): Promise<string> {
    return await this.nftContract.methods.ownerOf(tokenId).call();
  }

  async getAllListings(): Promise<any[]> {
    return await this.marketplaceContract.methods.getAllListings().call();
  }
}
```

## Environment Variables

Bạn có thể sử dụng file `.env.contracts` để load địa chỉ contracts:

### Node.js với dotenv

```javascript
require("dotenv").config({ path: "./backend/.env.contracts" });

const NFT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_CONTRACT_ADDRESS;
```

### Python với python-dotenv

```python
from dotenv import load_dotenv
import os

load_dotenv('backend/.env.contracts')

NFT_ADDRESS = os.getenv('NFT_CONTRACT_ADDRESS')
MARKETPLACE_ADDRESS = os.getenv('MARKETPLACE_CONTRACT_ADDRESS')
```

## Lưu ý

- Các file trong thư mục `backend/` sẽ được tạo lại mỗi khi bạn deploy contracts
- Đảm bảo Ganache đang chạy trước khi export contracts
- Nếu deploy trên testnet/mainnet, hãy thay đổi `--network` tương ứng
- Không commit file `.env.contracts` nếu chứa thông tin nhạy cảm về mainnet

## Troubleshooting

### Contract not deployed

```bash
# Chạy migration trước
truffle migrate --network development
# Sau đó export
truffle exec scripts/export-contracts.js --network development
```

### File không được tạo

```bash
# Kiểm tra quyền ghi file
# Thử tạo thư mục backend thủ công
mkdir backend
```
