import React, { useState, useEffect } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "string",
        name: "tokenURI",
        type: "string",
      },
    ],
    name: "mint",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

function TestPage() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState("");
  const [tokenCounter, setTokenCounter] = useState(0);
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [tokenURI, setTokenURI] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const connectWallet = async () => {
    if (web3) {
      try {
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const loadContract = () => {
    if (web3 && contractAddress) {
      const contractInstance = new web3.eth.Contract(
        contractABI,
        contractAddress
      );
      setContract(contractInstance);
      loadContractData(contractInstance);
    }
  };

  const loadContractData = async (contractInstance) => {
    try {
      const counter = await contractInstance.methods.tokenCounter().call();
      setTokenCounter(counter);

      const ownerAddr = await contractInstance.methods.owner().call();
      setOwner(ownerAddr);

      if (account) {
        const bal = await contractInstance.methods.balanceOf(account).call();
        setBalance(bal);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const mintNFT = async () => {
    if (contract && recipient && tokenURI) {
      setLoading(true);
      try {
        await contract.methods
          .mint(recipient, tokenURI)
          .send({ from: account });
        alert("NFT minted successfully!");
        loadContractData(contract);
      } catch (error) {
        console.error(error);
        alert("Error minting NFT");
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>ViePropChainNFT Test Interface</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected Account: {account}</p>
      )}

      <div style={{ marginTop: "20px" }}>
        <label>Contract Address:</label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="Enter contract address"
        />
        <button onClick={loadContract}>Load Contract</button>
      </div>

      {contract && (
        <div style={{ marginTop: "20px" }}>
          <h2>Contract Info</h2>
          <p>Token Counter: {tokenCounter}</p>
          <p>Owner: {owner}</p>
          <p>Your Balance: {balance}</p>

          <h3>Mint NFT</h3>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="text"
            placeholder="Token URI"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
          />
          <button onClick={mintNFT} disabled={loading}>
            {loading ? "Minting..." : "Mint NFT"}
          </button>
        </div>
      )}
    </div>
  );
}

export default TestPage;
