// migrations/2_deploy_contracts.js
const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Marketplace = artifacts.require("Marketplace");

module.exports = async function (deployer) {
  // Deploy ViePropChainNFT contract
  await deployer.deploy(ViePropChainNFT);
  const nftContract = await ViePropChainNFT.deployed();

  // Deploy Marketplace contract, passing the NFT contract's address
  await deployer.deploy(Marketplace, nftContract.address);
};
