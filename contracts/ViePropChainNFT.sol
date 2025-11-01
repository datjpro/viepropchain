// contracts/ViePropChainNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";

contract ViePropChainNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("ViePropChain", "VPC") Ownable(msg.sender) {}

    function mint(
        address recipient,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        tokenCounter++;
        _mint(recipient, tokenCounter);
        _setTokenURI(tokenCounter, tokenURI);
        return tokenCounter;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable) 
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage) 
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}