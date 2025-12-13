/**
 * ========================================================================
 * DEBUG WEB3CONTEXT - Test tại sao balance không hiển thị
 * ========================================================================
 */

import React, { useEffect } from "react";
import { useWeb3 } from "../contexts/GanacheWeb3Context";

const DebugWeb3 = () => {
  const {
    provider,
    web3,
    account,
    balance,
    networkId,
    error,
    isConnecting,
    connectWallet,
  } = useWeb3();

  useEffect(() => {
    console.log("🔍 DEBUG WEB3CONTEXT STATE:");
    console.log("═══════════════════════════");
    console.log("Provider:", provider ? "✅ Available" : "❌ Not available");
    console.log("Web3:", web3 ? "✅ Available" : "❌ Not available");
    console.log("Account:", account || "❌ Not connected");
    console.log("Balance:", balance || "❌ Not available");
    console.log("Network ID:", networkId || "❌ Not available");
    console.log("Error:", error || "✅ No error");
    console.log("Is Connecting:", isConnecting ? "🔄 Yes" : "✅ No");
    console.log("═══════════════════════════");
  }, [provider, web3, account, balance, networkId, error, isConnecting]);

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "white",
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <h3>🔍 Web3 Debug Info</h3>

      <div>
        <strong>Provider:</strong> {provider ? "✅" : "❌"}
      </div>
      <div>
        <strong>Web3:</strong> {web3 ? "✅" : "❌"}
      </div>
      <div>
        <strong>Account:</strong>{" "}
        {account ? account.slice(0, 10) + "..." : "❌"}
      </div>
      <div>
        <strong>Balance:</strong> {balance || "❌"}
      </div>
      <div>
        <strong>Network:</strong> {networkId || "❌"}
      </div>
      <div>
        <strong>Error:</strong> {error || "None"}
      </div>

      <button
        onClick={connectWallet}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
};

export default DebugWeb3;
