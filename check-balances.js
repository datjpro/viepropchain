/**
 * Kiểm tra số dư ETH của admin và buyer
 */

const { Web3 } = require("web3");

const GANACHE_URL = "http://127.0.0.1:8545";
const ADMIN_ADDRESS = "0xC6890b26A32d9d92aefbc8635C4588247529CdfE";
const BUYER_ADDRESS = "0xd1ABb2a4Bb9652f90E0944AFfDf53F0cFFf54D13";

async function main() {
  const web3 = new Web3(GANACHE_URL);

  console.log("💰 Checking ETH balances...\n");

  // Admin balance
  const adminBalance = await web3.eth.getBalance(ADMIN_ADDRESS);
  const adminETH = web3.utils.fromWei(adminBalance, "ether");
  console.log(`👑 Admin (${ADMIN_ADDRESS}):`);
  console.log(`   Balance: ${adminETH} ETH`);
  console.log(`   Wei: ${adminBalance}\n`);

  // Buyer balance
  const buyerBalance = await web3.eth.getBalance(BUYER_ADDRESS);
  const buyerETH = web3.utils.fromWei(buyerBalance, "ether");
  console.log(`👤 Buyer (${BUYER_ADDRESS}):`);
  console.log(`   Balance: ${buyerETH} ETH`);
  console.log(`   Wei: ${buyerBalance}\n`);

  // NFT ownership
  const NFT_CONTRACT = "0xEA4F5F49F396B13CA447FaA792A8702054019Cc8";
  const NFT_ABI = [
    {
      inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
      name: "ownerOf",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT);
  const owner = await nftContract.methods.ownerOf(0).call();

  console.log(`🎨 NFT TokenId #0:`);
  console.log(`   Owner: ${owner}`);
  console.log(
    `   Is Buyer: ${
      owner.toLowerCase() === BUYER_ADDRESS.toLowerCase() ? "✅ YES" : "❌ NO"
    }\n`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
