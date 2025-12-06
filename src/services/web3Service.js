/**
 * ========================================================================
 * WEB3 SERVICE - Smart Contract Interactions
 * ========================================================================
 * Giao tiếp với smart contracts trên blockchain
 * Sử dụng Web3.js để gọi các functions của:
 * - Marketplace contract (buy, sell, list, cancel)
 * - Auction contract (bid, rental)
 * - NFT contract (approve, transfer)
 * ========================================================================
 */

import { ethToWei } from "../utils/priceUtils";
import CONTRACTS from "../config/contracts";

const web3Service = {
  /**
   * Get contract instance
   * @param {object} web3 - Web3 instance from Web3Context
   * @param {string} contractName - Contract name (Marketplace, ViePropChainNFT, Auction)
   */
  getContract: (web3, contractName) => {
    try {
      const address = CONTRACTS.addresses[contractName];
      const abi = CONTRACTS.abis[contractName];

      if (!address || !abi) {
        throw new Error(`Contract ${contractName} not found or not deployed`);
      }

      return new web3.eth.Contract(abi, address);
    } catch (error) {
      console.error(`❌ Error getting contract ${contractName}:`, error);
      throw error;
    }
  },

  // ========================================================================
  // MARKETPLACE - BUY/SELL NFT
  // ========================================================================

  /**
   * Mua NFT từ marketplace
   * @param {object} web3 - Web3 instance
   * @param {string} account - Buyer wallet address
   * @param {number} listingId - Listing ID trên blockchain
   * @param {number} priceInEth - Giá NFT (ETH)
   */
  buyNFT: async (web3, account, listingId, priceInEth) => {
    try {
      const marketplaceContract = web3Service.getContract(web3, "Marketplace");
      const priceInWei = ethToWei(priceInEth);

      console.log("🛒 Buying NFT:", {
        listingId,
        priceInEth,
        priceInWei,
        from: account,
      });

      // Gọi buyItem function trên smart contract
      const tx = await marketplaceContract.methods.buyItem(listingId).send({
        from: account,
        value: priceInWei,
        gas: 300000, // Gas limit
      });

      console.log("✅ Buy successful:", tx.transactionHash);
      return {
        success: true,
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
      };
    } catch (error) {
      console.error("❌ Buy failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * List NFT lên marketplace
   * @param {object} web3 - Web3 instance
   * @param {string} account - Seller wallet address
   * @param {number} tokenId - NFT token ID
   * @param {number} priceInEth - Giá bán (ETH)
   */
  listNFT: async (web3, account, tokenId, priceInEth) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const marketplaceContract = web3Service.getContract(web3, "Marketplace");
      const marketplaceAddress = CONTRACTS.addresses.Marketplace;
      const priceInWei = ethToWei(priceInEth);

      console.log("📝 Listing NFT:", {
        tokenId,
        priceInEth,
        priceInWei,
        from: account,
      });

      // Step 1: Approve marketplace to transfer NFT
      console.log("⏳ Approving marketplace...");
      const approveTx = await nftContract.methods
        .approve(marketplaceAddress, tokenId)
        .send({
          from: account,
          gas: 100000,
        });

      console.log("✅ Approved:", approveTx.transactionHash);

      // Step 2: List NFT on marketplace
      console.log("⏳ Listing NFT on marketplace...");
      const listTx = await marketplaceContract.methods
        .listItem(tokenId, priceInWei)
        .send({
          from: account,
          gas: 200000,
        });

      console.log("✅ Listed successfully:", listTx.transactionHash);
      return {
        success: true,
        transactionHash: listTx.transactionHash,
        blockNumber: listTx.blockNumber,
      };
    } catch (error) {
      console.error("❌ List failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * Cancel listing on marketplace
   * @param {object} web3 - Web3 instance
   * @param {string} account - Seller wallet address
   * @param {number} listingId - Listing ID
   */
  cancelListing: async (web3, account, listingId) => {
    try {
      const marketplaceContract = web3Service.getContract(web3, "Marketplace");

      console.log("🚫 Cancelling listing:", { listingId, from: account });

      const tx = await marketplaceContract.methods
        .cancelListing(listingId)
        .send({
          from: account,
          gas: 150000,
        });

      console.log("✅ Cancelled:", tx.transactionHash);
      return {
        success: true,
        transactionHash: tx.transactionHash,
      };
    } catch (error) {
      console.error("❌ Cancel failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  // ========================================================================
  // RENTAL - ERC4907
  // ========================================================================

  /**
   * Cho thuê NFT bằng cách setUser (ERC4907)
   * @param {object} web3 - Web3 instance
   * @param {string} account - Owner wallet address
   * @param {number} tokenId - NFT token ID
   * @param {string} renterAddress - Renter wallet address
   * @param {number} durationDays - Số ngày cho thuê
   */
  rentNFT: async (web3, account, tokenId, renterAddress, durationDays) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");

      // Tính expires timestamp (UNIX timestamp)
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresTimestamp = currentTime + durationDays * 24 * 60 * 60;

      console.log("🏠 Setting user (rent NFT):", {
        tokenId,
        renterAddress,
        durationDays,
        expiresTimestamp,
      });

      // Gọi setUser function
      const tx = await nftContract.methods
        .setUser(tokenId, renterAddress, expiresTimestamp)
        .send({
          from: account,
          gas: 150000,
        });

      console.log("✅ Rent successful:", tx.transactionHash);
      return {
        success: true,
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
      };
    } catch (error) {
      console.error("❌ Rent failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * Kiểm tra user hiện tại của NFT (ERC4907)
   * @param {object} web3 - Web3 instance
   * @param {number} tokenId - NFT token ID
   */
  getUserOf: async (web3, tokenId) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const user = await nftContract.methods.userOf(tokenId).call();
      return user;
    } catch (error) {
      console.error("❌ Get user failed:", error);
      return null;
    }
  },

  /**
   * Lấy thời gian hết hạn của user (ERC4907)
   * @param {object} web3 - Web3 instance
   * @param {number} tokenId - NFT token ID
   */
  getUserExpires: async (web3, tokenId) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const expires = await nftContract.methods.userExpires(tokenId).call();
      return parseInt(expires);
    } catch (error) {
      console.error("❌ Get user expires failed:", error);
      return 0;
    }
  },

  // ========================================================================
  // AUCTION - RENTAL NFT
  // ========================================================================

  /**
   * Tạo auction cho thuê NFT
   * @param {object} web3 - Web3 instance
   * @param {string} account - Owner wallet address
   * @param {number} tokenId - NFT token ID
   * @param {number} startingBidInEth - Giá khởi điểm (ETH)
   * @param {number} auctionDurationDays - Thời gian auction (ngày)
   * @param {number} rentalDurationDays - Thời gian cho thuê (ngày)
   */
  createRentalAuction: async (
    web3,
    account,
    tokenId,
    startingBidInEth,
    auctionDurationDays,
    rentalDurationDays
  ) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const auctionAddress = CONTRACTS.addresses.Auction;

      if (!auctionAddress) {
        throw new Error("Auction contract not deployed");
      }

      const auctionContract = web3Service.getContract(web3, "Auction");

      const startingBidWei = ethToWei(startingBidInEth);
      const auctionDurationSeconds = auctionDurationDays * 24 * 60 * 60;

      console.log("🏠 Creating rental auction:", {
        tokenId,
        startingBidInEth,
        auctionDurationDays,
        rentalDurationDays,
      });

      // Step 1: Approve auction contract
      console.log("⏳ Approving auction contract...");
      const approveTx = await nftContract.methods
        .approve(auctionAddress, tokenId)
        .send({
          from: account,
          gas: 100000,
        });

      console.log("✅ Approved:", approveTx.transactionHash);

      // Step 2: Create rental auction
      console.log("⏳ Creating rental auction...");
      const auctionTx = await auctionContract.methods
        .createRentalAuction(
          tokenId,
          startingBidWei,
          auctionDurationSeconds,
          rentalDurationDays
        )
        .send({
          from: account,
          gas: 300000,
        });

      console.log("✅ Rental auction created:", auctionTx.transactionHash);
      return {
        success: true,
        transactionHash: auctionTx.transactionHash,
      };
    } catch (error) {
      console.error("❌ Create rental auction failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * Đặt bid cho auction (rental)
   * @param {object} web3 - Web3 instance
   * @param {string} account - Bidder wallet address
   * @param {number} auctionId - Auction ID
   * @param {number} bidAmountInEth - Số tiền bid (ETH)
   */
  placeBid: async (web3, account, auctionId, bidAmountInEth) => {
    try {
      const auctionContract = web3Service.getContract(web3, "Auction");
      const bidAmountWei = ethToWei(bidAmountInEth);

      console.log("💰 Placing bid:", {
        auctionId,
        bidAmountInEth,
        from: account,
      });

      const tx = await auctionContract.methods.placeBid(auctionId).send({
        from: account,
        value: bidAmountWei,
        gas: 200000,
      });

      console.log("✅ Bid placed:", tx.transactionHash);
      return {
        success: true,
        transactionHash: tx.transactionHash,
      };
    } catch (error) {
      console.error("❌ Bid failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * Kết thúc auction và transfer NFT
   * @param {object} web3 - Web3 instance
   * @param {string} account - Anyone can call this
   * @param {number} auctionId - Auction ID
   */
  endAuction: async (web3, account, auctionId) => {
    try {
      const auctionContract = web3Service.getContract(web3, "Auction");

      console.log("🏁 Ending auction:", { auctionId, from: account });

      const tx = await auctionContract.methods.endAuction(auctionId).send({
        from: account,
        gas: 300000,
      });

      console.log("✅ Auction ended:", tx.transactionHash);
      return {
        success: true,
        transactionHash: tx.transactionHash,
      };
    } catch (error) {
      console.error("❌ End auction failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  // ========================================================================
  // NFT OPERATIONS
  // ========================================================================

  /**
   * Get NFT owner
   * @param {object} web3 - Web3 instance
   * @param {number} tokenId - NFT token ID
   */
  getNFTOwner: async (web3, tokenId) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const owner = await nftContract.methods.ownerOf(tokenId).call();
      return owner;
    } catch (error) {
      console.error("❌ Get owner failed:", error);
      return null;
    }
  },

  /**
   * Get NFT metadata URI
   * @param {object} web3 - Web3 instance
   * @param {number} tokenId - NFT token ID
   */
  getTokenURI: async (web3, tokenId) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const uri = await nftContract.methods.tokenURI(tokenId).call();
      return uri;
    } catch (error) {
      console.error("❌ Get token URI failed:", error);
      return null;
    }
  },

  /**
   * Get listing details from blockchain
   * @param {object} web3 - Web3 instance
   * @param {number} listingId - Listing ID
   */
  getListing: async (web3, listingId) => {
    try {
      const marketplaceContract = web3Service.getContract(web3, "Marketplace");
      const listing = await marketplaceContract.methods
        .getListing(listingId)
        .call();

      return {
        listingId: listing.listingId,
        seller: listing.seller,
        tokenId: listing.tokenId,
        price: listing.price,
        status: listing.status, // 0: Active, 1: Sold, 2: Cancelled
      };
    } catch (error) {
      console.error("❌ Get listing failed:", error);
      return null;
    }
  },

  /**
   * Get auction details from blockchain
   * @param {object} web3 - Web3 instance
   * @param {number} auctionId - Auction ID
   */
  getAuction: async (web3, auctionId) => {
    try {
      const auctionContract = web3Service.getContract(web3, "Auction");
      const auction = await auctionContract.methods
        .getAuction(auctionId)
        .call();

      return {
        auctionId: auction.auctionId,
        seller: auction.seller,
        tokenId: auction.tokenId,
        startingBid: auction.startingBid,
        currentBid: auction.currentBid,
        currentBidder: auction.currentBidder,
        auctionEndTime: auction.auctionEndTime,
        ended: auction.ended,
        isRental: auction.isRental,
        rentalDuration: auction.rentalDuration,
      };
    } catch (error) {
      console.error("❌ Get auction failed:", error);
      return null;
    }
  },

  // ========================================================================
  // AUCTION - FOR PROPERTIES PAGE (NFT chưa có giá cố định)
  // ========================================================================

  /**
   * Tạo auction cho NFT (dành cho trang Properties)
   * @param {object} web3 - Web3 instance
   * @param {string} account - Owner wallet address
   * @param {number} tokenId - NFT token ID
   * @param {string} startingBidWei - Starting bid in Wei
   * @param {number} durationSeconds - Auction duration in seconds
   */
  createAuction: async (
    web3,
    account,
    tokenId,
    startingBidWei,
    durationSeconds
  ) => {
    try {
      const auctionContract = web3Service.getContract(web3, "Auction");
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const auctionAddress = CONTRACTS.addresses.Auction;

      console.log("🎯 Creating auction:", {
        tokenId,
        startingBidWei,
        durationSeconds,
        from: account,
      });

      // Step 1: Approve auction contract to transfer NFT
      console.log("⏳ Approving auction contract...");
      const approveTx = await nftContract.methods
        .approve(auctionAddress, tokenId)
        .send({
          from: account,
          gas: 100000,
        });

      console.log("✅ Approved:", approveTx.transactionHash);

      // Step 2: Create auction
      console.log("⏳ Creating auction...");
      const auctionTx = await auctionContract.methods
        .createAuction(tokenId, startingBidWei, durationSeconds)
        .send({
          from: account,
          gas: 300000,
        });

      console.log("✅ Auction created:", auctionTx.transactionHash);
      return {
        success: true,
        transactionHash: auctionTx.transactionHash,
        blockNumber: auctionTx.blockNumber,
      };
    } catch (error) {
      console.error("❌ Create auction failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * Tạo rental auction cho NFT (dành cho trang Properties)
   * @param {object} web3 - Web3 instance
   * @param {string} account - Owner wallet address
   * @param {number} tokenId - NFT token ID
   * @param {string} startingBidWei - Starting bid per day in Wei
   * @param {number} auctionDurationSeconds - Auction duration in seconds
   * @param {number} rentalDays - Rental period in days
   */
  createRentalAuction: async (
    web3,
    account,
    tokenId,
    startingBidWei,
    auctionDurationSeconds,
    rentalDays
  ) => {
    try {
      const auctionContract = web3Service.getContract(web3, "Auction");
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const auctionAddress = CONTRACTS.addresses.Auction;

      console.log("🏠 Creating rental auction:", {
        tokenId,
        startingBidWei,
        auctionDurationSeconds,
        rentalDays,
        from: account,
      });

      // Step 1: Approve auction contract to set user (ERC4907)
      console.log("⏳ Approving auction contract...");
      const approveTx = await nftContract.methods
        .approve(auctionAddress, tokenId)
        .send({
          from: account,
          gas: 100000,
        });

      console.log("✅ Approved:", approveTx.transactionHash);

      // Step 2: Create rental auction
      console.log("⏳ Creating rental auction...");
      const auctionTx = await auctionContract.methods
        .createRentalAuction(
          tokenId,
          startingBidWei,
          auctionDurationSeconds,
          rentalDays
        )
        .send({
          from: account,
          gas: 300000,
        });

      console.log("✅ Rental auction created:", auctionTx.transactionHash);
      return {
        success: true,
        transactionHash: auctionTx.transactionHash,
        blockNumber: auctionTx.blockNumber,
      };
    } catch (error) {
      console.error("❌ Create rental auction failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * Đặt giá trong auction
   * @param {object} web3 - Web3 instance
   * @param {string} account - Bidder wallet address
   * @param {number} auctionId - Auction ID
   * @param {string} bidAmountWei - Bid amount in Wei
   */
  placeBid: async (web3, account, auctionId, bidAmountWei) => {
    try {
      const auctionContract = web3Service.getContract(web3, "Auction");

      console.log("💰 Placing bid:", {
        auctionId,
        bidAmountWei,
        from: account,
      });

      const tx = await auctionContract.methods.placeBid(auctionId).send({
        from: account,
        value: bidAmountWei,
        gas: 200000,
      });

      console.log("✅ Bid placed:", tx.transactionHash);
      return {
        success: true,
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
      };
    } catch (error) {
      console.error("❌ Place bid failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * Kết thúc auction
   * @param {object} web3 - Web3 instance
   * @param {string} account - Account address
   * @param {number} auctionId - Auction ID
   */
  endAuction: async (web3, account, auctionId) => {
    try {
      const auctionContract = web3Service.getContract(web3, "Auction");

      console.log("🏁 Ending auction:", {
        auctionId,
        from: account,
      });

      const tx = await auctionContract.methods.endAuction(auctionId).send({
        from: account,
        gas: 300000,
      });

      console.log("✅ Auction ended:", tx.transactionHash);
      return {
        success: true,
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
      };
    } catch (error) {
      console.error("❌ End auction failed:", error);
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  /**
   * Get contract addresses
   */
  getContractAddresses: () => {
    return CONTRACTS.addresses;
  },

  /**
   * Get network info
   */
  getNetworkInfo: () => {
    return {
      network: CONTRACTS.network,
      chainId: CONTRACTS.chainId,
      deployer: CONTRACTS.deployer,
      deployedAt: CONTRACTS.deployedAt,
    };
  },
};

export default web3Service;
