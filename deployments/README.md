# Contract ABI Files - Backend Integration Guide

## 📁 Files Available

### 1. `contract-abi.json` ⭐ **RECOMMENDED FOR BACKEND**

File tổng hợp tất cả ABI và thông tin contracts trong một file duy nhất.

**Cấu trúc:**

```json
{
  "network": "development",
  "chainId": 1337,
  "updatedAt": "2025-10-15T...",
  "contracts": {
    "ViePropChainNFT": {
      "name": "ViePropChainNFT",
      "address": "0x...",
      "abi": [...]
    },
    "Marketplace": {
      "name": "Marketplace",
      "address": "0x...",
      "abi": [...],
      "feePercent": "2",
      "feeAccount": "0x..."
    },
    "Offers": {
      "name": "Offers",
      "address": "0x...",
      "abi": [...],
      "feePercent": 250,
      "feeAddress": "0x..."
    }
  }
}
```

### 2. `abi/` directory

Thư mục chứa ABI riêng biệt cho từng contract:

- `ViePropChainNFT.json`
- `Marketplace.json`
- `Offers.json`

### 3. `backend-config-{network}.json`

Config đầy đủ cho backend với accounts và thông tin chi tiết.

### 4. `deployment-{network}.json`

Thông tin deployment đầy đủ bao gồm bytecode, compiler version, etc.

## 🚀 Usage in Backend

### Option 1: Sử dụng contract-abi.json (Recommended)

```javascript
// backend/config/contracts.js
const contractAbi = require("../../viepropchain/deployments/contract-abi.json");
const Web3 = require("web3");

// Initialize Web3
const web3 = new Web3(process.env.RPC_URL || "http://localhost:7545");

// Load contracts
const contracts = {
  nft: new web3.eth.Contract(
    contractAbi.contracts.ViePropChainNFT.abi,
    contractAbi.contracts.ViePropChainNFT.address
  ),

  marketplace: new web3.eth.Contract(
    contractAbi.contracts.Marketplace.abi,
    contractAbi.contracts.Marketplace.address
  ),

  offers: new web3.eth.Contract(
    contractAbi.contracts.Offers.abi,
    contractAbi.contracts.Offers.address
  ),
};

module.exports = { contracts, web3, contractAbi };
```

### Option 2: Sử dụng ABI riêng biệt

```javascript
const nftAbi = require("../../viepropchain/deployments/abi/ViePropChainNFT.json");
const marketplaceAbi = require("../../viepropchain/deployments/abi/Marketplace.json");
const offersAbi = require("../../viepropchain/deployments/abi/Offers.json");

// Lấy addresses từ contract-abi.json
const contractAbi = require("../../viepropchain/deployments/contract-abi.json");

const nftContract = new web3.eth.Contract(
  nftAbi,
  contractAbi.contracts.ViePropChainNFT.address
);
```

## 💡 Backend Examples

### 1. Express.js API

```javascript
// routes/nft.js
const express = require("express");
const router = express.Router();
const { contracts } = require("../config/contracts");

// Get NFT token counter
router.get("/token-counter", async (req, res) => {
  try {
    const counter = await contracts.nft.methods.tokenCounter().call();
    res.json({ tokenCounter: counter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get NFT owner
router.get("/owner/:tokenId", async (req, res) => {
  try {
    const owner = await contracts.nft.methods
      .ownerOf(req.params.tokenId)
      .call();
    res.json({ owner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get token URI
router.get("/token-uri/:tokenId", async (req, res) => {
  try {
    const uri = await contracts.nft.methods.tokenURI(req.params.tokenId).call();
    res.json({ tokenURI: uri });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Event Listener Service

```javascript
// services/eventListener.js
const { contracts, contractAbi } = require("../config/contracts");

class EventListener {
  constructor() {
    this.setupListeners();
  }

  setupListeners() {
    // Listen to NFT Transfer events
    contracts.nft.events
      .Transfer({
        fromBlock: "latest",
      })
      .on("data", (event) => {
        console.log("NFT Transfer:", {
          from: event.returnValues.from,
          to: event.returnValues.to,
          tokenId: event.returnValues.tokenId,
        });
        // Save to database or process
      })
      .on("error", console.error);

    // Listen to Marketplace ItemListed events
    contracts.marketplace.events
      .ItemListed({
        fromBlock: "latest",
      })
      .on("data", (event) => {
        console.log("Item Listed:", event.returnValues);
        // Process listing
      })
      .on("error", console.error);

    // Listen to Offers MadeOffer events
    contracts.offers.events
      .MadeOffer({
        fromBlock: "latest",
      })
      .on("data", (event) => {
        console.log("New Offer:", event.returnValues);
        // Process offer
      })
      .on("error", console.error);
  }
}

module.exports = new EventListener();
```

### 3. Transaction Service

```javascript
// services/transactionService.js
const { contracts, web3 } = require("../config/contracts");

class TransactionService {
  async mintNFT(recipientAddress, tokenURI, privateKey) {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);

      const tx = contracts.nft.methods.mint(recipientAddress, tokenURI);

      const gas = await tx.estimateGas({ from: account.address });
      const gasPrice = await web3.eth.getGasPrice();

      const receipt = await tx.send({
        from: account.address,
        gas: gas,
        gasPrice: gasPrice,
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        tokenId: receipt.events.Transfer.returnValues.tokenId,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listItem(tokenId, price, privateKey) {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);

      const tx = contracts.marketplace.methods.listItem(
        tokenId,
        web3.utils.toWei(price.toString(), "ether")
      );

      const receipt = await tx.send({ from: account.address });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TransactionService();
```

### 4. Query Service (Read-only)

```javascript
// services/queryService.js
const { contracts, contractAbi } = require("../config/contracts");

class QueryService {
  // NFT queries
  async getNFTInfo(tokenId) {
    const [owner, uri, approved] = await Promise.all([
      contracts.nft.methods.ownerOf(tokenId).call(),
      contracts.nft.methods.tokenURI(tokenId).call(),
      contracts.nft.methods.getApproved(tokenId).call(),
    ]);

    return { owner, tokenURI: uri, approved };
  }

  async getTokenCounter() {
    return await contracts.nft.methods.tokenCounter().call();
  }

  // Marketplace queries
  async getMarketplaceItem(itemId) {
    const item = await contracts.marketplace.methods.items(itemId).call();
    return {
      tokenId: item.tokenId,
      seller: item.seller,
      price: item.price,
      sold: item.sold,
    };
  }

  async getMarketplaceFee() {
    const [feePercent, feeAccount] = await Promise.all([
      contracts.marketplace.methods.feePercent().call(),
      contracts.marketplace.methods.feeAccount().call(),
    ]);

    return { feePercent, feeAccount };
  }

  // Offers queries
  async getOffer(offerId) {
    const offer = await contracts.offers.methods.offers(offerId).call();
    return {
      offerMaker: offer.offerMaker,
      tokenId: offer.tokenId,
      price: offer.price,
      fulfilled: offer.fulfilled,
      cancelled: offer.cancelled,
    };
  }

  async getContractAddresses() {
    return {
      nft: contractAbi.contracts.ViePropChainNFT.address,
      marketplace: contractAbi.contracts.Marketplace.address,
      offers: contractAbi.contracts.Offers.address,
    };
  }
}

module.exports = new QueryService();
```

## 🔐 Environment Variables

Create a `.env` file in your backend:

```env
RPC_URL=http://localhost:7545
CHAIN_ID=1337
PRIVATE_KEY=your_private_key_here

# Contract addresses (optional, loaded from contract-abi.json)
NFT_CONTRACT_ADDRESS=0x...
MARKETPLACE_CONTRACT_ADDRESS=0x...
OFFERS_CONTRACT_ADDRESS=0x...
```

## 📝 Notes

1. **Security**: Never commit private keys to git
2. **Contract ABI**: Always regenerate after deploying new contracts
3. **Network**: Make sure your backend connects to the same network as deployed contracts
4. **Gas**: Always estimate gas before sending transactions
5. **Events**: Use event listeners for real-time updates

## 🔄 Updating After Deployment

After running `truffle migrate --reset`, all files will be automatically updated:

- `contract-abi.json` ✅
- `abi/*.json` ✅
- `backend-config-{network}.json` ✅
- `deployment-{network}.json` ✅

Just reload your backend server to use the new addresses and ABIs.
