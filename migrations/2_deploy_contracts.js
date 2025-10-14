// migrations/2_deploy_contracts.js
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Marketplace = artifacts.require("Marketplace");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  console.log("\n=== Deploying ViePropChainNFT ===");
  console.log("Network:", network);
  console.log("Deployer:", accounts[0]);

  // Deploy ViePropChainNFT contract
  await deployer.deploy(ViePropChainNFT);
  const nftContract = await ViePropChainNFT.deployed();
  console.log("✅ ViePropChainNFT deployed at:", nftContract.address);

  // Configure marketplace parameters
  const feePercent = 2; // 2% fee
  const feeAccount = accounts[0]; // First account as fee recipient

  // Deploy Marketplace contract with required parameters
  console.log("\n=== Deploying Marketplace ===");
  await deployer.deploy(
    Marketplace,
    nftContract.address,
    feePercent,
    feeAccount
  );
  const marketplaceContract = await Marketplace.deployed();
  console.log("✅ Marketplace deployed at:", marketplaceContract.address);

  // Save deployment info to JSON file
  const deploymentInfo = {
    network: network,
    deployedAt: new Date().toISOString(),
    deployer: accounts[0],
    contracts: {
      ViePropChainNFT: {
        address: nftContract.address,
        transactionHash: nftContract.transactionHash,
      },
      Marketplace: {
        address: marketplaceContract.address,
        transactionHash: marketplaceContract.transactionHash,
        feePercent: feePercent,
        feeAccount: feeAccount,
      },
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save to file
  const filePath = path.join(deploymentsDir, `deployment-${network}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📝 Deployment info saved to:", filePath);

  console.log("\n=== Deployment Summary ===");
  console.log("NFT Contract:", nftContract.address);
  console.log("Marketplace Contract:", marketplaceContract.address);
  console.log("Fee Percent:", feePercent + "%");
  console.log("Fee Account:", feeAccount);
};
