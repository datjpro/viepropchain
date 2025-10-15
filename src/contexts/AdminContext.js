import React, { createContext, useContext, useState, useEffect } from "react";
import { useWeb3 } from "./Web3Context";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { account, web3Api } = useWeb3();
  const [isAdmin, setIsAdmin] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  // Địa chỉ owner của smart contract (thay bằng địa chỉ thực tế)
  // Bạn có thể lấy từ contract hoặc hard code
  const ADMIN_ADDRESSES = [
    "0xC6890b26A32d9d92aefbc8635C4588247529CdfE".toLowerCase(),
  ];

  // Check xem account hiện tại có phải admin không
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!account) {
        setIsAdmin(false);
        return;
      }

      setIsCheckingAdmin(true);

      try {
        const accountLower = account.toLowerCase();

        // Kiểm tra xem account có trong danh sách admin không
        const isInAdminList = ADMIN_ADDRESSES.includes(accountLower);

        // Nếu có contract, có thể check owner từ contract
        if (web3Api.web3 && window.CONTRACT_ADDRESS) {
          try {
            // TODO: Thay bằng ABI và address thực tế của contract
            // const contract = new web3Api.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            // const owner = await contract.methods.owner().call();
            // const ownerLower = owner.toLowerCase();
            // setContractOwner(ownerLower);
            // setIsAdmin(accountLower === ownerLower || isInAdminList);

            // Tạm thời chỉ dùng danh sách admin
            setIsAdmin(isInAdminList);
          } catch (err) {
            console.error("Error checking contract owner:", err);
            // Fallback to admin list
            setIsAdmin(isInAdminList);
          }
        } else {
          setIsAdmin(isInAdminList);
        }

        console.log("🔐 Admin check:", {
          account: accountLower,
          isAdmin: isInAdminList,
        });
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [account, web3Api.web3]);

  const value = {
    isAdmin,
    contractOwner,
    isCheckingAdmin,
    ADMIN_ADDRESSES,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
