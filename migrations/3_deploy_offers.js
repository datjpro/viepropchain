// migrations/3_deploy_offers.js
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Offers = artifacts.require("Offers");

module.exports = async function (deployer, network, accounts) {
  // Get the deployed NFT contract instance
  const nftContract = await ViePropChainNFT.deployed();

  console.log("Deploying Offers contract...");
  console.log("Using NFT contract at:", nftContract.address);

  // Deploy Offers contract with NFT contract address
  await deployer.deploy(Offers, nftContract.address);
  const offersContract = await Offers.deployed();

  console.log("Offers contract deployed at:", offersContract.address);

  // Set initial configuration for Offers contract
  console.log("Configuring Offers contract...");

  // Set fee address (using deployer account as default)
  const feeAddress = accounts[0];
  await offersContract.setFeeAddress(feeAddress);

  // Set fee percentage to 2.5% (250 basis points)
  const feePercent = 250; // 2.5%
  await offersContract.setFeePercent(feePercent);

  console.log("\n=== Offers Contract Configuration ===");
  console.log("Contract Address:", offersContract.address);
  console.log("NFT Contract:", nftContract.address);
  console.log("Fee Address:", feeAddress);
  console.log("Fee Percent:", feePercent / 100 + "%");

  console.log("\n=== Complete Deployment Summary ===");
  console.log("NFT Contract:", nftContract.address);
  console.log("Offers Contract:", offersContract.address);
};
