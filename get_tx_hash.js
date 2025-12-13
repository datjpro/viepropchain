const { Web3 } = require("web3");
const web3 = new Web3("http://localhost:8545"); // Ganache default port

async function getLatestTxHash() {
  try {
    const latestBlock = await web3.eth.getBlock("latest", true);
    if (latestBlock.transactions.length > 0) {
      const tx = latestBlock.transactions[0];
      console.log("Latest Transaction Hash:", tx.hash);
      console.log("From:", tx.from);
      console.log("To:", tx.to);
      console.log("Value:", web3.utils.fromWei(tx.value, "ether"), "ETH");
      console.log("Gas Used:", tx.gas);
      console.log("Block Number:", tx.blockNumber);
    } else {
      console.log("No transactions in latest block");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

getLatestTxHash();
