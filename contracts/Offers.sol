// contracts/Offers.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Offers
 * @dev A contract that allows users to make, cancel, and accept offers for NFTs.
 * The contract takes a fee for each successful transaction.
 */
contract Offers is Ownable, ReentrancyGuard {
    // Địa chỉ của contract NFT chính (ViePropChainNFT)
    IERC721 public nftContract;

    // Địa chỉ ví nhận phí giao dịch
    address payable public feeAddress;

    // Tỉ lệ phí (ví dụ: 250 tương đương 2.5%)
    uint256 public feePercent;

    // Struct để lưu thông tin một lời đề nghị (offer)
    struct Offer {
        address buyer;
        uint256 price;
    }

    // Mapping từ a token ID tới danh sách các lời đề nghị cho token đó
    // mapping(uint256 => Offer[]) public offersByToken;

    // Mapping từ token ID -> địa chỉ người mua -> giá đề nghị
    // Cách này đơn giản hơn để quản lý việc chấp nhận/hủy offer
    mapping(uint256 => mapping(address => uint256)) public offers;

    // Events
    event OfferMade(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );
    event OfferCancelled(uint256 indexed tokenId, address indexed buyer);
    event OfferAccepted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    constructor(address _nftContractAddress) Ownable(msg.sender) {
        nftContract = IERC721(_nftContractAddress);
        feeAddress = payable(msg.sender); // Mặc định phí chuyển về cho người deploy
        feePercent = 250; // Mặc định phí là 2.5% (250 / 10000)
    }

    /**
     * @dev Đặt một lời đề nghị cho một NFT. Người mua phải gửi kèm ETH.
     */
    function makeOffer(uint256 tokenId) external payable nonReentrant {
        require(msg.value > 0, "Offer price must be greater than 0");

        // Nếu người này đã có offer trước đó, hoàn trả lại tiền cũ
        if (offers[tokenId][msg.sender] > 0) {
            payable(msg.sender).transfer(offers[tokenId][msg.sender]);
        }

        offers[tokenId][msg.sender] = msg.value;
        emit OfferMade(tokenId, msg.sender, msg.value);
    }

    /**
     * @dev Hủy một lời đề nghị và nhận lại tiền.
     */
    function cancelOffer(uint256 tokenId) external nonReentrant {
        uint256 price = offers[tokenId][msg.sender];
        require(price > 0, "You do not have an active offer for this token");

        delete offers[tokenId][msg.sender];
        payable(msg.sender).transfer(price);

        emit OfferCancelled(tokenId, msg.sender);
    }

    /**
     * @dev Người chủ NFT chấp nhận một lời đề nghị.
     * Cần `approve` contract này trước khi gọi.
     */
    function acceptOffer(uint256 tokenId, address buyer) external nonReentrant {
        address owner = nftContract.ownerOf(tokenId);
        uint256 price = offers[tokenId][buyer];

        require(owner == msg.sender, "You are not the owner of this NFT");
        require(price > 0, "This offer is not active");
        require(
            nftContract.getApproved(tokenId) == address(this),
            "Contract is not approved to transfer this NFT"
        );

        // Xóa offer để tránh tái sử dụng
        delete offers[tokenId][buyer];

        // Tính toán phí
        uint256 fee = (price * feePercent) / 10000;
        uint256 sellerProceeds = price - fee;

        // Chuyển tiền
        if (fee > 0) {
            feeAddress.transfer(fee);
        }
        payable(msg.sender).transfer(sellerProceeds);

        // Chuyển NFT cho người mua
        nftContract.transferFrom(msg.sender, buyer, tokenId);

        emit OfferAccepted(tokenId, msg.sender, buyer, price);
    }

    // --- Admin Functions ---

    /**
     * @dev Cập nhật địa chỉ ví nhận phí.
     */
    function setFeeAddress(address payable _feeAddress) external onlyOwner {
        require(_feeAddress != address(0), "Invalid address");
        feeAddress = _feeAddress;
    }

    /**
     * @dev Cập nhật tỉ lệ phí.
     */
    function setFeePercent(uint256 _feePercent) external onlyOwner {
        // Giới hạn phí tối đa 10% để an toàn
        require(_feePercent <= 1000, "Fee percent cannot exceed 10%");
        feePercent = _feePercent;
    }
}
