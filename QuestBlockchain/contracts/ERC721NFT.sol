// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721NFT is ERC721, Ownable {
    address public questManager;
    uint256 private _tokenIdCounter;

    constructor(
        string memory name,
        string memory symbol
        // address add
    ) ERC721(name, symbol) Ownable() {
        questManager = msg.sender;
        _tokenIdCounter = 0;
    }

    modifier onlyQuestManager() {
        require(msg.sender == questManager, "Not authorized");
        _;
    }

    function setQuestManager(address _questManager) external onlyOwner {
        questManager = _questManager;
    }

    function mint(address to) external onlyQuestManager returns (uint256) {
        _tokenIdCounter++;
        _safeMint(to, _tokenIdCounter);
        return _tokenIdCounter;
    }
}