const { Web3 } = require("web3");

// Kết nối đến Ganache
const web3 = new Web3("http://127.0.0.1:8545");

// Thông tin từ listing
const tokenId = 6;
const price = "12000000000000000000"; // Wei
const marketplaceAddress = "0x84e093ED1c99D69739c9B4808a45aa6A159736D0"; // Marketplace contract
const sellerAddress = "0xc6890b26a32d9d92aefbc8635c4588247529cdfe";
const signature =
  "0x370f7cf59b2bd0eb2ae1ee0a4e99f4ddcfdea1964faffd074fd99dd101c2adf946a6…"; // Từ listing

// Tạo message hash như contract
const messageHash = web3.utils.keccak256(
  web3.eth.abi.encodeParameters(
    ["uint256", "uint256", "address"],
    [tokenId, price, marketplaceAddress]
  )
);

console.log("Message hash:", messageHash);

// Tạo Ethereum signed message hash
const ethSignedMessageHash = web3.utils.keccak256(
  "\x19Ethereum Signed Message:\n32" + messageHash.slice(2)
);

console.log("Eth signed message hash:", ethSignedMessageHash);

// Recover signer
try {
  const recoveredSigner = web3.eth.accounts
    .recover(ethSignedMessageHash, signature)
    .toLowerCase();

  console.log("Expected seller:", sellerAddress);
  console.log("Recovered signer:", recoveredSigner);
  console.log("Signature valid:", recoveredSigner === sellerAddress);
} catch (error) {
  console.error("Error recovering signer:", error.message);
}
