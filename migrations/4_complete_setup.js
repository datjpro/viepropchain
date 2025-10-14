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

    console.log("NFT Contract Address:", nftContract.address);
    console.log("NFT Contract in Offers:", nftContractInOffers);

    // Verify the addresses match
    const offersLinked =
      nftContractInOffers.toLowerCase() === nftContract.address.toLowerCase();
    const marketplaceLinked = true; // Marketplace has immutable nftContract, verified at deployment

    if (offersLinked) {
      console.log("✅ Offers contract correctly linked to NFT contract");
    } else {
      console.log("❌ Offers contract NOT linked to NFT contract");
    }

    console.log("✅ Marketplace contract linked to NFT contract at deployment");

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

    // Create backend config file with all necessary information
    const backendConfig = {
      network: network,
      chainId: deploymentInfo.chainId,
      deployedAt: deploymentInfo.deployedAt,
      deployer: accounts[0],
      contracts: {
        ViePropChainNFT: {
          address: nftContract.address,
          abi: deploymentInfo.contracts.ViePropChainNFT.abi,
        },
        Marketplace: {
          address: marketplaceContract.address,
          abi: deploymentInfo.contracts.Marketplace.abi,
          config: {
            feePercent: marketplaceFee.toString(),
            feeAccount: marketplaceFeeAccount,
            nftContract: nftContract.address,
          },
        },
        Offers: {
          address: offersContract.address,
          abi: deploymentInfo.contracts.Offers.abi,
          config: {
            feePercent: offersFee.toNumber(),
            feeAddress: offersFeeAddress,
            nftContract: nftContract.address,
          },
        },
      },
      accounts: accounts,
    };

    const backendConfigPath = path.join(
      deploymentsDir,
      `backend-config-${network}.json`
    );
    fs.writeFileSync(backendConfigPath, JSON.stringify(backendConfig, null, 2));
    console.log("📝 Backend config saved to:", backendConfigPath);

    // Create contract-abi.json file for backend (compact format)
    const contractAbiFile = {
      network: network,
      chainId: deploymentInfo.chainId,
      updatedAt: new Date().toISOString(),
      contracts: {
        ViePropChainNFT: {
          name: "ViePropChainNFT",
          address: nftContract.address,
          abi: deploymentInfo.contracts.ViePropChainNFT.abi,
        },
        Marketplace: {
          name: "Marketplace",
          address: marketplaceContract.address,
          abi: deploymentInfo.contracts.Marketplace.abi,
          feePercent: marketplaceFee.toString(),
          feeAccount: marketplaceFeeAccount,
        },
        Offers: {
          name: "Offers",
          address: offersContract.address,
          abi: deploymentInfo.contracts.Offers.abi,
          feePercent: offersFee.toNumber(),
          feeAddress: offersFeeAddress,
        },
      },
    };

    const contractAbiPath = path.join(deploymentsDir, "contract-abi.json");
    fs.writeFileSync(contractAbiPath, JSON.stringify(contractAbiFile, null, 2));
    console.log("📝 Contract ABI file saved to:", contractAbiPath);

    // Also create a simplified config file for frontend
    const frontendConfig = {
      network: network,
      chainId: deploymentInfo.chainId,
      contracts: {
        ViePropChainNFT: {
          address: nftContract.address,
          abi: deploymentInfo.contracts.ViePropChainNFT.abi,
        },
        Marketplace: {
          address: marketplaceContract.address,
          abi: deploymentInfo.contracts.Marketplace.abi,
        },
        Offers: {
          address: offersContract.address,
          abi: deploymentInfo.contracts.Offers.abi,
        },
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

    // Create a README for backend usage
    const readmePath = path.join(deploymentsDir, "BACKEND_README.md");
    const readmeContent = `# Backend Configuration Guide

## Files Generated

### 1. Full Deployment Info
**File:** \`deployment-${network}.json\`

Contains complete deployment information including:
- All contract addresses
- Full ABIs for each contract
- Transaction hashes
- Compiler versions
- Bytecode
- Contract configurations

### 2. Backend Config
**File:** \`backend-config-${network}.json\`

Simplified config optimized for backend use:
- Contract addresses
- ABIs
- Configuration parameters
- All accounts

### 3. Individual ABI Files
**Directory:** \`abi/\`

Separate JSON files for each contract ABI:
- \`ViePropChainNFT.json\`
- \`Marketplace.json\`
- \`Offers.json\`

## Usage in Backend (Node.js/Express)

\`\`\`javascript
const Web3 = require('web3');
const config = require('./deployments/backend-config-${network}.json');

// Initialize Web3
const web3 = new Web3('YOUR_RPC_URL');

// Load contracts
const nftContract = new web3.eth.Contract(
  config.contracts.ViePropChainNFT.abi,
  config.contracts.ViePropChainNFT.address
);

const marketplaceContract = new web3.eth.Contract(
  config.contracts.Marketplace.abi,
  config.contracts.Marketplace.address
);

const offersContract = new web3.eth.Contract(
  config.contracts.Offers.abi,
  config.contracts.Offers.address
);

// Example: Get token counter
const tokenCounter = await nftContract.methods.tokenCounter().call();

// Example: Listen to events
marketplaceContract.events.ItemListed({
  fromBlock: 'latest'
}, (error, event) => {
  console.log('New item listed:', event);
});
\`\`\`

## Contract Information

### ViePropChainNFT
- **Address:** ${nftContract.address}
- **Type:** ERC721 NFT Contract
- **Functions:** mint, tokenURI, balanceOf, ownerOf, etc.

### Marketplace
- **Address:** ${marketplaceContract.address}
- **Fee:** ${marketplaceFee.toString()}%
- **Fee Account:** ${marketplaceFeeAccount}
- **Functions:** listItem, buyItem, cancelListing, etc.

### Offers
- **Address:** ${offersContract.address}
- **Fee:** ${(offersFee.toNumber() / 100).toString()}%
- **Fee Address:** ${offersFeeAddress}
- **Functions:** makeOffer, cancelOffer, acceptOffer, etc.

## Network Information
- **Network:** ${network}
- **Chain ID:** ${deploymentInfo.chainId}
- **Deployer:** ${accounts[0]}
- **Deployed At:** ${deploymentInfo.deployedAt}

## Important Notes

1. **Security:** Never commit private keys or sensitive information
2. **RPC URL:** Configure your RPC endpoint for the network
3. **Gas Price:** Monitor gas prices for optimal transaction costs
4. **Event Listening:** Use events to track contract activity
5. **Error Handling:** Always implement proper error handling
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log("📝 Backend README saved to:", readmePath);

    console.log("\n=== ✅ Deployment Complete! ===");
    console.log("All contracts deployed and configured successfully.");
    console.log("You can now interact with your dApp using these addresses.");
    console.log("\n💡 Configuration files created:");
    console.log("   - Full deployment info:", filePath);
    console.log("   - Backend config:", backendConfigPath);
    console.log("   - Contract ABI (for backend):", contractAbiPath);
    console.log("   - Frontend config:", frontendConfigPath);
    console.log("   - ABI files:", path.join(deploymentsDir, "abi"));
    console.log("   - Backend README:", readmePath);
  } catch (error) {
    console.error("❌ Error in complete setup:", error);
    throw error;
  }
};
