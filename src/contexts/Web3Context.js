import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Web3 } from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
  });

  // Khởi tạo account từ localStorage (giống LanguageContext)
  const [account, setAccount] = useState(() => {
    // Kiểm tra xem có account đã lưu không
    const savedAccount = localStorage.getItem("walletAccount");
    return savedAccount || null;
  });

  const [balance, setBalance] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Lưu account vào localStorage khi thay đổi (giống LanguageContext)
  useEffect(() => {
    if (account) {
      localStorage.setItem("walletAccount", account);
      console.log("💾 Saved account to localStorage:", account);
    } else {
      localStorage.removeItem("walletAccount");
      console.log("🗑️ Removed account from localStorage");
    }
  }, [account]);

  // Detect MetaMask provider on mount
  useEffect(() => {
    const loadProvider = async () => {
      try {
        const provider = await detectEthereumProvider();

        if (provider) {
          const web3Instance = new Web3(provider);
          setWeb3Api({
            provider,
            web3: web3Instance,
          });

          // Nếu có account trong localStorage, verify với MetaMask
          const savedAccount = localStorage.getItem("walletAccount");
          if (savedAccount) {
            console.log("🔍 Found saved account:", savedAccount);
            console.log("🔄 Verifying with MetaMask...");

            try {
              const accounts = await provider.request({
                method: "eth_accounts",
              });

              if (accounts && accounts.length > 0) {
                // Kiểm tra xem saved account có trong danh sách không
                if (accounts.includes(savedAccount)) {
                  console.log("✅ Account verified, auto-connecting...");
                  setAccount(savedAccount);
                } else {
                  console.log(
                    "⚠️ Saved account not found in MetaMask, using first account"
                  );
                  setAccount(accounts[0]);
                }
              } else {
                console.log(
                  "ℹ️ No accounts in MetaMask, clearing localStorage"
                );
                localStorage.removeItem("walletAccount");
              }
            } catch (err) {
              console.error("❌ Error verifying account:", err);
            }
          }
        } else {
          setError(
            "MetaMask is not installed. Please install MetaMask extension."
          );
          console.error("MetaMask not detected");
        }
      } catch (err) {
        console.error("Error detecting provider:", err);
        setError("Failed to detect MetaMask provider.");
      }
    };

    loadProvider();
  }, []);

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        console.log("🔌 User disconnected wallet");
        setAccount(null);
        setBalance(null);
        setError("Please connect to MetaMask.");
      } else if (accounts[0] !== account) {
        console.log("🔄 Account changed to:", accounts[0]);
        setAccount(accounts[0]);
        setError(null);
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    if (web3Api.provider) {
      web3Api.provider.on("accountsChanged", handleAccountsChanged);
      web3Api.provider.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (web3Api.provider && web3Api.provider.removeListener) {
        web3Api.provider.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        web3Api.provider.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [web3Api.provider, account]);

  // Get balance when account changes
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
  }, [web3Api.web3, account]);

  // Get network ID when web3 is loaded
  useEffect(() => {
    const getNetwork = async () => {
      if (web3Api.web3) {
        try {
          const netId = await web3Api.web3.eth.net.getId();
          setNetworkId(Number(netId));
        } catch (err) {
          console.error("Error getting network:", err);
        }
      }
    };

    getNetwork();
  }, [web3Api.web3]);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (!web3Api.provider) {
      setError("MetaMask is not installed. Please install MetaMask extension.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log("🔗 Requesting account access...");
      // Request account access
      const accounts = await web3Api.provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        console.log("✅ Connected to:", accounts[0]);
        setAccount(accounts[0]); // localStorage sẽ tự động lưu qua useEffect
        setError(null);
      }
    } catch (err) {
      console.error("❌ Error connecting to MetaMask:", err);

      if (err.code === 4001) {
        // User rejected the connection request
        setError("Connection request rejected. Please try again.");
      } else {
        setError("Failed to connect to MetaMask. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [web3Api.provider]);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    console.log("🔌 Disconnecting wallet...");
    setAccount(null); // localStorage sẽ tự động xóa qua useEffect
    setBalance(null);
    setError(null);
  }, []);

  // Format address helper
  const formatAddress = useCallback((address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const value = {
    web3Api,
    account,
    balance,
    networkId,
    error,
    isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
