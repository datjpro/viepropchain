/**
 * ========================================================================
 * SMART CONTRACT CONFIGURATION
 * ========================================================================
 * Contract addresses và ABIs cho development environment
 * Được copy từ deployment-development.json
 * ========================================================================
 */

export const CONTRACTS = {
  network: "development",
  chainId: 1337,
  deployer: "0xC6890b26A32d9d92aefbc8635C4588247529CdfE",
  deployedAt: "2025-11-02T08:55:05.846Z",

  // Contract addresses
  addresses: {
    ViePropChainNFT: "0x17Aaf4b68DF5bA409FAEBE59ff771E27e1db85E2",
    Marketplace: "0x0d32Dc114C7fba20bef83509CcaBE58d81e296cb",
    Offers: "0xbb1De761881f47a6128C60dcf5aD954Df95d58D6",
    // Auction: undefined - Chưa deploy
  },

  // Marketplace ABI (minimal - chỉ functions cần thiết)
  abis: {
    Marketplace: [
      {
        inputs: [
          { internalType: "uint256", name: "_listingId", type: "uint256" },
        ],
        name: "buyItem",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_tokenId", type: "uint256" },
          { internalType: "uint256", name: "_price", type: "uint256" },
        ],
        name: "listItem",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_listingId", type: "uint256" },
        ],
        name: "cancelListing",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_listingId", type: "uint256" },
        ],
        name: "getListing",
        outputs: [
          {
            components: [
              { internalType: "uint256", name: "listingId", type: "uint256" },
              { internalType: "address", name: "seller", type: "address" },
              { internalType: "uint256", name: "tokenId", type: "uint256" },
              { internalType: "uint256", name: "price", type: "uint256" },
              {
                internalType: "enum Marketplace.ListingStatus",
                name: "status",
                type: "uint8",
              },
            ],
            internalType: "struct Marketplace.Listing",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getListingCount",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],

    ViePropChainNFT: [
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "ownerOf",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "getApproved",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "operator", type: "address" },
        ],
        name: "isApprovedForAll",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "tokenURI",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],

    Auction: [
      {
        inputs: [
          { internalType: "uint256", name: "_tokenId", type: "uint256" },
          { internalType: "uint256", name: "_startingBid", type: "uint256" },
          {
            internalType: "uint256",
            name: "_auctionDuration",
            type: "uint256",
          },
          { internalType: "uint256", name: "_rentalDays", type: "uint256" },
        ],
        name: "createRentalAuction",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_auctionId", type: "uint256" },
        ],
        name: "placeBid",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_auctionId", type: "uint256" },
        ],
        name: "endAuction",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_auctionId", type: "uint256" },
        ],
        name: "getAuction",
        outputs: [
          {
            components: [
              { internalType: "uint256", name: "auctionId", type: "uint256" },
              { internalType: "address", name: "seller", type: "address" },
              { internalType: "uint256", name: "tokenId", type: "uint256" },
              { internalType: "uint256", name: "startingBid", type: "uint256" },
              { internalType: "uint256", name: "currentBid", type: "uint256" },
              {
                internalType: "address",
                name: "currentBidder",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "auctionEndTime",
                type: "uint256",
              },
              { internalType: "bool", name: "ended", type: "bool" },
              { internalType: "bool", name: "isRental", type: "bool" },
              {
                internalType: "uint256",
                name: "rentalDuration",
                type: "uint256",
              },
            ],
            internalType: "struct Auction.AuctionDetails",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],

    Offers: [
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "makeOffer",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "cancelOffer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "address", name: "buyer", type: "address" },
        ],
        name: "acceptOffer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
};

export default CONTRACTS;
