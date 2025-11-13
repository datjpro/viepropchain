// contracts/ViePropChainNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC4907.sol";

// THÊM ERC4907 vào danh sách kế thừa
contract ViePropChainNFT is
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    ERC4907
{
    uint256 public tokenCounter;

    // Mapping to check if a tokenURI already exists
    mapping(string => bool) private _tokenURIExists;
    mapping(string => uint256) private _tokenURIToTokenId;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string tokenURI
    );
    event DuplicateMintAttempted(string tokenURI, uint256 existingTokenId);

    constructor() ERC721("ViePropChain", "VPC") Ownable(msg.sender) {}

    function mint(
        address recipient,
        string memory _tokenURI
    ) public onlyOwner returns (uint256) {
        // Check if tokenURI already exists
        require(
            !_tokenURIExists[_tokenURI],
            "NFT with this metadata already exists"
        );

        tokenCounter++;
        _mint(recipient, tokenCounter);
        _setTokenURI(tokenCounter, _tokenURI);

        // Mark tokenURI as used
        _tokenURIExists[_tokenURI] = true;
        _tokenURIToTokenId[_tokenURI] = tokenCounter;

        emit NFTMinted(tokenCounter, recipient, _tokenURI);
        return tokenCounter;
    }

    // Function to check if a tokenURI already exists
    function tokenURIExists(
        string memory _tokenURI
    ) public view returns (bool) {
        return _tokenURIExists[_tokenURI];
    }

    // Function to get tokenId by tokenURI
    function getTokenIdByURI(
        string memory _tokenURI
    ) public view returns (uint256) {
        require(_tokenURIExists[_tokenURI], "TokenURI does not exist");
        return _tokenURIToTokenId[_tokenURI];
    }

    // --- CẬP NHẬT GHI ĐÈ (OVERRIDE) ---

    // Thêm ERC4907 vào danh sách ghi đè
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable, ERC4907) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal override(ERC721, ERC721Enumerable) {
        // ERC4907 không ghi đè hàm này, nên giữ nguyên
        super._increaseBalance(account, amount);
    }

    // Thêm ERC4907 vào danh sách ghi đè
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Enumerable, ERC721URIStorage, ERC4907)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        // ERC4907 không ghi đè hàm này, nên giữ nguyên
        return super.tokenURI(tokenId);
    }
}
