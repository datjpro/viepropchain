const { Web3 } = require("web3");

// Kết nối đến Ganache
const web3 = new Web3("http://127.0.0.1:8545");

// Thông tin
const tokenId = 6;
const price = "12000000000000000000"; // Wei
const marketplaceAddress = "0x84e093ED1c99D69739c9B4808a45aa6A159736D0";
const sellerPrivateKey =
  "0x843501ecc602247126b5c52ff65d3b0050a9039f23480f005535465ac2734fae";

// Tạo message hash như contract dùng abi.encode
const encoded = web3.eth.abi.encodeParameters(
  ["uint256", "uint256", "address"],
  [tokenId, price, marketplaceAddress]
);
const messageHash = web3.utils.keccak256(encoded);

console.log("Message hash:", messageHash);

// Tạo Ethereum signed message hash
const ethSignedMessageHash = web3.utils.keccak256(
  "\x19Ethereum Signed Message:\n32" + messageHash.slice(2)
);

console.log("Eth signed message hash:", ethSignedMessageHash);

// Sign với private key của seller
const signature = web3.eth.accounts.sign(
  ethSignedMessageHash,
  sellerPrivateKey
);

console.log("Generated signature:", signature.signature);
console.log("Signer address:", signature.address);
