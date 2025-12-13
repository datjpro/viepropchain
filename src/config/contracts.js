/**
 * ========================================================================
 * SMART CONTRACT CONFIGURATION
 * ========================================================================
 * Import contracts from contracts.json (deployed by Truffle)
 * This ensures frontend always has the latest ABI and addresses
 * ========================================================================
 */

import contractsData from "./contracts.json";

export const CONTRACTS = {
  network: contractsData.network || "development",
  chainId: 1337,
  deployedAt: contractsData.deployedAt,

  // Contract addresses - loaded from Truffle deployment
  addresses: {
    ViePropChainNFT: contractsData.contracts.ViePropChainNFT.address,
    Marketplace: contractsData.contracts.Marketplace.address,
    VPCToken: contractsData.contracts.VPCToken?.address,
    Auction: contractsData.contracts.Auction?.address,
    Lending: contractsData.contracts.Lending?.address,
  },

  // Full ABIs from deployment (includes buyItemDirect and all latest functions)
  abis: {
    Marketplace: contractsData.contracts.Marketplace.abi,
    ViePropChainNFT: contractsData.contracts.ViePropChainNFT.abi,
    VPCToken: contractsData.contracts.VPCToken?.abi || [],
    Auction: contractsData.contracts.Auction?.abi || [],
    Lending: contractsData.contracts.Lending?.abi || [],
  },
};

export default CONTRACTS;
