// scripts/export-contracts.js
// Script to export contract ABIs and addresses for backend use

const ViePropChainNFT = artifacts.require("ViePropChainNFT");
const Marketplace = artifacts.require("Marketplace");
const fs = require('fs');
const path = require('path');

module.exports = async function(callback) {
  try {
    console.log('Exporting contract data for backend...\n');

    // Get deployed contract instances
    const nftContract = await ViePropChainNFT.deployed();
    const marketplaceContract = await Marketplace.deployed();

    // Get network information
    const networkId = await web3.eth.net.getId();
    const networkType = await web3.eth.net.getNetworkType();

    // Prepare contract information
    const contractsData = {
      network: {
        id: networkId,
        type: networkType
      },
      exportedAt: new Date().toISOString(),
      contracts: {
        ViePropChainNFT: {
          address: nftContract.address,
          abi: ViePropChainNFT.abi,
          contractName: 'ViePropChainNFT'
        },
        Marketplace: {
          address: marketplaceContract.address,
          abi: Marketplace.abi,
          contractName: 'Marketplace'
        }
      }
    };

    // Create backend directory if it doesn't exist
    const backendDir = path.join(__dirname, '..', 'backend');
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }

    // Save full contract data
    const contractsFilePath = path.join(backendDir, 'contracts.json');
    fs.writeFileSync(
      contractsFilePath,
      JSON.stringify(contractsData, null, 2)
    );

    // Save individual contract files (optional - easier to import)
    const nftFilePath = path.join(backendDir, 'ViePropChainNFT.json');
    fs.writeFileSync(
      nftFilePath,
      JSON.stringify({
        address: nftContract.address,
        abi: ViePropChainNFT.abi
      }, null, 2)
    );

    const marketplaceFilePath = path.join(backendDir, 'Marketplace.json');
    fs.writeFileSync(
      marketplaceFilePath,
      JSON.stringify({
        address: marketplaceContract.address,
        abi: Marketplace.abi
      }, null, 2)
    );

    // Save environment variables file
    const envFilePath = path.join(backendDir, '.env.contracts');
    const envContent = `# Contract Addresses - Generated on ${new Date().toISOString()}
NFT_CONTRACT_ADDRESS=${nftContract.address}
MARKETPLACE_CONTRACT_ADDRESS=${marketplaceContract.address}
NETWORK_ID=${networkId}
`;
    fs.writeFileSync(envFilePath, envContent);

    console.log('✅ Contract data exported successfully!\n');
    console.log('📁 Files created:');
    console.log(`   - ${contractsFilePath}`);
    console.log(`   - ${nftFilePath}`);
    console.log(`   - ${marketplaceFilePath}`);
    console.log(`   - ${envFilePath}`);
    console.log('\n📝 Contract Information:');
    console.log(`   Network: ${networkType} (ID: ${networkId})`);
    console.log(`   ViePropChainNFT: ${nftContract.address}`);
    console.log(`   Marketplace: ${marketplaceContract.address}`);

    callback();
  } catch (error) {
    console.error('❌ Error exporting contracts:', error);
    callback(error);
  }
};
