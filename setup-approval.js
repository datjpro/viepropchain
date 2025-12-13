/**
 * Setup ApprovalForAll for Marketplace contract
 * Run this ONCE with Admin wallet to allow Marketplace to transfer NFTs
 */

const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

async function setupApproval() {
  console.log("🔐 Setting up Marketplace approval...\n");

  // Load contracts
  const contractsPath = path.join(__dirname, "backend", "contracts.json");
  const contracts = JSON.parse(fs.readFileSync(contractsPath, "utf8"));

  const NFT_ADDRESS = contracts.contracts.ViePropChainNFT.address;
  const MARKETPLACE_ADDRESS = contracts.contracts.Marketplace.address;
  const NFT_ABI = contracts.contracts.ViePropChainNFT.abi;

  console.log("📍 NFT Contract:", NFT_ADDRESS);
  console.log("📍 Marketplace:", MARKETPLACE_ADDRESS);

  // Connect to Ganache
  const web3 = new Web3("http://127.0.0.1:8545");
  const accounts = await web3.eth.getAccounts();
  const adminWallet = accounts[0]; // First account = Admin

  console.log("\n👤 Admin Wallet:", adminWallet);

  // Create contract instance
  const nftContract = new web3.eth.Contract(NFT_ABI, NFT_ADDRESS);

  // Check current approval
  const isApproved = await nftContract.methods
    .isApprovedForAll(adminWallet, MARKETPLACE_ADDRESS)
    .call();

  console.log("\n📊 Current approval status:", isApproved);

  if (isApproved) {
    console.log("✅ Marketplace is already approved!");
    return;
  }

  // Approve Marketplace for all NFTs
  console.log("\n🔄 Approving Marketplace...");
  const tx = await nftContract.methods
    .setApprovalForAll(MARKETPLACE_ADDRESS, true)
    .send({ from: adminWallet, gas: 100000 });

  console.log("✅ Approval successful!");
  console.log("   TX Hash:", tx.transactionHash);
  console.log("   Block:", tx.blockNumber);

  console.log(
    "\n🎉 Setup complete! Marketplace can now transfer NFTs from Admin wallet."
  );
}

setupApproval()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
