// contracts/ViePropChainNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";

contract ViePropChainNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("ViePropChain", "VPC") Ownable(msg.sender) {}

    // Hàm mint giữ nguyên
    function mint(
        address recipient,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        tokenCounter++;
        _mint(recipient, tokenCounter);
        _setTokenURI(tokenCounter, tokenURI);
        return tokenCounter;
    }

    // Các hàm override này là CHÍNH XÁC, giữ nguyên
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable) // Chỗ này giữ nguyên ERC721
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable) // Chỗ này giữ nguyên ERC721
    {
        super._increaseBalance(account, amount);
    }

    // === SỬA LỖI Ở ĐÂY ===
    // Sửa override list
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage) // SỬA Ở ĐÂY
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Thêm hàm mới để sửa lỗi 'tokenURI'
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage) // THÊM HÀM NÀY
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}