// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// Interface cho chức năng Thuê (ERC-4907)
interface IERC4907 is IERC721 {
    function setUser(uint256 tokenId, address user, uint64 expires) external;
}

contract Marketplace is Ownable {
    IERC4907 public nftContract;
    address payable public feeAccount;
    uint256 public feePercent = 1; // Phí sàn 1%

    event ItemSold(uint256 indexed tokenId, address buyer, uint256 price);
    event ItemRented(uint256 indexed tokenId, address tenant, uint256 duration);

    constructor(
        address _nftAddress,
        address payable _feeAccount
    ) Ownable(msg.sender) {
        nftContract = IERC4907(_nftAddress);
        feeAccount = _feeAccount;
    }

    // --- CHỨC NĂNG MUA (BÁN ĐỨT) ---
    // User gọi hàm này + Gửi ETH => Nhận NFT luôn
    function buyItemDirect(
        uint256 _tokenId,
        address payable _seller
    ) external payable {
        require(msg.value > 0, "Price must be > 0");

        // 1. Chia tiền
        uint256 fee = (msg.value * feePercent) / 100;
        uint256 sellerAmount = msg.value - fee;

        // 2. Chuyển tiền (Admin nhận phí, Seller nhận cục to)
        feeAccount.transfer(fee);
        _seller.transfer(sellerAmount);

        // 3. Chuyển NFT từ ví người đang giữ (Admin/Owner) sang người mua
        // *Lưu ý: Ví đang giữ NFT phải setApprovalForAll cho contract này trước
        address ownerOfToken = nftContract.ownerOf(_tokenId);
        // require(
        //     nftContract.getApproved(_tokenId) == address(this) ||
        //         nftContract.isApprovedForAll(ownerOfToken, address(this)),
        //     "NFT not approved for marketplace"
        // );
        nftContract.transferFrom(ownerOfToken, msg.sender, _tokenId);

        emit ItemSold(_tokenId, msg.sender, msg.value);
    }

    // --- CHỨC NĂNG THUÊ ---
    // User gọi hàm này + Gửi ETH => Được cấp quyền sử dụng
    function rentItemDirect(
        uint256 _tokenId,
        address payable _landlord,
        uint64 _durationDays
    ) external payable {
        require(msg.value > 0, "Rent price must be > 0");

        // 1. Chia tiền
        uint256 fee = (msg.value * feePercent) / 100;
        uint256 landlordAmount = msg.value - fee;

        // 2. Chuyển tiền
        feeAccount.transfer(fee);
        _landlord.transfer(landlordAmount);

        // 3. Tính hạn sử dụng & Cấp quyền
        uint64 expires = uint64(block.timestamp + (_durationDays * 1 days));
        nftContract.setUser(_tokenId, msg.sender, expires);

        emit ItemRented(_tokenId, msg.sender, _durationDays);
    }
}
