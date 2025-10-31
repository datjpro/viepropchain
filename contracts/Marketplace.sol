// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Marketplace {
    uint256 private _listingIds;

    address payable public immutable feeAccount;
    uint256 public immutable feePercent;

    IERC721 private immutable nftContract;

    enum ListingStatus {
        Active,
        Sold,
        Cancelled
    }

    struct Listing {
        uint256 listingId;
        address seller;
        uint256 tokenId;
        uint256 price;
        ListingStatus status;
    }

    mapping(uint256 => Listing) public listings;

    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 tokenId
    );

    event ListingCancelled(uint256 indexed listingId);

    constructor(
        address _nftContractAddress,
        uint256 _feePercent,
        address payable _feeAccount
    ) {
        nftContract = IERC721(_nftContractAddress);
        feePercent = _feePercent;
        feeAccount = _feeAccount;
    }

    function listItem(uint256 _tokenId, uint256 _price) external {
        require(_price > 0, "Price must be greater than zero");
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "You must own the NFT to list it"
        );
        require(
            nftContract.getApproved(_tokenId) == address(this) ||
                nftContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace must be approved to transfer the NFT"
        );

        _listingIds++;
        uint256 listingId = _listingIds;

        // Transfer NFT to the contract
        nftContract.transferFrom(msg.sender, address(this), _tokenId);

        listings[listingId] = Listing(
            listingId,
            msg.sender,
            _tokenId,
            _price,
            ListingStatus.Active
        );

        emit ItemListed(listingId, msg.sender, _tokenId, _price);
    }

    function buyItem(uint256 _listingId) external payable {
        Listing storage listing = listings[_listingId];
        require(listing.listingId != 0, "Listing does not exist");
        require(
            listing.status == ListingStatus.Active,
            "Listing is not active"
        );

        // Yêu cầu người mua trả ĐÚNG BẰNG giá niêm yết
        require(
            msg.value == listing.price, // Dùng '==' thay vì '>=' để tránh rắc rối
            "Please send the exact listing price"
        );

        // Tính toán tiền
        address seller = listing.seller;
        uint256 price = listing.price;
        uint256 fee = (price * feePercent) / 100;

        // Đảm bảo giá đủ lớn để trừ phí
        require(price > fee, "Price too low to cover fee");

        uint256 sellerProceeds = price - fee; // Tiền người bán thực nhận

        // Update listing status (NÊN làm trước khi gửi tiền)
        listing.status = ListingStatus.Sold;

        // --- Thanh toán (Sửa ở đây) ---
        // 1. Trả tiền cho người bán (phần sau khi trừ phí)
        (bool sentSeller, ) = payable(seller).call{value: sellerProceeds}("");
        require(sentSeller, "Failed to send Ether to seller");

        // 2. Trả tiền phí cho sàn
        (bool sentFee, ) = payable(feeAccount).call{value: fee}("");
        require(sentFee, "Failed to send Ether to fee account");

        // --- Chuyển NFT ---
        // (NÊN làm cuối cùng sau khi tiền đã xong)
        nftContract.transferFrom(address(this), msg.sender, listing.tokenId);

        emit ItemSold(_listingId, msg.sender, listing.tokenId);
    }

    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(listing.listingId != 0, "Listing does not exist");
        require(listing.seller == msg.sender, "You are not the seller");
        require(
            listing.status == ListingStatus.Active,
            "Listing is not active"
        );

        // Update listing status
        listing.status = ListingStatus.Cancelled;

        // Return NFT to the seller
        nftContract.transferFrom(address(this), msg.sender, listing.tokenId);

        emit ListingCancelled(_listingId);
    }

    function getListing(
        uint256 _listingId
    ) public view returns (Listing memory) {
        return listings[_listingId];
    }

    function getListingCount() public view returns (uint256) {
        return _listingIds;
    }
}
