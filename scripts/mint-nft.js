// scripts/mint-nft.js
// Script để mint NFT cho một địa chỉ

const ViePropChainNFT = artifacts.require("ViePropChainNFT");

module.exports = async function (callback) {
  try {
    const accounts = await web3.eth.getAccounts();
    const nftContract = await ViePropChainNFT.deployed();

    console.log("=".repeat(60));
    console.log("🎨 MINT NFT");
    console.log("=".repeat(60));
    console.log("Contract Address:", nftContract.address);
    console.log("Owner (msg.sender):", accounts[0]);
    console.log("");

    // Lấy địa chỉ người nhận từ argument hoặc dùng account[1]
    const recipient = process.argv[6] || accounts[1];

    console.log("👤 Mint NFT cho:", recipient);
    console.log("⏳ Đang mint...");

    // Tạo metadata đơn giản
    const tokenURI = JSON.stringify({
      name: `ViePropChain Property #${Date.now()}`,
      description: "Bất động sản trên blockchain ViePropChain",
      image: "https://via.placeholder.com/300x300.png?text=VPC+Property",
      attributes: [
        {
          trait_type: "Location",
          value: "Hà Nội",
        },
        {
          trait_type: "Area",
          value: "100m²",
        },
        {
          trait_type: "Price",
          value: "5 ETH",
        },
      ],
    });

    // Mint NFT
    const result = await nftContract.mint(recipient, tokenURI);

    // Lấy token ID từ event
    const tokenId = result.logs[0].args.tokenId.toString();

    console.log("");
    console.log("✅ MINT THÀNH CÔNG!");
    console.log("=".repeat(60));
    console.log("📦 Token ID:", tokenId);
    console.log("👤 Owner:", recipient);
    console.log("🔗 Transaction:", result.tx);
    console.log("⛽ Gas Used:", result.receipt.gasUsed);
    console.log("");
    console.log("📋 METADATA:");
    console.log(JSON.parse(tokenURI));
    console.log("");
    console.log("=".repeat(60));
    console.log("📱 THÊM VÀO METAMASK:");
    console.log("=".repeat(60));
    console.log("1. Mở MetaMask và chọn account:", recipient);
    console.log("2. Chuyển sang tab 'NFTs'");
    console.log("3. Nhấn 'Import NFT'");
    console.log("4. Nhập:");
    console.log(`   Address: ${nftContract.address}`);
    console.log(`   Token ID: ${tokenId}`);
    console.log("5. Nhấn 'Import'");
    console.log("=".repeat(60));

    callback();
  } catch (error) {
    console.error("❌ Lỗi:", error);
    callback(error);
  }
};
