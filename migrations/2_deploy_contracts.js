// migrations/2_deploy_contracts.js
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Marketplace = artifacts.require("Marketplace");

module.exports = async function (deployer, network, accounts) {
  // Deploy ViePropChainNFT contract
  console.log("Deploying ViePropChainNFT...");
  await deployer.deploy(ViePropChainNFT);
  const nftContract = await ViePropChainNFT.deployed();
  console.log("ViePropChainNFT deployed at:", nftContract.address);

  // Configure marketplace parameters
  const feePercent = 2; // 2% fee
  const feeAccount = accounts[0]; // First account as fee recipient

  // Deploy Marketplace contract with required parameters
  console.log("Deploying Marketplace...");
  await deployer.deploy(
    Marketplace,
    nftContract.address,
    feePercent,
    feeAccount
  );
  const marketplaceContract = await Marketplace.deployed();
  console.log("Marketplace deployed at:", marketplaceContract.address);

  console.log("\n=== Deployment Summary ===");
  console.log("NFT Contract:", nftContract.address);
  console.log("Marketplace Contract:", marketplaceContract.address);
  console.log("Fee Percent:", feePercent + "%");
  console.log("Fee Account:", feeAccount);
};
