const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

// Kết nối MongoDB
const { MongoClient } = require("mongodb");
const MONGODB_URI =
  "mongodb+srv://db_dacn:123456%40ABC@dacn.swowsqw.mongodb.net/viepropchain";

// Thông tin contract
const GANACHE_URL = "http://127.0.0.1:8545";
const NFT_CONTRACT_ADDRESS = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";
const MARKETPLACE_CONTRACT_ADDRESS =
  "0x4CE33E6d5F46eE14620aaAc2938262030f485610";
const SELLER_PRIVATE_KEY =
  "0x843501ecc602247126b5c52ff65d3b0050a9039f23480f005535465ac2734fae";

async function updateSignatures() {
  const client = new MongoClient(MONGODB_URI);
  const web3 = new Web3(GANACHE_URL);

  try {
    await client.connect();
    const db = client.db("viepropchain");
    const listings = db.collection("listings");

    // Lấy tất cả listings
    const allListings = await listings.find({}).toArray();
    console.log(`Found ${allListings.length} listings to update`);

    for (const listing of allListings) {
      if (!listing.signedPrice || !listing.tokenId) {
        console.log(`Skipping listing ${listing._id} - missing data`);
        continue;
      }

      const tokenId = listing.tokenId;
      const price = listing.signedPrice; // Wei string

      // Tạo message hash mới với Marketplace address mới
      const encoded = web3.eth.abi.encodeParameters(
        ["uint256", "uint256", "address"],
        [tokenId, price, MARKETPLACE_CONTRACT_ADDRESS]
      );
      const messageHash = web3.utils.keccak256(encoded);

      // Tạo Ethereum signed message hash
      const ethSignedMessageHash = web3.utils.keccak256(
        "\x19Ethereum Signed Message:\n32" + messageHash.slice(2)
      );

      // Sign với private key của seller
      const signature = web3.eth.accounts.sign(
        ethSignedMessageHash,
        SELLER_PRIVATE_KEY
      );

      // Cập nhật signature trong DB
      await listings.updateOne(
        { _id: listing._id },
        { $set: { sellerSignature: signature.signature } }
      );

      console.log(
        `Updated signature for listing ${listing._id} (tokenId: ${tokenId})`
      );
    }

    console.log("✅ All signatures updated successfully!");
  } catch (error) {
    console.error("❌ Error updating signatures:", error);
  } finally {
    await client.close();
  }
}

updateSignatures();
