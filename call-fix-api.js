/**
 * Call admin API to fix NFT #0 ownership
 */

const axios = require("axios");

async function fixOwnership() {
  try {
    // Get admin token (sử dụng token admin đã có)
    const adminToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzIwY2E5YzMxMzBjZDVjZGRjNzk3YzgiLCJlbWFpbCI6InRvZGF0MjIwN0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzM1NjE3MTd9.xSYo0uS3YDcxMlMJmfYfQWUz1d4z0Sf5o2_8mQvxeek";

    const response = await axios.post(
      "http://localhost:3000/api/admin/fix-nft-ownership",
      {
        tokenId: 0,
        newOwner: "0xd1abb2a4bb9652f90e0944affdf53f0cfff54d13",
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API Response:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("❌ API Error:", error.response.data);
      console.error("   Status:", error.response.status);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

fixOwnership();
