// migrations/4_complete_setup.js
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Marketplace = artifacts.require("Marketplace");
const Offers = artifacts.require("Offers");

module.exports = async function (deployer, network, accounts) {
  try {
    // Get deployed contract instances
    const nftContract = await ViePropChainNFT.deployed();
    const marketplaceContract = await Marketplace.deployed();
    const offersContract = await Offers.deployed();

    console.log("\n=== Setting up contract interactions ===");

    // Verify all contracts are properly linked
    const nftContractInOffers = await offersContract.nftContract();
    const nftContractInMarketplace = await marketplaceContract.nftContract();

    console.log("NFT Contract Address:", nftContract.address);
    console.log("NFT Contract in Offers:", nftContractInOffers);
    console.log("NFT Contract in Marketplace:", nftContractInMarketplace);

    // Verify the addresses match
    if (
      nftContractInOffers.toLowerCase() === nftContract.address.toLowerCase()
    ) {
      console.log("✅ Offers contract correctly linked to NFT contract");
    } else {
      console.log("❌ Offers contract NOT linked to NFT contract");
    }

    if (
      nftContractInMarketplace.toLowerCase() ===
      nftContract.address.toLowerCase()
    ) {
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

    console.log("\n=== Deployment Complete! ===");
    console.log("All contracts deployed and configured successfully.");
    console.log("You can now interact with your dApp using these addresses.");
  } catch (error) {
    console.error("Error in complete setup:", error);
    throw error;
  }
};
