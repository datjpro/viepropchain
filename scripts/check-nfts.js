// scripts/check-nfts.js
// Script để kiểm tra NFTs của một địa chỉ

const ViePropChainNFT = artifacts.require("ViePropChainNFT");

module.exports = async function (callback) {
  try {
    const accounts = await web3.eth.getAccounts();
    const nftContract = await ViePropChainNFT.deployed();

    console.log("=".repeat(60));
    console.log("📋 THÔNG TIN NFT CONTRACT");
    console.log("=".repeat(60));
    console.log("Contract Address:", nftContract.address);
    console.log("Contract Name:", await nftContract.name());
    console.log("Contract Symbol:", await nftContract.symbol());
    console.log("Total Supply:", (await nftContract.tokenCounter()).toString());
    console.log("");

    // Lấy địa chỉ từ argument hoặc dùng account đầu tiên
    const targetAddress = process.argv[6] || accounts[0];

    console.log("=".repeat(60));
    console.log("👤 KIỂM TRA NFTs CHO ADDRESS:", targetAddress);
    console.log("=".repeat(60));

    const balance = await nftContract.balanceOf(targetAddress);
    console.log(`Số lượng NFT: ${balance.toString()}`);
    console.log("");

    if (parseInt(balance.toString()) === 0) {
      console.log("❌ Địa chỉ này không có NFT nào!");
      console.log("");
      console.log("💡 Để mint NFT, chạy:");
      console.log(`   truffle exec scripts/mint-nft.js --network development`);
    } else {
      console.log("📦 DANH SÁCH NFTs:");
      console.log("-".repeat(60));

      // Duyệt qua tất cả token IDs để tìm NFT của user
      const totalSupply = parseInt(
        (await nftContract.tokenCounter()).toString()
      );

      for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        try {
          const owner = await nftContract.ownerOf(tokenId);

          if (owner.toLowerCase() === targetAddress.toLowerCase()) {
            console.log(`\n🎨 Token ID: ${tokenId}`);
            console.log(`   Owner: ${owner}`);

            try {
              const tokenURI = await nftContract.tokenURI(tokenId);
              console.log(`   Token URI: ${tokenURI}`);

              // Nếu là IPFS hoặc HTTP, fetch metadata
              if (tokenURI.startsWith("http") || tokenURI.startsWith("ipfs")) {
                console.log(`   📄 Metadata: ${tokenURI}`);
              }
            } catch (err) {
              console.log(`   ⚠️  Token URI không có`);
            }
          }
        } catch (err) {
          // Token không tồn tại
        }
      }
    }

    console.log("");
    console.log("=".repeat(60));
    console.log("📱 HƯỚNG DẪN THÊM NFT VÀO METAMASK");
    console.log("=".repeat(60));
    console.log("1. Mở MetaMask và chuyển sang tab 'NFTs'");
    console.log("2. Nhấn 'Import NFT' ở dưới cùng");
    console.log("3. Nhập thông tin:");
    console.log(`   - Address: ${nftContract.address}`);
    console.log(`   - Token ID: [Xem danh sách token IDs ở trên]`);
    console.log("4. Nhấn 'Import'");
    console.log("");
    console.log("⚠️  LƯU Ý:");
    console.log("   - MetaMask KHÔNG tự động phát hiện NFT trên Ganache");
    console.log("   - Bạn phải import thủ công từng NFT bằng Token ID");
    console.log("   - NFT chỉ hiển thị nếu bạn là owner");
    console.log("=".repeat(60));

    callback();
  } catch (error) {
    console.error("❌ Lỗi:", error);
    callback(error);
  }
};
