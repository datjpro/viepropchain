import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Web3 } from "web3";

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
  });

  // Khởi tạo account từ localStorage
  const [account, setAccount] = useState(() => {
    const savedAccount = localStorage.getItem("walletAccount");
    return savedAccount || null;
  });

  // Khởi tạo privateKey từ localStorage
  const [privateKey, setPrivateKey] = useState(() => {
    const savedKey = localStorage.getItem("walletPrivateKey");
    return savedKey || null;
  });

  const [balance, setBalance] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState(() => {
    return localStorage.getItem("connectionMethod") || "ganache";
  });

  // ================================================================
  // GANACHE ACCOUNTS - Hardcoded từ mnemonic
  // ================================================================
  const GANACHE_ACCOUNTS = [
    {
      address: "0xC6890b26A32d9d92aefbc8635C4588247529CdfE",
      privateKey:
        "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
    },
    {
      address: "0xd1ABb2a4Bb9652f90E0944AFfDf53F0cFFf54D13",
      privateKey:
        "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1",
    },
    {
      address: "0xDE4936c84576B5552E31290FEaeE715bF32ca231",
      privateKey:
        "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
    },
    {
      address: "0x1C80dCb2BBa0e0E493A8f75e4a73a4E8F7D8a8Eb",
      privateKey:
        "0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913",
    },
    {
      address: "0x5A86eB3a4c26F793f6e0e6B05c7b0c5e79f9e0C9",
      privateKey:
        "0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743",
    },
  ];

  // ================================================================
  // PERSISTENCE - Lưu vào localStorage
  // ================================================================
  useEffect(() => {
    if (account) {
      localStorage.setItem("walletAccount", account);
      console.log("💾 Saved account to localStorage:", account);
    } else {
      localStorage.removeItem("walletAccount");
    }
  }, [account]);

  useEffect(() => {
    if (privateKey) {
      localStorage.setItem("walletPrivateKey", privateKey);
    } else {
      localStorage.removeItem("walletPrivateKey");
    }
  }, [privateKey]);

  useEffect(() => {
    console.log("Web3Context - web3Api changed:", web3Api);
  }, [web3Api]);

  useEffect(() => {
    localStorage.setItem("connectionMethod", connectionMethod);
  }, [connectionMethod]);

  // ================================================================
  // WEB3 INITIALIZATION - Kết nối Ganache
  // ================================================================
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        console.log("🔗 Connecting to Ganache...");

        // Kết nối trực tiếp với Ganache
        const provider = new Web3.providers.HttpProvider(
          "http://127.0.0.1:8545"
        );
        const web3Instance = new Web3(provider);

        // Test connection
        const blockNumber = await web3Instance.eth.getBlockNumber();
        console.log(`✅ Connected to Ganache - Block: ${blockNumber}`);

        const newWeb3Api = {
          provider,
          web3: web3Instance,
        };
        console.log("Setting web3Api:", newWeb3Api);
        setWeb3Api(newWeb3Api);

        // Set network ID
        const netId = await web3Instance.eth.net.getId();
        setNetworkId(Number(netId));
        console.log("Network ID set to:", Number(netId));

        // Auto-connect to first Ganache account if no account is set
        if (!account) {
          console.log("🔑 Auto-connecting to first Ganache account...");
          const firstAccount = GANACHE_ACCOUNTS[0];
          setAccount(firstAccount.address.toLowerCase());
          setPrivateKey(firstAccount.privateKey);
          setConnectionMethod("ganache");
          console.log("✅ Auto-connected to:", firstAccount.address);
        }

        setError(null);
      } catch (err) {
        console.error("❌ Failed to connect to Ganache:", err.message);
        setError(
          "Cannot connect to Ganache. Please make sure it's running on port 8545."
        );
      }
    };

    initializeWeb3();
  }, []);

  // ================================================================
  // BALANCE UPDATES
  // ================================================================
  useEffect(() => {
    const getBalance = async () => {
      if (web3Api.web3 && account) {
        try {
          const balanceWei = await web3Api.web3.eth.getBalance(account);
          const balanceEth = web3Api.web3.utils.fromWei(balanceWei, "ether");
          setBalance(parseFloat(balanceEth).toFixed(4));
        } catch (err) {
          console.error("Error getting balance:", err);
        }
      }
    };

    getBalance();

    // Refresh balance every 10 seconds
    if (account && web3Api.web3) {
      const interval = setInterval(getBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [web3Api.web3, account]);

  // ================================================================
  // CONNECTION METHODS
  // ================================================================

  // Kết nối bằng MetaMask (legacy)
  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setConnectionMethod("metamask");
        console.log("✅ Connected to MetaMask:", accounts[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to connect to MetaMask");
      console.error("MetaMask connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Kết nối bằng Private Key
  const connectWithPrivateKey = useCallback(
    async (inputPrivateKey) => {
      if (!web3Api.web3) {
        setError("Web3 not initialized");
        return false;
      }

      setIsConnecting(true);
      setError(null);

      try {
        // Validate private key format
        let formattedKey = inputPrivateKey.trim();
        if (!formattedKey.startsWith("0x")) {
          formattedKey = "0x" + formattedKey;
        }

        // Test the private key by creating an account
        const account =
          web3Api.web3.eth.accounts.privateKeyToAccount(formattedKey);

        setAccount(account.address.toLowerCase());
        setPrivateKey(formattedKey);
        setConnectionMethod("privatekey");

        console.log("✅ Connected with private key:", account.address);
        return true;
      } catch (err) {
        setError("Invalid private key format");
        console.error("Private key connection error:", err);
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [web3Api.web3]
  );

  // Kết nối bằng Ganache account
  const connectGanacheAccount = useCallback(
    async (accountIndex) => {
      if (!web3Api.web3) {
        setError("Web3 not initialized");
        return false;
      }

      if (accountIndex < 0 || accountIndex >= GANACHE_ACCOUNTS.length) {
        setError("Invalid account index");
        return false;
      }

      setIsConnecting(true);
      setError(null);

      try {
        const selectedAccount = GANACHE_ACCOUNTS[accountIndex];

        setAccount(selectedAccount.address.toLowerCase());
        setPrivateKey(selectedAccount.privateKey);
        setConnectionMethod("ganache");

        console.log(
          "✅ Connected to Ganache account:",
          selectedAccount.address
        );
        return true;
      } catch (err) {
        setError("Failed to connect to Ganache account");
        console.error("Ganache connection error:", err);
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [web3Api.web3]
  );

  // Ngắt kết nối
  const disconnect = useCallback(() => {
    setAccount(null);
    setPrivateKey(null);
    setBalance(null);
    setError(null);
    setConnectionMethod("ganache");
    console.log("🔌 Disconnected from wallet");
  }, []);

  // ================================================================
  // TRANSACTION SIGNING - Sử dụng private key
  // ================================================================
  const signAndSendTransaction = useCallback(
    async (transactionParams) => {
      if (!web3Api.web3 || !account || !privateKey) {
        throw new Error("Web3, account, or private key not available");
      }

      try {
        // Get gas price and nonce
        const gasPrice = await web3Api.web3.eth.getGasPrice();
        const nonce = await web3Api.web3.eth.getTransactionCount(account);

        const txParams = {
          from: account,
          gasPrice: gasPrice,
          nonce: nonce,
          ...transactionParams,
        };

        // Estimate gas if not provided
        if (!txParams.gas) {
          txParams.gas = await web3Api.web3.eth.estimateGas(txParams);
        }

        // Sign transaction with private key
        const signedTx = await web3Api.web3.eth.accounts.signTransaction(
          txParams,
          privateKey
        );

        // Send signed transaction
        const receipt = await web3Api.web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );

        console.log("✅ Transaction sent:", receipt.transactionHash);
        return receipt;
      } catch (err) {
        console.error("❌ Transaction failed:", err);
        throw err;
      }
    },
    [web3Api.web3, account, privateKey]
  );

  // ================================================================
  // CONTEXT VALUE
  // ================================================================
  const value = {
    // Web3 API
    web3: web3Api.web3,
    provider: web3Api.provider,

    // Account info
    account,
    balance,
    networkId,
    privateKey,
    connectionMethod,

    // Status
    error,
    isConnecting,
    isConnected: !!account,

    // Connection methods
    connectMetaMask,
    connectWithPrivateKey,
    connectGanacheAccount,
    disconnect,

    // Transaction signing
    signAndSendTransaction,

    // Ganache accounts for UI
    ganacheAccounts: GANACHE_ACCOUNTS,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
