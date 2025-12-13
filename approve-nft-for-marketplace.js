/**
 * Script approve NFT cho Marketplace contract
 * Chạy script này từ ví admin để approve NFT trước khi mua
 */

const { Web3 } = require("web3");

// Cấu hình
const GANACHE_URL = "http://127.0.0.1:8545";
const ADMIN_PRIVATE_KEY =
  "0x843501ecc602247126b5c52ff65d3b0050a9039f23480f005535465ac2734fae"; // Admin private key

const NFT_CONTRACT_ADDRESS = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";
const MARKETPLACE_CONTRACT_ADDRESS =
  "0x4CE33E6d5F46eE14620aaAc2938262030f485610";

const NFT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

async function main() {
  const web3 = new Web3(GANACHE_URL);
  const admin = web3.eth.accounts.privateKeyToAccount(ADMIN_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(admin);

  const nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS);

  console.log("🔍 Checking NFT approval status...");
  console.log("   Admin:", admin.address);
  console.log("   NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("   Marketplace:", MARKETPLACE_CONTRACT_ADDRESS);

  const tokenId = 6; // TokenId cần approve

  try {
    // Kiểm tra owner
    const owner = await nftContract.methods.ownerOf(tokenId).call();
    console.log(`\n📋 TokenId ${tokenId}:`);
    console.log("   Owner:", owner);

    if (owner.toLowerCase() !== admin.address.toLowerCase()) {
      console.log("❌ Admin không sở hữu NFT này!");
      return;
    }

    // Kiểm tra approved
    const approved = await nftContract.methods.getApproved(tokenId).call();
    console.log("   Approved:", approved);

    if (approved.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()) {
      console.log("✅ NFT đã được approve cho Marketplace!");
      return;
    }

    // Approve NFT cho Marketplace
    console.log("\n⏳ Approving NFT for Marketplace...");
    const tx = await nftContract.methods
      .approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId)
      .send({
        from: admin.address,
        gas: 100000,
      });

    console.log("✅ Approved successfully!");
    console.log("   TX Hash:", tx.transactionHash);
    console.log("   Block:", tx.blockNumber);

    // Verify
    const newApproved = await nftContract.methods.getApproved(tokenId).call();
    console.log("   New approved:", newApproved);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

module.exports = async function (callback) {
  try {
    await main();
    callback();
  } catch (error) {
    console.error(error);
    callback(error);
  }
};
