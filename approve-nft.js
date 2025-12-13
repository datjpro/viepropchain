const ViePropChainNFT = artifacts.require("ViePropChainNFT");

module.exports = async function (callback) {
  try {
    const NFT_ADDRESS = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";
    const MARKETPLACE_ADDRESS = "0x4CE33E6d5F46eE14620aaAc2938262030f485610";
    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];

    const TOKEN_ID = 6;

    console.log(`🔑 Approving Token ID: ${TOKEN_ID} for marketplace...`);

    const nft = await ViePropChainNFT.at(NFT_ADDRESS);

    // Check current approval
    const currentApproved = await nft.getApproved(TOKEN_ID);
    console.log(`   - Current approved address: ${currentApproved}`);

    if (currentApproved.toLowerCase() !== MARKETPLACE_ADDRESS.toLowerCase()) {
      // Approve for marketplace
      await nft.approve(MARKETPLACE_ADDRESS, TOKEN_ID, { from: admin });
      console.log("✅ Approved successfully!");
    } else {
      console.log("⚠️ Already approved.");
    }

    callback();
  } catch (error) {
    console.error("❌ Lỗi:", error);
    callback(error);
  }
};
