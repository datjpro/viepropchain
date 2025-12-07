// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Import ERC4907 interface
interface IERC4907 is
    IERC721 // Đảm bảo IERC4907 cũng là IERC721
{
    function setUser(uint256 tokenId, address user, uint64 expires) external;

    function userOf(uint256 tokenId) external view returns (address);

    function userExpires(uint256 tokenId) external view returns (uint256);
}

contract Marketplace is Ownable, ReentrancyGuard {
    uint256 private _listingIds;

    address payable public immutable feeAccount;
    uint256 public immutable feePercent;

    // Sửa lại: Dùng IERC4907 vì nó đã kế thừa IERC721
    IERC4907 private immutable nftContract;

    enum ListingStatus {
        Active,
        Sold, // Dùng cho cả Bán và Đã cho thuê
        Cancelled
    }

    enum ListingType {
        Sale,
        Rental
    }

    struct Listing {
        uint256 listingId;
        address seller;
        uint256 tokenId;
        uint256 price; // Dùng cho Sale, hoặc PricePerDay cho Rental
        ListingStatus status;
        ListingType listingType;
        uint256 rentalDuration; // Chỉ dùng cho Rental (max duration)
    }

    mapping(uint256 => Listing) public listings;

    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price, // Giá bán hoặc Giá/ngày
        ListingType listingType
    );

    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 tokenId
    );

    event ItemRented(
        uint256 indexed listingId,
        address indexed renter,
        uint256 indexed tokenId,
        uint64 expires
    );

    event ListingCancelled(uint256 indexed listingId);

    constructor(
        address _nftContractAddress,
        uint256 _feePercent,
        address payable _feeAccount
    ) Ownable(msg.sender) {
        // Hợp đồng NFT của bạn PHẢI hỗ trợ EIP-4907
        nftContract = IERC4907(_nftContractAddress);
        feePercent = _feePercent;
        feeAccount = _feeAccount;
    }

    // --- SỬA LẠI: List NFT for sale (Approval Model) ---
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

        // *** THÊM MỚI: Kiểm tra EIP-4907 ***
        require(
            nftContract.userExpires(_tokenId) <= block.timestamp,
            "Cannot list an actively rented NFT"
        );
        // *** HẾT ***

        _listingIds++;
        uint256 listingId = _listingIds;

        // *** BỎ: Không chuyển NFT vào hợp đồng ***
        // nftContract.transferFrom(msg.sender, address(this), _tokenId);

        listings[listingId] = Listing(
            listingId,
            msg.sender,
            _tokenId,
            _price,
            ListingStatus.Active,
            ListingType.Sale,
            0 // rentalDuration
        );

        emit ItemListed(
            listingId,
            msg.sender,
            _tokenId,
            _price,
            ListingType.Sale
        );
    }

    // --- SỬA LẠI: List NFT for rent (Approval Model) ---
    function listForRent(
        uint256 _tokenId,
        uint256 _pricePerDay,
        uint256 _maxRentalDurationDays
    ) external {
        require(_pricePerDay > 0, "Price per day must be greater than zero");
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "You must own the NFT to list it"
        );
        // Phê duyệt là cần thiết để Marketplace có thể gọi setUser
        require(
            nftContract.getApproved(_tokenId) == address(this) ||
                nftContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace must be approved to set user"
        );

        _listingIds++;
        uint256 listingId = _listingIds;

        listings[listingId] = Listing(
            listingId,
            msg.sender,
            _tokenId,
            _pricePerDay, // price bây giờ là giá/ngày
            ListingStatus.Active,
            ListingType.Rental,
            _maxRentalDurationDays * 1 days // convert to seconds
        );

        emit ItemListed(
            listingId,
            msg.sender,
            _tokenId,
            _pricePerDay,
            ListingType.Rental
        );
    }

    // --- SỬA LẠI: Buy NFT (Approval Model) ---
    function buyItem(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.listingId != 0, "Listing does not exist");
        require(
            listing.status == ListingStatus.Active,
            "Listing is not active"
        );
        require(
            listing.listingType == ListingType.Sale,
            "This is not a sale listing"
        );

        // Yêu cầu trả chính xác giá (tránh rắc rối hoàn tiền)
        require(
            msg.value == listing.price,
            "Please send the exact listing price"
        );

        address seller = listing.seller;
        uint256 totalPrice = listing.price;
        uint256 fee = (totalPrice * feePercent) / 100;
        uint256 sellerProceeds = totalPrice - fee;

        // Tác động (Effect) - Cập nhật trạng thái TRƯỚC
        listing.status = ListingStatus.Sold;

        // Tương tác (Interactions) - Gửi tiền
        (bool sentSeller, ) = payable(seller).call{value: sellerProceeds}("");
        require(sentSeller, "Failed to send Ether to seller");

        (bool sentFee, ) = payable(feeAccount).call{value: fee}("");
        require(sentFee, "Failed to send Ether to fee account");

        // *** SỬA LẠI: Chuyển NFT từ Người Bán sang Người Mua ***
        nftContract.transferFrom(seller, msg.sender, listing.tokenId);

        emit ItemSold(_listingId, msg.sender, listing.tokenId);
    }

    /**
     * @dev OFF-CHAIN LISTING MODEL: Buy NFT directly without on-chain listing
     * Used when listing data is stored off-chain (MongoDB) for gas savings
     * @param _tokenId NFT token ID to purchase
     * @param _seller Seller wallet address (from database)
     */
    function buyItemDirect(
        uint256 _tokenId,
        address _seller
    ) external payable nonReentrant {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Cannot buy from yourself");
        require(msg.value > 0, "Payment required");

        // Verify seller owns the NFT
        require(
            nftContract.ownerOf(_tokenId) == _seller,
            "Seller does not own this NFT"
        );

        // Verify NFT is not currently rented
        require(
            nftContract.userExpires(_tokenId) <= block.timestamp,
            "Cannot buy an actively rented NFT"
        );

        uint256 totalPrice = msg.value;
        uint256 fee = (totalPrice * feePercent) / 100;
        uint256 sellerProceeds = totalPrice - fee;

        // Transfer payment to seller
        (bool sentSeller, ) = payable(_seller).call{value: sellerProceeds}("");
        require(sentSeller, "Failed to send Ether to seller");

        // Transfer fee to platform
        (bool sentFee, ) = payable(feeAccount).call{value: fee}("");
        require(sentFee, "Failed to send Ether to fee account");

        // Transfer NFT from seller to buyer
        // Requires seller to approve Marketplace via setApprovalForAll
        nftContract.transferFrom(_seller, msg.sender, _tokenId);

        // Emit event (using listingId = 0 for off-chain listings)
        emit ItemSold(0, msg.sender, _tokenId);
    }

    // --- SỬA LẠI: Rent NFT (Thêm logic cập nhật status) ---
    function rentItem(
        uint256 _listingId,
        uint256 _rentalDays
    ) external payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.listingId != 0, "Listing does not exist");
        require(
            listing.status == ListingStatus.Active,
            "Listing is not active"
        );
        require(
            listing.listingType == ListingType.Rental,
            "This is not a rental listing"
        );
        require(_rentalDays > 0, "Rental days must be greater than zero");
        require(
            (_rentalDays * 1 days) <= listing.rentalDuration,
            "Rental days exceed maximum allowed"
        );

        uint256 totalRentPrice = listing.price * _rentalDays; // price là giá/ngày
        require(
            msg.value == totalRentPrice,
            "Please send the exact rental price"
        );

        // *** THÊM MỚI: Vô hiệu hóa listing này ngay lập tức ***
        listing.status = ListingStatus.Sold; // "Sold" có nghĩa là đã được dùng

        address owner = listing.seller;
        uint256 fee = (totalRentPrice * feePercent) / 100;
        uint256 ownerProceeds = totalRentPrice - fee;

        uint64 expires = uint64(block.timestamp + (_rentalDays * 1 days));

        // Tương tác (Interactions)
        // 1. Set user (ERC4907)
        // Yêu cầu: Owner (seller) phải approve cho Marketplace làm việc này
        nftContract.setUser(listing.tokenId, msg.sender, expires);

        // 2. Gửi tiền cho chủ sở hữu
        (bool sentOwner, ) = payable(owner).call{value: ownerProceeds}("");
        require(sentOwner, "Failed to send Ether to owner");

        // 3. Gửi tiền phí
        (bool sentFee, ) = payable(feeAccount).call{value: fee}("");
        require(sentFee, "Failed to send Ether to fee account");

        emit ItemRented(_listingId, msg.sender, listing.tokenId, expires);
    }

    // --- SỬA LẠI: Cancel Listing (Approval Model) ---
    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(listing.listingId != 0, "Listing does not exist");
        require(listing.seller == msg.sender, "You are not the seller");
        require(
            listing.status == ListingStatus.Active,
            "Listing is not active"
        );

        // Tác động (Effect)
        listing.status = ListingStatus.Cancelled;

        // *** BỎ: Không cần chuyển NFT vì nó vẫn ở trong ví người bán ***
        // if (listing.listingType == ListingType.Sale) {
        //     nftContract.transferFrom(address(this), msg.sender, listing.tokenId);
        // }

        emit ListingCancelled(_listingId);
    }

    // --- CÁC HÀM VIEW (Giữ nguyên) ---
    function getListing(
        uint256 _listingId
    ) public view returns (Listing memory) {
        return listings[_listingId];
    }

    function getListingCount() public view returns (uint256) {
        return _listingIds;
    }

    function isRented(uint256 _tokenId) public view returns (bool) {
        return nftContract.userExpires(_tokenId) > block.timestamp;
    }

    function getCurrentRenter(uint256 _tokenId) public view returns (address) {
        if (isRented(_tokenId)) {
            return nftContract.userOf(_tokenId);
        }
        return address(0);
    }

    function getRentalExpiry(uint256 _tokenId) public view returns (uint256) {
        return nftContract.userExpires(_tokenId);
    }
}
