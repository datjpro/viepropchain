// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface kế thừa IERC721 để tránh redundancy
interface IERC4907 is IERC721 {
    function setUser(uint256 tokenId, address user, uint64 expires) external;

    function userOf(uint256 tokenId) external view returns (address);

    function userExpires(uint256 tokenId) external view returns (uint256);
}

contract Auction is Ownable, ReentrancyGuard {
    struct AuctionDetails {
        uint256 auctionId;
        address seller;
        uint256 tokenId;
        uint256 startingBid;
        uint256 currentBid;
        address currentBidder;
        uint256 auctionEndTime;
        bool ended;
        bool isRental;
        uint256 rentalDuration; // For rental auctions (in days)
    }

    uint256 private _auctionIds;
    uint256 public auctionDuration = 7 days; // Default auction duration
    uint256 public bidIncrement = 0.01 ether; // Minimum bid increment
    uint256 public feePercent = 2; // 2% marketplace fee
    address payable public feeAccount;

    // *** SỬA: Chỉ dùng một biến thay vì hai ***
    IERC4907 public nftContract; // IERC4907 đã kế thừa IERC721

    mapping(uint256 => AuctionDetails) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bids;

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 startingBid,
        uint256 auctionEndTime,
        bool isRental
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 bidAmount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    event AuctionCancelled(uint256 indexed auctionId);

    constructor(
        address _nftContract,
        address payable _feeAccount
    ) Ownable(msg.sender) {
        nftContract = IERC4907(_nftContract);
        feeAccount = _feeAccount;
    }

    modifier auctionExists(uint256 _auctionId) {
        require(auctions[_auctionId].auctionId != 0, "Auction does not exist");
        _;
    }

    modifier onlySellerOf(uint256 _auctionId) {
        require(
            auctions[_auctionId].seller == msg.sender,
            "Only seller can call this"
        );
        _;
    }

    // *** SỬA: Create sale auction (Approval Model) ***
    function createSaleAuction(
        uint256 _tokenId,
        uint256 _startingBid,
        uint256 _duration
    ) external {
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "You must own the NFT"
        );
        require(
            nftContract.getApproved(_tokenId) == address(this) ||
                nftContract.isApprovedForAll(msg.sender, address(this)),
            "Contract must be approved to transfer NFT"
        );
        require(_startingBid > 0, "Starting bid must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        // *** THÊM: Kiểm tra NFT không đang được thuê ***
        require(
            nftContract.userExpires(_tokenId) <= block.timestamp,
            "Cannot auction an actively rented NFT"
        );

        _auctionIds++;
        uint256 auctionId = _auctionIds;
        uint256 endTime = block.timestamp + _duration;

        // *** BỎ: Không chuyển NFT vào contract (Approval Model) ***
        // nftContract.transferFrom(msg.sender, address(this), _tokenId);

        auctions[auctionId] = AuctionDetails({
            auctionId: auctionId,
            seller: msg.sender,
            tokenId: _tokenId,
            startingBid: _startingBid,
            currentBid: 0,
            currentBidder: address(0),
            auctionEndTime: endTime,
            ended: false,
            isRental: false,
            rentalDuration: 0
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            _tokenId,
            _startingBid,
            endTime,
            false
        );
    }

    // *** SỬA: Create rental auction ***
    function createRentalAuction(
        uint256 _tokenId,
        uint256 _startingBid,
        uint256 _auctionDuration,
        uint256 _rentalDays
    ) external {
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "You must own the NFT"
        );
        // *** THÊM: Kiểm tra approval cần thiết cho setUser ***
        require(
            nftContract.getApproved(_tokenId) == address(this) ||
                nftContract.isApprovedForAll(msg.sender, address(this)),
            "Contract must be approved to set user"
        );
        require(_startingBid > 0, "Starting bid must be greater than 0");
        require(_auctionDuration > 0, "Duration must be greater than 0");
        require(_rentalDays > 0, "Rental days must be greater than 0");
        require(_rentalDays <= 365, "Rental period too long");

        _auctionIds++;
        uint256 auctionId = _auctionIds;
        uint256 endTime = block.timestamp + _auctionDuration;

        // For rental auction, NFT stays with owner
        auctions[auctionId] = AuctionDetails({
            auctionId: auctionId,
            seller: msg.sender,
            tokenId: _tokenId,
            startingBid: _startingBid,
            currentBid: 0,
            currentBidder: address(0),
            auctionEndTime: endTime,
            ended: false,
            isRental: true,
            rentalDuration: _rentalDays
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            _tokenId,
            _startingBid,
            endTime,
            true
        );
    }

    function placeBid(
        uint256 _auctionId
    ) external payable auctionExists(_auctionId) nonReentrant {
        AuctionDetails storage auction = auctions[_auctionId];

        require(!auction.ended, "Auction has ended");
        require(
            block.timestamp < auction.auctionEndTime,
            "Auction time has passed"
        );
        require(msg.sender != auction.seller, "Seller cannot bid");

        uint256 minBid = auction.currentBid == 0
            ? auction.startingBid
            : auction.currentBid + bidIncrement;

        require(msg.value >= minBid, "Bid too low");

        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            bids[_auctionId][auction.currentBidder] += auction.currentBid;
        }

        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;

        emit BidPlaced(_auctionId, msg.sender, msg.value);

        // Auto-extend auction if bid placed in last 10 minutes
        if (auction.auctionEndTime - block.timestamp < 10 minutes) {
            auction.auctionEndTime = block.timestamp + 10 minutes;
        }
    }

    function endAuction(
        uint256 _auctionId
    ) external auctionExists(_auctionId) nonReentrant {
        AuctionDetails storage auction = auctions[_auctionId];

        require(!auction.ended, "Auction already ended");
        require(
            block.timestamp >= auction.auctionEndTime,
            "Auction still active"
        );

        auction.ended = true;

        if (auction.currentBidder != address(0)) {
            uint256 fee = (auction.currentBid * feePercent) / 100;
            uint256 sellerProceeds = auction.currentBid - fee;

            // Send payment to seller
            (bool sentSeller, ) = payable(auction.seller).call{
                value: sellerProceeds
            }("");
            require(sentSeller, "Failed to send payment to seller");

            // Send fee to marketplace
            (bool sentFee, ) = payable(feeAccount).call{value: fee}("");
            require(sentFee, "Failed to send fee to marketplace");

            if (auction.isRental) {
                // Set rental user for ERC4907
                uint64 expires = uint64(
                    block.timestamp + (auction.rentalDuration * 1 days)
                );
                nftContract.setUser(
                    auction.tokenId,
                    auction.currentBidder,
                    expires
                );
            } else {
                // *** SỬA: Approval Model - NFT transfer trực tiếp từ owner ***
                nftContract.transferFrom(
                    auction.seller,
                    auction.currentBidder,
                    auction.tokenId
                );
            }

            emit AuctionEnded(
                _auctionId,
                auction.currentBidder,
                auction.currentBid
            );
        } else {
            // *** SỬA: Approval Model - NFT luôn ở với seller, không cần return ***
            // No bids received
            emit AuctionEnded(_auctionId, address(0), 0);
        }
    }

    function cancelAuction(
        uint256 _auctionId
    ) external auctionExists(_auctionId) onlySellerOf(_auctionId) {
        AuctionDetails storage auction = auctions[_auctionId];

        require(!auction.ended, "Auction already ended");
        require(
            auction.currentBidder == address(0),
            "Cannot cancel auction with bids"
        );

        auction.ended = true;

        // *** SỬA: Approval Model - NFT luôn ở với seller, không cần return ***
        // NFT stays with seller, no transfer needed

        emit AuctionCancelled(_auctionId);
    }

    function withdrawBid(uint256 _auctionId) external nonReentrant {
        uint256 bidAmount = bids[_auctionId][msg.sender];
        require(bidAmount > 0, "No bid to withdraw");

        bids[_auctionId][msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: bidAmount}("");
        require(sent, "Failed to withdraw bid");
    }

    // View functions
    function getAuction(
        uint256 _auctionId
    ) external view returns (AuctionDetails memory) {
        return auctions[_auctionId];
    }

    function getBidAmount(
        uint256 _auctionId,
        address _bidder
    ) external view returns (uint256) {
        return bids[_auctionId][_bidder];
    }

    function getAuctionCount() external view returns (uint256) {
        return _auctionIds;
    }

    // Admin functions
    function setAuctionDuration(uint256 _duration) external onlyOwner {
        auctionDuration = _duration;
    }

    function setBidIncrement(uint256 _increment) external onlyOwner {
        bidIncrement = _increment;
    }

    function setFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 10, "Fee cannot exceed 10%");
        feePercent = _feePercent;
    }

    function setFeeAccount(address payable _feeAccount) external onlyOwner {
        feeAccount = _feeAccount;
    }
}
