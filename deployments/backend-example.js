/**
 * Backend Integration Example
 *
 * Đây là file ví dụ về cách sử dụng contract-abi.json trong backend
 * Copy file này vào thư mục backend của bạn và điều chỉnh paths
 */

const Web3 = require("web3");

// Import contract ABI file
const contractAbi = require("./deployments/contract-abi.json");

// Hoặc nếu backend ở folder khác:
// const contractAbi = require('../viepropchain/deployments/contract-abi.json');

// Setup Web3
const web3 = new Web3(process.env.RPC_URL || "http://localhost:7545");

// Initialize contracts
const nftContract = new web3.eth.Contract(
  contractAbi.contracts.ViePropChainNFT.abi,
  contractAbi.contracts.ViePropChainNFT.address
);

const marketplaceContract = new web3.eth.Contract(
  contractAbi.contracts.Marketplace.abi,
  contractAbi.contracts.Marketplace.address
);

const offersContract = new web3.eth.Contract(
  contractAbi.contracts.Offers.abi,
  contractAbi.contracts.Offers.address
);

// ==================== EXAMPLE FUNCTIONS ====================

/**
 * 1. Read Contract Data (No gas required)
 */
async function getContractInfo() {
  console.log("\n=== Contract Information ===");
  console.log("Network:", contractAbi.network);
  console.log("Chain ID:", contractAbi.chainId);
  console.log("Updated At:", contractAbi.updatedAt);
  console.log("\nContract Addresses:");
  console.log("- NFT:", contractAbi.contracts.ViePropChainNFT.address);
  console.log("- Marketplace:", contractAbi.contracts.Marketplace.address);
  console.log("- Offers:", contractAbi.contracts.Offers.address);
}

/**
 * 2. Get NFT Token Counter
 */
async function getTokenCounter() {
  const counter = await nftContract.methods.tokenCounter().call();
  console.log("\nToken Counter:", counter);
  return counter;
}

/**
 * 3. Get NFT Owner
 */
async function getNFTOwner(tokenId) {
  try {
    const owner = await nftContract.methods.ownerOf(tokenId).call();
    console.log(`\nOwner of Token #${tokenId}:`, owner);
    return owner;
  } catch (error) {
    console.error("Error getting owner:", error.message);
    return null;
  }
}

/**
 * 4. Get NFT Token URI
 */
async function getTokenURI(tokenId) {
  try {
    const uri = await nftContract.methods.tokenURI(tokenId).call();
    console.log(`\nToken URI #${tokenId}:`, uri);
    return uri;
  } catch (error) {
    console.error("Error getting token URI:", error.message);
    return null;
  }
}

/**
 * 5. Get Balance of Address
 */
async function getBalance(address) {
  const balance = await nftContract.methods.balanceOf(address).call();
  console.log(`\nBalance of ${address}:`, balance);
  return balance;
}

/**
 * 6. Get Marketplace Configuration
 */
async function getMarketplaceConfig() {
  console.log("\n=== Marketplace Configuration ===");
  console.log(
    "Fee Percent:",
    contractAbi.contracts.Marketplace.feePercent + "%"
  );
  console.log("Fee Account:", contractAbi.contracts.Marketplace.feeAccount);

  // Verify on-chain
  const onChainFee = await marketplaceContract.methods.feePercent().call();
  const onChainAccount = await marketplaceContract.methods.feeAccount().call();

  console.log("\nOn-chain Verification:");
  console.log("Fee Percent:", onChainFee + "%");
  console.log("Fee Account:", onChainAccount);
}

/**
 * 7. Get Offers Configuration
 */
async function getOffersConfig() {
  console.log("\n=== Offers Configuration ===");
  console.log(
    "Fee Percent:",
    contractAbi.contracts.Offers.feePercent / 100 + "%"
  );
  console.log("Fee Address:", contractAbi.contracts.Offers.feeAddress);
}

/**
 * 8. Mint NFT (Requires private key)
 */
async function mintNFT(recipientAddress, tokenURI, privateKey) {
  try {
    console.log("\n=== Minting NFT ===");

    // Add account from private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    console.log("Minting for:", recipientAddress);
    console.log("Token URI:", tokenURI);
    console.log("From:", account.address);

    // Create transaction
    const tx = nftContract.methods.mint(recipientAddress, tokenURI);

    // Estimate gas
    const gas = await tx.estimateGas({ from: account.address });
    const gasPrice = await web3.eth.getGasPrice();

    console.log("Estimated gas:", gas);
    console.log("Gas price:", web3.utils.fromWei(gasPrice, "gwei"), "gwei");

    // Send transaction
    const receipt = await tx.send({
      from: account.address,
      gas: gas,
      gasPrice: gasPrice,
    });

    console.log("\n✅ NFT Minted Successfully!");
    console.log("Transaction Hash:", receipt.transactionHash);
    console.log("Token ID:", receipt.events.Transfer.returnValues.tokenId);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      tokenId: receipt.events.Transfer.returnValues.tokenId,
    };
  } catch (error) {
    console.error("❌ Error minting NFT:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 9. Listen to Events
 */
function listenToEvents() {
  console.log("\n=== Listening to Contract Events ===");

  // Listen to NFT Transfer events
  nftContract.events
    .Transfer({
      fromBlock: "latest",
    })
    .on("data", (event) => {
      console.log("\n📦 NFT Transfer Event:");
      console.log("  From:", event.returnValues.from);
      console.log("  To:", event.returnValues.to);
      console.log("  Token ID:", event.returnValues.tokenId);
      console.log("  Block:", event.blockNumber);
      console.log("  Tx Hash:", event.transactionHash);
    })
    .on("error", (error) => {
      console.error("Error listening to Transfer events:", error);
    });

  // Listen to Marketplace events (if available)
  if (marketplaceContract.events.ItemListed) {
    marketplaceContract.events
      .ItemListed({
        fromBlock: "latest",
      })
      .on("data", (event) => {
        console.log("\n🏪 Item Listed Event:", event.returnValues);
      })
      .on("error", console.error);
  }

  // Listen to Offers events (if available)
  if (offersContract.events.MadeOffer) {
    offersContract.events
      .MadeOffer({
        fromBlock: "latest",
      })
      .on("data", (event) => {
        console.log("\n💰 New Offer Event:", event.returnValues);
      })
      .on("error", console.error);
  }

  console.log("✅ Event listeners started");
}

/**
 * 10. Get Past Events
 */
async function getPastEvents(eventName, fromBlock = 0) {
  console.log(`\n=== Getting Past ${eventName} Events ===`);

  const events = await nftContract.getPastEvents(eventName, {
    fromBlock: fromBlock,
    toBlock: "latest",
  });

  console.log(`Found ${events.length} events`);

  events.forEach((event, index) => {
    console.log(`\nEvent #${index + 1}:`);
    console.log("  Block:", event.blockNumber);
    console.log("  Tx Hash:", event.transactionHash);
    console.log("  Values:", event.returnValues);
  });

  return events;
}

// ==================== MAIN FUNCTION ====================

async function main() {
  try {
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║     ViePropChain Backend Integration Example          ║");
    console.log("╚════════════════════════════════════════════════════════╝");

    // 1. Display contract information
    await getContractInfo();

    // 2. Get token counter
    await getTokenCounter();

    // 3. Get marketplace and offers config
    await getMarketplaceConfig();
    await getOffersConfig();

    // 4. Example: Get NFT info (if token exists)
    const tokenCounter = await nftContract.methods.tokenCounter().call();
    if (tokenCounter > 0) {
      await getNFTOwner(1);
      await getTokenURI(1);
    }

    // 5. Example: Check balance
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      await getBalance(accounts[0]);
    }

    // 6. Example: Mint NFT (uncomment and provide private key)
    // const privateKey = '0x...'; // Your private key
    // await mintNFT(
    //   accounts[0],
    //   'ipfs://QmExample123',
    //   privateKey
    // );

    // 7. Get past Transfer events
    // await getPastEvents('Transfer', 0);

    // 8. Start event listeners (uncomment to enable)
    // listenToEvents();

    console.log("\n✅ All examples completed successfully!");
    console.log("\n💡 Tip: Uncomment the functions you want to test");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// ==================== EXPORT FOR USE IN OTHER FILES ====================

module.exports = {
  web3,
  contracts: {
    nft: nftContract,
    marketplace: marketplaceContract,
    offers: offersContract,
  },
  contractAbi,

  // Helper functions
  getContractInfo,
  getTokenCounter,
  getNFTOwner,
  getTokenURI,
  getBalance,
  getMarketplaceConfig,
  getOffersConfig,
  mintNFT,
  listenToEvents,
  getPastEvents,
};

// Run main function if executed directly
if (require.main === module) {
  main()
    .then(() => {
      // Keep the script running if listening to events
      // Otherwise exit after 2 seconds
      setTimeout(() => {
        console.log("\nExiting...");
        process.exit(0);
      }, 2000);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
