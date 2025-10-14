// migrations/4_complete_setup.js
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Marketplace = artifacts.require("Marketplace");
const Offers = artifacts.require("Offers");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  try {
    console.log("\n=== Verifying Contract Setup ===");

    // Get deployed contract instances
    const nftContract = await ViePropChainNFT.deployed();
    const marketplaceContract = await Marketplace.deployed();
    const offersContract = await Offers.deployed();

    // Verify all contracts are properly linked
    const nftContractInOffers = await offersContract.nftContract();
    const nftContractInMarketplace = await marketplaceContract.nftContract();

    console.log("NFT Contract Address:", nftContract.address);
    console.log("NFT Contract in Offers:", nftContractInOffers);
    console.log("NFT Contract in Marketplace:", nftContractInMarketplace);

    // Verify the addresses match
    const offersLinked =
      nftContractInOffers.toLowerCase() === nftContract.address.toLowerCase();
    const marketplaceLinked =
      nftContractInMarketplace.toLowerCase() ===
      nftContract.address.toLowerCase();

    if (offersLinked) {
      console.log("✅ Offers contract correctly linked to NFT contract");
    } else {
      console.log("❌ Offers contract NOT linked to NFT contract");
    }

    if (marketplaceLinked) {
      console.log("✅ Marketplace contract correctly linked to NFT contract");
    } else {
      console.log("❌ Marketplace contract NOT linked to NFT contract");
    }

    // Get contract configurations
    const marketplaceFee = await marketplaceContract.feePercent();
    const marketplaceFeeAccount = await marketplaceContract.feeAccount();
    const offersFee = await offersContract.feePercent();
    const offersFeeAddress = await offersContract.feeAddress();

    console.log("\n=== Final Configuration ===");
    console.log("📄 ViePropChainNFT:", nftContract.address);
    console.log("🏪 Marketplace:", marketplaceContract.address);
    console.log("   - Fee:", marketplaceFee.toString() + "%");
    console.log("   - Fee Account:", marketplaceFeeAccount);
    console.log("💰 Offers:", offersContract.address);
    console.log("   - Fee:", (offersFee.toNumber() / 100).toString() + "%");
    console.log("   - Fee Address:", offersFeeAddress);

    // Read and update deployment info
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    const filePath = path.join(deploymentsDir, `deployment-${network}.json`);

    let deploymentInfo = {};
    if (fs.existsSync(filePath)) {
      deploymentInfo = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    // Add verification and configuration details
    deploymentInfo.verification = {
      offersLinked: offersLinked,
      marketplaceLinked: marketplaceLinked,
      verifiedAt: new Date().toISOString(),
    };

    deploymentInfo.configuration = {
      marketplace: {
        feePercent: marketplaceFee.toString(),
        feeAccount: marketplaceFeeAccount,
      },
      offers: {
        feePercent: offersFee.toNumber(),
        feeAddress: offersFeeAddress,
      },
    };

    deploymentInfo.accounts = {
      deployer: accounts[0],
      availableAccounts: accounts,
    };

    // Save final deployment info
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📝 Final deployment info saved to:", filePath);

    // Also create a simplified config file for frontend
    const frontendConfig = {
      network: network,
      contracts: {
        ViePropChainNFT: nftContract.address,
        Marketplace: marketplaceContract.address,
        Offers: offersContract.address,
      },
      deployer: accounts[0],
    };

    const frontendConfigPath = path.join(
      __dirname,
      "..",
      "src",
      "contracts",
      "config.json"
    );
    const frontendConfigDir = path.dirname(frontendConfigPath);

    if (!fs.existsSync(frontendConfigDir)) {
      fs.mkdirSync(frontendConfigDir, { recursive: true });
    }

    fs.writeFileSync(
      frontendConfigPath,
      JSON.stringify(frontendConfig, null, 2)
    );
    console.log("📝 Frontend config saved to:", frontendConfigPath);

    console.log("\n=== ✅ Deployment Complete! ===");
    console.log("All contracts deployed and configured successfully.");
    console.log("You can now interact with your dApp using these addresses.");
    console.log("\n💡 Configuration files created:");
    console.log("   - Full deployment info:", filePath);
    console.log("   - Frontend config:", frontendConfigPath);
  } catch (error) {
    console.error("❌ Error in complete setup:", error);
    throw error;
  }
};
