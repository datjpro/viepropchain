/**
 * Fix NFT #0 ownership in database after manual transfer
 * Manually update database to reflect blockchain state
 */

const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      lowercase: true,
      required: true,
    },
    nft: {
      tokenId: Number,
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

async function fixOwnership() {
  try {
    const MONGO_URI =
      "mongodb+srv://todat2207:dat123456@cluster0.c9fwb.mongodb.net/viepropchain?retryWrites=true&w=majority";

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const buyerWallet = "0xd1abb2a4bb9652f90e0944affdf53f0cfff54d13";

    // Find NFT #0
    const property = await Property.findOne({ "nft.tokenId": 0 });

    if (!property) {
      console.error("❌ NFT #0 not found in database");
      process.exit(1);
    }

    console.log(`📝 Current owner: ${property.owner}`);
    console.log(`🔄 Updating to: ${buyerWallet}`);

    property.owner = buyerWallet;
    await property.save();

    console.log("✅ NFT #0 ownership updated in database");
    console.log("🔍 Verify:");
    console.log(`   Database owner: ${property.owner}`);

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixOwnership();
