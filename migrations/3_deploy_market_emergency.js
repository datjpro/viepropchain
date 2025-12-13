// migrations/3_deploy_market_emergency.js
const Marketplace = artifacts.require("Marketplace");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  // 1. ĐỊA CHỈ NFT CŨ (Đảm bảo đúng địa chỉ bạn đang dùng nhé!)
  const nftContractAddress = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";

  // 2. Tài khoản Admin nhận phí
  const feeAccount = accounts[0];

  // 3. Deploy Marketplace Mới
  await deployer.deploy(Marketplace, nftContractAddress, feeAccount);

  const marketplaceContract = await Marketplace.deployed();

  // 4. Lưu lại thông tin (Ghi đè file contracts.json cũ)
  const contractsData = {
    network: network,
    deployedAt: new Date().toISOString(),
    contracts: {
      ViePropChainNFT: {
        address: nftContractAddress,
        abi: [], // ABI rỗng cũng được, Backend không cần ABI NFT để chạy luồng mua bán này
      },
      Marketplace: {
        address: marketplaceContract.address,
        abi: Marketplace.abi,
      },
    },
  };

  const backendDir = path.join(__dirname, "..", "backend");
  const contractsFilePath = path.join(backendDir, "contracts.json");
  fs.writeFileSync(contractsFilePath, JSON.stringify(contractsData, null, 2));

  console.log(`\n✅ Đã Deploy Marketplace Mới: ${marketplaceContract.address}`);
  console.log(`⚠️  NHỚ CẤP QUYỀN (APPROVE) CHO ĐỊA CHỈ NÀY!\n`);
};
