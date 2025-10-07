pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("RedBookLand", "REDLAND") {}

    function mintNFT(
        address recipient,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        tokenCounter++;
        _mint(recipient, tokenCounter);
        _setTokenURI(tokenCounter, tokenURI);
        return tokenCounter;
    }
}
