// migrations/3_redeploy_marketplace.js
const Marketplace = artifacts.require("Marketplace");
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  console.log("\n========================================");
  console.log("🔄 RE-DEPLOYING Marketplace Contract");
  console.log("========================================\n");

  // Get existing NFT contract address
  const contractsFilePath = path.join(
    __dirname,
    "..",
    "backend",
    "contracts.json"
  );
  let existingContracts = {};

  if (fs.existsSync(contractsFilePath)) {
    existingContracts = JSON.parse(fs.readFileSync(contractsFilePath, "utf8"));
    console.log(
      "📍 Existing NFT Contract:",
      existingContracts.contracts.ViePropChainNFT.address
    );
  }

  const nftAddress = existingContracts.contracts.ViePropChainNFT.address;

  // Deploy new Marketplace contract
  const feePercent = 1; // 1% fee
  const feeAccount = accounts[0]; // Admin wallet

  console.log("🚀 Deploying new Marketplace...");
  console.log("   NFT Contract:", nftAddress);
  console.log("   Fee Percent:", feePercent + "%");
  console.log("   Fee Account:", feeAccount);

  await deployer.deploy(Marketplace, nftAddress, feePercent, feeAccount);

  const marketplaceContract = await Marketplace.deployed();

  console.log("\n✅ New Marketplace deployed:", marketplaceContract.address);

  // Update contracts.json with new Marketplace address
  existingContracts.contracts.Marketplace = {
    address: marketplaceContract.address,
    abi: Marketplace.abi,
  };
  existingContracts.deployedAt = new Date().toISOString();

  fs.writeFileSync(
    contractsFilePath,
    JSON.stringify(existingContracts, null, 2)
  );

  console.log("\n========================================");
  console.log("📝 Deployment Summary");
  console.log("========================================");
  console.log(`Network: ${network}`);
  console.log(`NFT Contract (unchanged): ${nftAddress}`);
  console.log(`Marketplace (NEW): ${marketplaceContract.address}`);
  console.log(`\n✅ Updated: ${contractsFilePath}`);
  console.log("========================================\n");

  console.log("⚠️  NEXT STEPS:");
  console.log("   1. Run: node setup-approval.js");
  console.log("   2. Restart backend services");
  console.log("   3. Update frontend config if needed\n");
};
