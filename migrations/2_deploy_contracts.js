// migrations/2_deploy_contracts.js
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Marketplace = artifacts.require("Marketplace");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  // Use existing NFT contract address (don't redeploy)
  const nftContractAddress = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";

  // Deploy Marketplace contract with required parameters
  // Parameters: NFT contract address, fee percent, fee recipient account
  const feePercent = 1; // 1% fee
  const feeAccount = accounts[0]; // First account as fee recipient

  await deployer.deploy(
    Marketplace,
    nftContractAddress,
    feePercent,
    feeAccount
  );
  const marketplaceContract = await Marketplace.deployed();

  // Prepare contract information for backend
  const contractsData = {
    network: network,
    deployedAt: new Date().toISOString(),
    contracts: {
      ViePropChainNFT: {
        address: nftContractAddress,
        abi: [], // ABI not available since not redeployed
      },
      Marketplace: {
        address: marketplaceContract.address,
        abi: Marketplace.abi,
      },
    },
  };

  // Create backend directory if it doesn't exist
  const backendDir = path.join(__dirname, "..", "backend");
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }

  // Save contract data to JSON file for backend
  const contractsFilePath = path.join(backendDir, "contracts.json");
  fs.writeFileSync(contractsFilePath, JSON.stringify(contractsData, null, 2));

  console.log("\n========================================");
  console.log("📝 Contract Deployment Summary");
  console.log("========================================");
  console.log(`Network: ${network}`);
  console.log(`ViePropChainNFT: ${nftContract.address}`);
  console.log(`Marketplace: ${marketplaceContract.address}`);
  console.log(`\n✅ Contract data saved to: ${contractsFilePath}`);
  console.log("========================================\n");
};
