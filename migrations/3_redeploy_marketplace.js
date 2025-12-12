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

  // Prepare deploy parameters
  const feePercent = 1; // 1% fee
  const feeAccount = accounts[0]; // Admin wallet

  console.log("🚀 Deploying new Marketplace...");
  console.log("   NFT Contract:", nftAddress);
  console.log("   Fee Percent:", feePercent + "%");
  console.log("   Fee Account:", feeAccount);

  // Ensure existingContracts has proper structure to avoid accidental overwrites
  if (
    !existingContracts.contracts ||
    typeof existingContracts.contracts !== "object"
  ) {
    existingContracts.contracts = {};
  }

  // Backup existing contracts.json before modifying
  try {
    if (fs.existsSync(contractsFilePath)) {
      fs.copyFileSync(contractsFilePath, `${contractsFilePath}.bak`);
      console.log(`🔐 Backup created at ${contractsFilePath}.bak`);
    }
  } catch (bakErr) {
    console.warn(
      "⚠️ Failed to create backup of contracts.json:",
      bakErr.message
    );
  }

  // Deploy and update contracts.json only on success
  let marketplaceContract;
  try {
    await deployer.deploy(Marketplace, nftAddress, feePercent, feeAccount);
    marketplaceContract = await Marketplace.deployed();

    console.log("\n✅ New Marketplace deployed:", marketplaceContract.address);

    // Update ONLY the Marketplace entry to avoid affecting other contracts
    existingContracts.contracts.Marketplace = {
      address: marketplaceContract.address,
      abi: Marketplace.abi,
    };
    existingContracts.deployedAt = new Date().toISOString();

    fs.writeFileSync(
      contractsFilePath,
      JSON.stringify(existingContracts, null, 2)
    );
    console.log(`\n✅ Updated: ${contractsFilePath}`);
  } catch (deployErr) {
    console.error(
      "❌ Marketplace deploy failed:",
      deployErr.message || deployErr
    );
    console.log("Restoring backup if available...");
    try {
      if (fs.existsSync(`${contractsFilePath}.bak`)) {
        fs.copyFileSync(`${contractsFilePath}.bak`, contractsFilePath);
        console.log("🔄 contracts.json restored from backup");
      }
    } catch (restoreErr) {
      console.error(
        "⚠️ Failed to restore backup:",
        restoreErr.message || restoreErr
      );
    }
    throw deployErr;
  }

  console.log("\n========================================");
  console.log("📝 Deployment Summary");
  console.log("========================================");
  console.log(`Network: ${network}`);
  console.log(`NFT Contract (unchanged): ${nftAddress}`);
  console.log(
    `Marketplace (NEW): ${
      marketplaceContract ? marketplaceContract.address : "N/A"
    }`
  );
  console.log(`\n✅ Updated: ${contractsFilePath}`);
  console.log("========================================\n");

  console.log("⚠️  NEXT STEPS:");
  console.log("   1. Run: node setup-approval.js");
  console.log("   2. Restart backend services");
  console.log("   3. Update frontend config if needed\n");
};
