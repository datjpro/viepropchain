const ViePropChainNFT = artifacts.require("ViePropChainNFT");

module.exports = async function (callback) {
  try {
    const NFT_ADDRESS = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8"; // Địa chỉ NFT cũ
    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0]; // Ví Admin

    // ID của cái NFT đang bị lỗi trong log của bạn là 6
    const TOKEN_ID_TO_UNLOCK = 6;

    console.log(`🔓 Đang mở khóa Token ID: ${TOKEN_ID_TO_UNLOCK}...`);

    const nft = await ViePropChainNFT.at(NFT_ADDRESS);

    // Kiểm tra xem có đang bị khóa không
    const isLocked = await nft.isLocked(TOKEN_ID_TO_UNLOCK);
    console.log(`   - Trạng thái khóa hiện tại: ${isLocked}`);

    if (isLocked) {
      // MẸO: Claim từ Admin sang Admin để mở khóa
      await nft.claimNFT(admin, admin, TOKEN_ID_TO_UNLOCK);
      console.log("✅ Đã mở khóa thành công!");
    } else {
      console.log("⚠️ Token này không bị khóa, lỗi do nguyên nhân khác.");
    }

    callback();
  } catch (error) {
    console.error("❌ Lỗi:", error);
    callback(error);
  }
};
