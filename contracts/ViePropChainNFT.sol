// contracts/ViePropChainNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IERC4907.sol";

/**
 * @title ViePropChainNFT - Custodial Wallet với Locking Mechanism
 * @notice Contract này hỗ trợ:
 *  - Mint Custodial: Mint NFT vào ví Admin và tự động KHÓA
 *  - Locking: NFT bị khóa không thể transfer (trừ khi Claim)
 *  - Claim: User rút NFT về ví riêng (mở khóa + chuyển giao trong 1 tx)
 *  - Rental: Tích hợp IERC4907 cho thuê NFT
 */
contract ViePropChainNFT is ERC721URIStorage, AccessControl, IERC4907 {
    uint256 private _tokenIdCounter;

    // Định nghĩa quyền Admin
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Mapping để khóa NFT (TokenID => IsLocked)
    // Nếu true: NFT này đang bị khóa, không được chuyển đi (trừ khi Claim)
    mapping(uint256 => bool) public isLocked;

    // Mapping to check if a tokenURI already exists
    mapping(string => bool) private _tokenURIExists;
    mapping(string => uint256) private _tokenURIToTokenId;

    // ERC4907: Rental mapping
    struct UserInfo {
        address user; // address of user role
        uint64 expires; // unix timestamp, user expires
    }
    mapping(uint256 => UserInfo) internal _users;

    // Sự kiện để Backend nghe và cập nhật DB
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string tokenURI
    );
    event NFTMintedCustodial(
        uint256 indexed tokenId,
        address indexed adminWallet,
        string tokenURI,
        bool locked
    );
    event NFTClaimed(
        uint256 indexed tokenId,
        address indexed adminWallet,
        address indexed userWallet
    );

    constructor() ERC721("ViePropChain", "VPC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _tokenIdCounter = 0;
    }

    // --- 1. MINT CUSTODIAL (Dùng cho Admin Mint giữ hộ) ---
    /**
     * @notice Mint NFT vào ví Admin và TỰ ĐỘNG KHÓA NGAY
     * @dev Hàm này được gọi khi user CHƯA link ví
     * @param adminWallet Địa chỉ ví Admin (ví tổng giữ hộ)
     * @param uri Metadata URI (ipfs://...)
     * @return tokenId Token ID vừa mint
     */
    function mintCustodial(
        address adminWallet,
        string memory uri
    ) public onlyRole(OPERATOR_ROLE) returns (uint256) {
        // Check if tokenURI already exists
        require(!_tokenURIExists[uri], "NFT with this metadata already exists");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(adminWallet, tokenId);
        _setTokenURI(tokenId, uri);

        // Mark tokenURI as used
        _tokenURIExists[uri] = true;
        _tokenURIToTokenId[uri] = tokenId;

        // Khóa ngay lập tức để Admin không thể chuyển đi lung tung
        isLocked[tokenId] = true;

        emit NFTMintedCustodial(tokenId, adminWallet, uri, true);
        emit Locked(tokenId);

        return tokenId;
    }

    // --- 2. MINT NORMAL (Dùng khi User ĐÃ có ví riêng) ---
    /**
     * @notice Mint NFT trực tiếp vào ví User (KHÔNG khóa)
     * @dev Hàm này được gọi khi user ĐÃ link ví
     * @param recipient Địa chỉ ví user
     * @param uri Metadata URI
     * @return tokenId Token ID vừa mint
     */
    function mint(
        address recipient,
        string memory uri
    ) public onlyRole(OPERATOR_ROLE) returns (uint256) {
        require(!_tokenURIExists[uri], "NFT with this metadata already exists");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);

        _tokenURIExists[uri] = true;
        _tokenURIToTokenId[uri] = tokenId;

        // KHÔNG khóa vì user tự quản lý
        emit NFTMinted(tokenId, recipient, uri);

        return tokenId;
    }

    // --- 3. CLAIM (Dùng khi User muốn rút về ví riêng) ---
    /**
     * @notice Mở khóa và chuyển NFT từ ví Admin sang ví User
     * @dev Chỉ OPERATOR_ROLE (Backend) mới gọi được
     * @param adminWallet Địa chỉ ví Admin hiện đang giữ NFT
     * @param userWallet Địa chỉ ví User muốn nhận NFT
     * @param tokenId Token ID cần claim
     */
    function claimNFT(
        address adminWallet,
        address userWallet,
        uint256 tokenId
    ) public onlyRole(OPERATOR_ROLE) {
        require(
            ownerOf(tokenId) == adminWallet,
            "Admin must own the token to claim"
        );
        require(isLocked[tokenId], "Token is not locked/custodial");

        // Mở khóa
        isLocked[tokenId] = false;
        emit Unlocked(tokenId);

        // Chuyển sang ví User (dùng _transfer internal để bypass check khóa)
        _transfer(adminWallet, userWallet, tokenId);

        emit NFTClaimed(tokenId, adminWallet, userWallet);
    }

    // --- 4. CHẶN CHUYỂN NHƯỢNG NẾU ĐANG KHÓA ---
    /**
     * @notice Override _update để kiểm tra khóa trước khi transfer
     * @dev Nếu NFT đang khóa, CHẶN transfer (trừ khi từ claimNFT)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Chỉ kiểm tra khóa nếu KHÔNG phải mint (from != address(0))
        // Và KHÔNG phải burn (to != address(0))
        if (from != address(0) && to != address(0)) {
            require(
                !isLocked[tokenId],
                "ViePropChain: This NFT is locked by System (Custodial Mode)"
            );
        }

        return super._update(to, tokenId, auth);
    }

    // --- 5. ERC4907 RENTAL FUNCTIONS ---

    /**
     * @notice Set user and expiration date for rental
     */
    function setUser(
        uint256 tokenId,
        address user,
        uint64 expires
    ) public virtual override {
        require(
            _isAuthorized(ownerOf(tokenId), msg.sender, tokenId),
            "ERC4907: caller is not owner nor approved"
        );
        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
    }

    /**
     * @notice Get user address for rental
     */
    function userOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        if (uint256(_users[tokenId].expires) >= block.timestamp) {
            return _users[tokenId].user;
        } else {
            return address(0);
        }
    }

    /**
     * @notice Get expiration timestamp for rental
     */
    function userExpires(
        uint256 tokenId
    ) public view virtual override returns (uint256) {
        return _users[tokenId].expires;
    }

    // --- 6. HELPER FUNCTIONS ---

    /**
     * @notice Kiểm tra tokenURI đã tồn tại chưa
     */
    function tokenURIExists(string memory uri) public view returns (bool) {
        return _tokenURIExists[uri];
    }

    /**
     * @notice Lấy tokenId từ URI
     */
    function getTokenIdByURI(string memory uri) public view returns (uint256) {
        require(_tokenURIExists[uri], "TokenURI does not exist");
        return _tokenURIToTokenId[uri];
    }

    /**
     * @notice Lấy tổng số NFT đã mint
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // --- 7. INTERFACE SUPPORT ---

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return
            interfaceId == type(IERC4907).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
