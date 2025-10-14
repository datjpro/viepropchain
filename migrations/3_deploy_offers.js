// migrations/3_deploy_offers.js
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Offers = artifacts.require("Offers");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  console.log("\n=== Deploying Offers Contract ===");

  // Get the deployed NFT contract instance
  const nftContract = await ViePropChainNFT.deployed();
  console.log("Using NFT contract at:", nftContract.address);

  // Deploy Offers contract with NFT contract address
  await deployer.deploy(Offers, nftContract.address);
  const offersContract = await Offers.deployed();
  console.log("✅ Offers contract deployed at:", offersContract.address);

  // Set initial configuration for Offers contract
  console.log("\n=== Configuring Offers Contract ===");

  // Set fee address (using deployer account as default)
  const feeAddress = accounts[0];
  await offersContract.setFeeAddress(feeAddress);

  // Set fee percentage to 2.5% (250 basis points)
  const feePercent = 250; // 2.5%
  await offersContract.setFeePercent(feePercent);

  console.log("Fee Address:", feeAddress);
  console.log("Fee Percent:", feePercent / 100 + "%");

  // Get contract ABI from build artifacts
  const offersArtifact = require("../build/contracts/Offers.json");

  // Read existing deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const filePath = path.join(deploymentsDir, `deployment-${network}.json`);

  let deploymentInfo = {};
  if (fs.existsSync(filePath)) {
    deploymentInfo = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  // Update with Offers contract info including ABI
  deploymentInfo.contracts = deploymentInfo.contracts || {};
  deploymentInfo.contracts.Offers = {
    address: offersContract.address,
    transactionHash: offersContract.transactionHash,
    abi: offersArtifact.abi,
    contractName: "Offers",
    compiler: {
      version: offersArtifact.compiler.version,
    },
    bytecode: offersArtifact.bytecode,
    config: {
      feePercent: feePercent,
      feeAddress: feeAddress,
      nftContract: nftContract.address,
    },
  };

  // Save updated deployment info
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📝 Deployment info updated in:", filePath);

  // Save Offers ABI file
  const abiDir = path.join(deploymentsDir, "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(abiDir, "Offers.json"),
    JSON.stringify(offersArtifact.abi, null, 2)
  );
  console.log("📝 Offers ABI saved to:", abiDir);

  console.log("\n=== Deployment Summary ===");
  console.log("NFT Contract:", nftContract.address);
  console.log("Offers Contract:", offersContract.address);
};
