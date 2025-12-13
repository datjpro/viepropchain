const ViePropChainNFT = artifacts.require("ViePropChainNFT");

module.exports = async function (callback) {
  try {
    const NFT_ADDRESS = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";
    const MARKETPLACE_ADDRESS = "0x4CE33E6d5F46eE14620aaAc2938262030f485610";
    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];

    console.log("🔄 Bắt đầu xử lý tất cả NFT...");

    const nft = await ViePropChainNFT.at(NFT_ADDRESS);
    const totalSupply = await nft.totalSupply();
    console.log(`📊 Tổng số NFT: ${totalSupply}`);

    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
      try {
        console.log(`\n🔍 Xử lý Token ID: ${tokenId}`);

        // Check if locked
        const isLocked = await nft.isLocked(tokenId);
        console.log(`   - Locked: ${isLocked}`);

        if (isLocked) {
          // Unlock by claiming to self
          console.log(`   🔓 Unlocking...`);
          await nft.claimNFT(admin, admin, tokenId);
          console.log(`   ✅ Unlocked!`);
        }

        // Check approval
        const currentApproved = await nft.getApproved(tokenId);
        console.log(`   - Approved for: ${currentApproved}`);

        if (
          currentApproved.toLowerCase() !== MARKETPLACE_ADDRESS.toLowerCase()
        ) {
          // Approve
          console.log(`   🔑 Approving for marketplace...`);
          await nft.approve(MARKETPLACE_ADDRESS, tokenId, { from: admin });
          console.log(`   ✅ Approved!`);
        } else {
          console.log(`   ⚠️ Already approved.`);
        }
      } catch (error) {
        console.error(`❌ Lỗi với Token ${tokenId}:`, error.message);
      }
    }

    console.log("\n🎉 Hoàn thành xử lý tất cả NFT!");
    callback();
  } catch (error) {
    console.error("❌ Lỗi tổng:", error);
    callback(error);
  }
};
