const ViePropChainNFT = artifacts.require("ViePropChainNFT");

module.exports = async function (callback) {
  try {
    const NFT_ADDRESS = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";
    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];

    const TOKEN_ID = 6;

    console.log(`🔍 Checking Token ID: ${TOKEN_ID}`);

    const nft = await ViePropChainNFT.at(NFT_ADDRESS);

    const owner = await nft.ownerOf(TOKEN_ID);
    console.log(`👤 Owner: ${owner}`);

    const isLocked = await nft.isLocked(TOKEN_ID);
    console.log(`🔒 Locked: ${isLocked}`);

    const approved = await nft.getApproved(TOKEN_ID);
    console.log(`✅ Approved for: ${approved}`);

    callback();
  } catch (error) {
    console.error("❌ Lỗi:", error);
    callback(error);
  }
};
