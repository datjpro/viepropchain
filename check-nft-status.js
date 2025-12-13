const { Web3 } = require("web3");

// Cấu hình
const GANACHE_URL = "http://127.0.0.1:8545";
const NFT_CONTRACT_ADDRESS = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";

const NFT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

async function main() {
  const web3 = new Web3(GANACHE_URL);
  const nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS);

  try {
    const owner = await nftContract.methods.ownerOf(6).call();
    console.log("Owner of tokenId 6:", owner);

    const approved = await nftContract.methods.getApproved(6).call();
    console.log("Approved address for tokenId 6:", approved);

    console.log(
      "Marketplace address:",
      "0x84e093ED1c99D69739c9B4808a45aa6A159736D0"
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
