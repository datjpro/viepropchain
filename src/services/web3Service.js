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

  /**
   * Lấy thông tin listing từ tokenId
   * @param {object} web3 - Web3 instance
   * @param {number} tokenId - NFT token ID
   * @returns {Object|null} - Listing info hoặc null
   */
  getListingByTokenId: async (web3, tokenId) => {
    try {
      const marketplaceContract = web3Service.getContract(web3, "Marketplace");

      // Kiểm tra contract address
      console.log(
        "📋 Marketplace contract address:",
        marketplaceContract.options.address
      );

      // Lấy tổng số listings
      const listingCount = await marketplaceContract.methods
        .getListingCount()
        .call();
      console.log(
        `🔍 Searching through ${listingCount} listings for tokenId ${tokenId}`
      );

      // Debug: Nếu có listings, hiển thị hết để check
      if (listingCount > 0) {
        console.log("📋 DEBUG: All listings on contract:");
        for (let j = 1; j <= listingCount; j++) {
          try {
            const testListing = await marketplaceContract.methods
              .getListing(j)
              .call();
            console.log(`Listing ${j}:`, {
              tokenId: testListing.tokenId,
              tokenIdType: typeof testListing.tokenId,
              seller: testListing.seller,
              price: testListing.price,
              status: testListing.status,
              statusType: typeof testListing.status,
              listingType: testListing.listingType,
            });
          } catch (err) {
            console.log(`Error reading listing ${j}:`, err.message);
          }
        }
      }

      // Nếu không có listing nào, thông báo cần list NFT
      if (listingCount == 0) {
        console.log("⚠️ No listings found on blockchain. Total listings: 0");
        console.log(
          "💡 Suggestion: Owner should list NFT on marketplace first"
        );
        return null;
      }

      // Duyệt qua tất cả listings để tìm listing active cho tokenId này
      for (let i = 1; i <= listingCount; i++) {
        try {
          const listing = await marketplaceContract.methods
            .getListing(i)
            .call();

          console.log(`🔍 Checking listing ${i}:`, {
            tokenId: listing.tokenId,
            tokenIdType: typeof listing.tokenId,
            targetTokenId: tokenId,
            targetTokenIdType: typeof tokenId,
            seller: listing.seller,
            status: listing.status,
            statusType: typeof listing.status,
            listingType: listing.listingType,
            isTokenIdMatch: listing.tokenId == tokenId,
            isStatusActive: listing.status == "0" || listing.status == 0,
          });

          // Kiểm tra nếu listing này khớp với tokenId và đang active
          // Sử dụng both string và number comparison cho status
          const isActive = listing.status == "0" || listing.status == 0;
          const isTokenMatch = listing.tokenId == tokenId;

          if (isTokenMatch && isActive) {
            // 0 = Active
            console.log(
              `✅ Found active listing ${i} for tokenId ${tokenId}:`,
              listing
            );
            return {
              listingId: i,
              seller: listing.seller,
              tokenId: parseInt(listing.tokenId),
              price: listing.price,
              status: listing.status,
              listingType: listing.listingType == "0" ? "sale" : "rental",
            };
          }
        } catch (error) {
          // Listing có thể không tồn tại, bỏ qua
          console.log(`⚠️ Skipping listing ${i}:`, error.message);
        }
      }

      console.log(`❌ No active listing found for tokenId ${tokenId}`);
      console.log(
        `💡 Found ${listingCount} total listings, but none match tokenId ${tokenId} with active status`
      );
      return null;
    } catch (error) {
      console.error("❌ Get listing by tokenId failed:", error);
      return null;
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
   * Approve marketplace to transfer NFT
   * @param {object} web3 - Web3 instance
   * @param {string} account - Owner wallet address
   * @param {number} tokenId - NFT token ID
   */
  approveMarketplace: async (web3, account, tokenId) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const marketplaceAddress = CONTRACTS.addresses.Marketplace;

      console.log("⏳ Approving marketplace for NFT:", {
        tokenId,
        marketplaceAddress,
        from: account,
        contractAddress: CONTRACTS.addresses.ViePropChainNFT,
      });

      // Check if already approved
      const currentApproval = await nftContract.methods
        .getApproved(tokenId)
        .call();
      console.log("Current approval:", currentApproval);

      if (currentApproval.toLowerCase() === marketplaceAddress.toLowerCase()) {
        console.log("✅ Already approved for marketplace");
        return {
          success: true,
          alreadyApproved: true,
          transactionHash: null,
        };
      }

      const approveTx = await nftContract.methods
        .approve(marketplaceAddress, tokenId)
        .send({
          from: account,
          gas: 200000, // Increased gas limit
          gasPrice: await web3.eth.getGasPrice(),
        });

      console.log("✅ Approved successfully:", approveTx.transactionHash);
      return {
        success: true,
        transactionHash: approveTx.transactionHash,
        blockNumber: approveTx.blockNumber,
      };
    } catch (error) {
      console.error("❌ Approve failed:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      });
      throw {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  },

  /**
   * Check if NFT is approved for marketplace
   * @param {object} web3 - Web3 instance
   * @param {number} tokenId - NFT token ID
   */
  isApprovedForMarketplace: async (web3, tokenId) => {
    try {
      const nftContract = web3Service.getContract(web3, "ViePropChainNFT");
      const marketplaceAddress = CONTRACTS.addresses.Marketplace;

      console.log("🔍 Checking approval for tokenId:", tokenId);
      const approved = await nftContract.methods.getApproved(tokenId).call();
      console.log(
        "Approved address:",
        approved,
        "Marketplace:",
        marketplaceAddress
      );

      const isApproved =
        approved.toLowerCase() === marketplaceAddress.toLowerCase();
      console.log("Is approved for marketplace:", isApproved);

      return isApproved;
    } catch (error) {
      console.error("❌ Check approval failed:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      });
      return false;
    }
  },

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
