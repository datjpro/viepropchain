const { ethers } = require("ethers");
const contractData = require("./backend/contracts.json");
const deploymentData = require("../database_viepropchain_microservice/shared/contracts/deployment-development.json");

async function verifyDeployment() {
  console.log("🔍 Verifying Smart Contract Deployment");
  console.log("=====================================\n");

  // Setup provider
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  try {
    // Get network info
    const network = await provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`🔗 Provider: http://127.0.0.1:8545\n`);

    // Verify NFT Contract
    console.log("📄 ViePropChainNFT Contract:");
    console.log(
      `   Address: ${contractData.contracts.ViePropChainNFT.address}`
    );

    const nftCode = await provider.getCode(
      contractData.contracts.ViePropChainNFT.address
    );
    const nftDeployed = nftCode !== "0x";
    console.log(`   Status: ${nftDeployed ? "✅ Deployed" : "❌ Not Found"}`);

    if (nftDeployed) {
      const nftContract = new ethers.Contract(
        contractData.contracts.ViePropChainNFT.address,
        contractData.contracts.ViePropChainNFT.abi,
        provider
      );

      try {
        const name = await nftContract.name();
        const symbol = await nftContract.symbol();
        const tokenCounter = await nftContract.tokenCounter();
        const owner = await nftContract.owner();

        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Token Counter: ${tokenCounter}`);
        console.log(`   Owner: ${owner}`);
      } catch (error) {
        console.log(`   ⚠️  Error reading contract data: ${error.message}`);
      }
    }

    console.log();

    // Verify Marketplace Contract
    console.log("🏪 Marketplace Contract:");
    console.log(`   Address: ${contractData.contracts.Marketplace.address}`);

    const marketCode = await provider.getCode(
      contractData.contracts.Marketplace.address
    );
    const marketDeployed = marketCode !== "0x";
    console.log(
      `   Status: ${marketDeployed ? "✅ Deployed" : "❌ Not Found"}`
    );

    if (marketDeployed) {
      const marketContract = new ethers.Contract(
        contractData.contracts.Marketplace.address,
        contractData.contracts.Marketplace.abi,
        provider
      );

      try {
        const feePercent = await marketContract.feePercent();
        const feeAccount = await marketContract.feeAccount();
        const listingCount = await marketContract.getListingCount();

        console.log(`   Fee Percent: ${feePercent}%`);
        console.log(`   Fee Account: ${feeAccount}`);
        console.log(`   Listing Count: ${listingCount}`);
      } catch (error) {
        console.log(`   ⚠️  Error reading contract data: ${error.message}`);
      }
    }

    console.log();

    // Check deployment data consistency
    console.log("🔄 Data Consistency Check:");
    const nftMatch =
      contractData.contracts.ViePropChainNFT.address ===
      deploymentData.contracts.ViePropChainNFT.address;
    const marketMatch =
      contractData.contracts.Marketplace.address ===
      deploymentData.contracts.Marketplace.address;

    console.log(`   NFT Address Match: ${nftMatch ? "✅" : "❌"}`);
    console.log(`   Marketplace Address Match: ${marketMatch ? "✅" : "❌"}`);

    if (nftMatch && marketMatch) {
      console.log("\n✅ All contracts successfully deployed and verified!");
    } else {
      console.log("\n❌ Contract address mismatch detected!");
    }
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

// Run verification
verifyDeployment().catch(console.error);
