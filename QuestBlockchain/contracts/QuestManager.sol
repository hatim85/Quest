// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@erc725/smart-contracts/contracts/ERC725Y.sol";
import "hardhat/console.sol";
error IN_CATCH();

interface IERC721 {
    function mint(address to) external returns (uint256);
}

// interface IERC725Y {
//     function setData(bytes32 dataKey, bytes calldata dataValue) external;
// }

contract QuestManager is ERC725Y {
    struct Quest {
        string title;
        string questType;
        uint256 xpReward;
        bool isActive;
        bool givesNFT;
    }

    ERC725Y public eRC725Y;
    address public admin;
    IERC721 public rewardNFTContract;
    // IERC725Y public universalProfile;
    uint256 public questCount;

    mapping(uint256 => Quest) public quests;
    mapping(address => mapping(uint256 => bool)) public completed;
    mapping(address => uint256) public xp;

    event QuestCreated(uint256 questId, string title, uint256 xp);
    event QuestCompleted(address indexed player, uint256 questId, uint256 xpEarned);
    event XPUpdated(address indexed player, uint256 newXP);
    event LevelUp(address indexed player, uint256 newLevel);
    event MetadataUpdated(address indexed player, uint256 level, uint256 xp);
    event AdminChanged(address oldAdmin, address newAdmin);
    event NFTRewarded(address indexed player, uint256 questId, uint256 tokenId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _rewardNFTContract, address _universalProfile) ERC725Y(_universalProfile){
        admin = _universalProfile;
        rewardNFTContract = IERC721(_rewardNFTContract);

        // universalProfile = IERC725Y(_universalProfile);
    }

    function createQuest(
        string memory _title,
        string memory _type,
        uint256 _xp,
        bool _givesNFT
    ) external onlyAdmin {
        require(_xp > 0, "XP reward must be positive");
        quests[questCount] = Quest(
            _title,
            _type,
            _xp,
            true,
            _givesNFT
        );
        emit QuestCreated(questCount, _title, _xp);
        questCount++;
    }

    function completeQuest(uint256 _questId) external {
        require(_questId < questCount, "Invalid quest ID");
        Quest memory q = quests[_questId];
        require(q.isActive, "Quest inactive");
        require(!completed[msg.sender][_questId], "Already completed");

        uint256 oldLevel = getLevel(msg.sender);
        completed[msg.sender][_questId] = true;
        xp[msg.sender] += q.xpReward;
        uint256 newLevel = getLevel(msg.sender);

        emit QuestCompleted(msg.sender, _questId, q.xpReward);
        emit XPUpdated(msg.sender, xp[msg.sender]);

        if (newLevel > oldLevel) {
            emit LevelUp(msg.sender, newLevel);
        }

        updateUPMetadata(msg.sender, newLevel, xp[msg.sender]);

        if (q.givesNFT) {
            try rewardNFTContract.mint(msg.sender) returns (uint256 tokenId) {
                console.log("NFT minted successfully, tokenId:", tokenId);
                emit NFTRewarded(msg.sender, _questId, tokenId);
            } catch Error(string memory reason) {
                console.log("Error in minting NFT (reason):", reason);
            } catch (bytes memory) {
                console.log("Error in minting NFT (low level)");
            }
        }
    }

  function updateUPMetadata(
    address player,
    uint256 level,
    uint256 _xp
) internal {
    bytes32 dataKey = keccak256(
        abi.encodePacked("GridQuestMetadata", player)
    );
    bytes memory dataValue = abi.encode(level, _xp);

    _setData(dataKey, dataValue);
    emit MetadataUpdated(player, level, _xp);
}


    function getXP(address player) external view returns (uint256) {
        return xp[player];
    }

    function getLevel(address player) public view returns (uint256) {
        uint256 playerXP = xp[player];
        if (playerXP >= 500) return 4;
        if (playerXP >= 250) return 3;
        if (playerXP >= 100) return 2;
        return 1;
    }

    function hasCompleted(
        address player,
        uint256 questId
    ) external view returns (bool) {
        return completed[player][questId];
    }

    function setNFTContract(address _newContract) external onlyAdmin {
        rewardNFTContract = IERC721(_newContract);
    }

    // function setUniversalProfile(address _newUP) external onlyAdmin {
    //     universalProfile = IERC725Y(_newUP);
    // }

    function changeAdmin(address _newAdmin) external onlyAdmin {
        emit AdminChanged(admin, _newAdmin);
        admin = _newAdmin;
    }

    //    function setdata(bytes32 dataKey,
    //     bytes memory dataValue) internal {
    //         setData(dataKey, dataValue);
    //     }
}