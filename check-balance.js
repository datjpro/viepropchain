const { Web3 } = require("web3");

const GANACHE_URL = "http://127.0.0.1:8545";

async function main() {
  const web3 = new Web3(GANACHE_URL);

  const buyerAddress = "0xd1abb2a4bb9652f90e0944affdf53f0cfff54d13";

  try {
    const balance = await web3.eth.getBalance(buyerAddress);
    const balanceEth = web3.utils.fromWei(balance, "ether");
    console.log("Buyer balance:", balanceEth, "ETH");

    // Total needed: 12 + 0.12 = 12.12 ETH
    const needed = web3.utils.toWei("12.12", "ether");
    console.log("Needed:", web3.utils.fromWei(needed, "ether"), "ETH");

    console.log("Checking balance...");
    if (BigInt(balance) >= BigInt(needed)) {
      console.log("✅ Sufficient balance");
    } else {
      console.log("❌ Insufficient balance");
      console.log("Balance:", BigInt(balance));
      console.log("Needed:", BigInt(needed));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
