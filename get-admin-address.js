// ===================================================================
// HƯỚNG DẪN: Lấy địa chỉ Admin từ Smart Contract
// ===================================================================

// Cách 1: Hard code địa chỉ admin (Đơn giản, khuyên dùng)
// ----------------------------------------------------------------
// Mở file: src/contexts/AdminContext.js
// Tìm dòng: const ADMIN_ADDRESSES = [...]
// Thêm địa chỉ của bạn:

const ADMIN_ADDRESSES = [
  "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4".toLowerCase(), // Admin 1
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2".toLowerCase(), // Admin 2
];

// ===================================================================

// Cách 2: Tự động lấy từ Smart Contract (Nâng cao)
// ----------------------------------------------------------------
// Bước 1: Lấy địa chỉ contract đã deploy
// Tìm trong build/contracts/ViePropChainNFT.json

const CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS_HERE";

// Bước 2: Import ABI
import ViePropChainNFT from "../build/contracts/ViePropChainNFT.json";

// Bước 3: Trong useEffect của AdminContext.js, uncomment phần code:
/*
if (web3Api.web3 && CONTRACT_ADDRESS) {
  try {
    const contract = new web3Api.web3.eth.Contract(
      ViePropChainNFT.abi,
      CONTRACT_ADDRESS
    );
    
    // Nếu contract có hàm owner()
    const owner = await contract.methods.owner().call();
    const ownerLower = owner.toLowerCase();
    setContractOwner(ownerLower);
    
    // Check admin: là owner HOẶC trong danh sách admin
    setIsAdmin(accountLower === ownerLower || isInAdminList);
  } catch (err) {
    console.error("Error checking contract owner:", err);
    // Fallback to admin list
    setIsAdmin(isInAdminList);
  }
}
*/

// ===================================================================
// Script kiểm tra địa chỉ owner của contract
// ===================================================================

async function checkContractOwner() {
  const Web3 = require("web3");

  // Kết nối đến Ganache hoặc network của bạn
  const web3 = new Web3("http://127.0.0.1:7545");

  // Import contract
  const ViePropChainNFT = require("./build/contracts/ViePropChainNFT.json");

  // Lấy địa chỉ contract từ networks (Ganache chainId: 1337)
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = ViePropChainNFT.networks[networkId];

  if (!deployedNetwork) {
    console.error("❌ Contract chưa được deploy trên network này!");
    return;
  }

  const contractAddress = deployedNetwork.address;
  console.log("📝 Contract Address:", contractAddress);

  // Tạo contract instance
  const contract = new web3.eth.Contract(ViePropChainNFT.abi, contractAddress);

  try {
    // Gọi hàm owner() nếu contract có
    const owner = await contract.methods.owner().call();
    console.log("👑 Contract Owner:", owner);
    console.log("📋 Copy địa chỉ này vào ADMIN_ADDRESSES:");
    console.log(`"${owner.toLowerCase()}",`);
  } catch (err) {
    console.error("❌ Contract không có hàm owner():", err.message);
    console.log("💡 Tip: Hãy hard code địa chỉ deployer vào ADMIN_ADDRESSES");

    // Lấy danh sách accounts từ Ganache
    const accounts = await web3.eth.getAccounts();
    console.log("\n📋 Các địa chỉ có sẵn trong Ganache:");
    accounts.forEach((acc, idx) => {
      console.log(`  [${idx}] ${acc}`);
    });
    console.log(
      "\n💡 Account [0] thường là địa chỉ deployer. Thêm vào ADMIN_ADDRESSES:"
    );
    console.log(`"${accounts[0].toLowerCase()}",`);
  }
}

// Chạy: node get-admin-address.js
if (require.main === module) {
  checkContractOwner()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { checkContractOwner };

// ===================================================================
// HƯỚNG DẪN SỬ DỤNG
// ===================================================================
/*

1. Lưu file này tại root project: get-admin-address.js

2. Chạy lệnh để lấy địa chỉ owner:
   node get-admin-address.js

3. Copy địa chỉ in ra và paste vào src/contexts/AdminContext.js:

   const ADMIN_ADDRESSES = [
     "0x... địa chỉ vừa copy".toLowerCase(),
   ];

4. Khởi động lại app:
   npm start

5. Kết nối MetaMask với địa chỉ admin đó

6. Kiểm tra:
   - Badge "👑 ADMIN" hiện trên header
   - Link "⚙️ Admin Panel" xuất hiện
   - Có thể truy cập /admin/nft

*/
