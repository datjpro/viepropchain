import React, { useState } from "react";
import { DEV_WALLETS } from "../../config/dev-wallets";
import {
  Wallet,
  JsonRpcProvider,
  parseEther,
  solidityPackedKeccak256,
  getBytes,
} from "ethers";
import { API_ENDPOINTS, getAuthHeaders } from "../../config/api";

const CreateListingDev = ({ defaultContractAddress }) => {
  const [selected, setSelected] = useState(DEV_WALLETS[0]);
  const [tokenId, setTokenId] = useState(1);
  const [priceEth, setPriceEth] = useState("1");

  const handleAutoSignAndList = async () => {
    try {
      const provider = new JsonRpcProvider("http://127.0.0.1:7545");
      const wallet = new Wallet(selected.privateKey, provider);

      const priceWei = parseEther(String(priceEth));
      const contractAddr =
        defaultContractAddress || "0x55f732E0d866A155b3A151A862996A13a22C0e8e";

      const hash = solidityPackedKeccak256(
        ["uint256", "uint256", "address"],
        [String(tokenId), String(priceWei), contractAddr]
      );

      const signature = await wallet.signMessage(getBytes(hash));

      const payload = {
        tokenId: tokenId,
        contractAddress: contractAddr,
        propertyId: "dev-property",
        price: priceWei.toString(),
        listingType: "sale",
        description: `DEV listing by ${selected.name}`,
        signature,
        sellerWallet: selected.address,
      };

      const resp = await fetch(API_ENDPOINTS.MARKETPLACE.LISTINGS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(err || "Listing request failed");
      }

      alert(`Listing created by ${selected.name}`);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 12, border: "1px dashed #888", margin: 12 }}>
      <h4>DEV: Account Switcher / Auto‑Sign Listing</h4>

      <div style={{ marginBottom: 8 }}>
        <label>Đóng vai: </label>
        <select
          value={selected.address}
          onChange={(e) => {
            const w = DEV_WALLETS.find((d) => d.address === e.target.value);
            setSelected(w || DEV_WALLETS[0]);
          }}
          style={{ marginLeft: 8 }}
        >
          {DEV_WALLETS.map((w) => (
            <option key={w.address} value={w.address}>
              {w.name} — {w.address}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Token ID: </label>
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(Number(e.target.value))}
          style={{ width: 120, marginLeft: 8 }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Price (ETH): </label>
        <input
          value={priceEth}
          onChange={(e) => setPriceEth(e.target.value)}
          style={{ width: 120, marginLeft: 8 }}
        />
      </div>

      <div>
        <button onClick={handleAutoSignAndList}>
          ⚡ Auto-Sign & Create Listing
        </button>
      </div>
    </div>
  );
};

export default CreateListingDev;
