// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Removed Counters import - using simple uint256 counter instead
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title XPBadges
 * @dev ERC721 NFT contract for SquadWallet achievement badges
 * @notice Manages XP tracking and badge minting for user achievements
 */
contract XPBadges is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Events
    event XPAwarded(address indexed user, uint256 amount, string reason);
    event BadgeMinted(address indexed user, uint256 indexed tokenId, BadgeType badgeType, uint256 level);
    event AgentAuthorized(address indexed agent, bool authorized);

    // Badge types
    enum BadgeType {
        NEWCOMER,      // First wallet creation
        DEPOSITOR,     // Deposit milestones
        GAMER,         // Game participation
        WINNER,        // Game victories
        VOTER,         // Proposal voting
        LEADER,        // Leadership activities
        WHALE,         // Large deposits
        STREAK,        // Activity streaks
        COLLECTOR,     // Badge collection
        LEGEND         // Ultimate achievement
    }

    // Badge level thresholds
    struct BadgeLevel {
        uint256 xpRequired;
        string name;
        string description;
        string imageHash;
    }

    // User data
    struct UserData {
        uint256 totalXP;
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 totalDeposited;
        uint256 proposalsVoted;
        uint256 walletsCreated;
        uint256 lastActivityTimestamp;
        uint256 streakDays;
        mapping(BadgeType => uint256) badgeLevels;
        mapping(BadgeType => bool) hasBadge;
    }

    // State variables
    uint256 private _tokenIdCounter;
    mapping(address => UserData) public userData;
    mapping(address => bool) public authorizedAgents;
    mapping(BadgeType => mapping(uint256 => BadgeLevel)) public badgeLevels;
    mapping(uint256 => BadgeType) public tokenBadgeType;
    mapping(uint256 => uint256) public tokenBadgeLevel;

    // Constants
    uint256 public constant DAILY_STREAK_XP = 25;
    uint256 public constant MAX_STREAK_DAYS = 365;

    /**
     * @dev Constructor
     */
    constructor() ERC721("SquadWallet XP Badges", "SQXP") Ownable(msg.sender) {
        _initializeBadgeLevels();
    }

    /**
     * @dev Initialize badge level requirements and metadata
     */
    function _initializeBadgeLevels() internal {
        // NEWCOMER badges
        badgeLevels[BadgeType.NEWCOMER][1] = BadgeLevel(0, "First Steps", "Created your first SquadWallet", "QmNewcomer1");
        
        // DEPOSITOR badges
        badgeLevels[BadgeType.DEPOSITOR][1] = BadgeLevel(100, "Penny Saver", "Made your first deposit", "QmDepositor1");
        badgeLevels[BadgeType.DEPOSITOR][2] = BadgeLevel(500, "Coin Collector", "Deposited 0.1 ETH total", "QmDepositor2");
        badgeLevels[BadgeType.DEPOSITOR][3] = BadgeLevel(1000, "Vault Builder", "Deposited 1 ETH total", "QmDepositor3");
        
        // GAMER badges
        badgeLevels[BadgeType.GAMER][1] = BadgeLevel(50, "Dice Roller", "Played your first game", "QmGamer1");
        badgeLevels[BadgeType.GAMER][2] = BadgeLevel(250, "Game Enthusiast", "Played 10 games", "QmGamer2");
        badgeLevels[BadgeType.GAMER][3] = BadgeLevel(500, "Gaming Legend", "Played 50 games", "QmGamer3");
        
        // WINNER badges
        badgeLevels[BadgeType.WINNER][1] = BadgeLevel(150, "Lucky Strike", "Won your first game", "QmWinner1");
        badgeLevels[BadgeType.WINNER][2] = BadgeLevel(400, "Victory Seeker", "Won 5 games", "QmWinner2");
        badgeLevels[BadgeType.WINNER][3] = BadgeLevel(800, "Champion", "Won 20 games", "QmWinner3");
        
        // VOTER badges
        badgeLevels[BadgeType.VOTER][1] = BadgeLevel(75, "Voice Heard", "Voted on your first proposal", "QmVoter1");
        badgeLevels[BadgeType.VOTER][2] = BadgeLevel(300, "Democratic Spirit", "Voted on 10 proposals", "QmVoter2");
        badgeLevels[BadgeType.VOTER][3] = BadgeLevel(600, "Governance Master", "Voted on 50 proposals", "QmVoter3");
        
        // WHALE badges
        badgeLevels[BadgeType.WHALE][1] = BadgeLevel(2000, "Big Spender", "Deposited 10 ETH total", "QmWhale1");
        badgeLevels[BadgeType.WHALE][2] = BadgeLevel(5000, "Whale Alert", "Deposited 50 ETH total", "QmWhale2");
        badgeLevels[BadgeType.WHALE][3] = BadgeLevel(10000, "Leviathan", "Deposited 100 ETH total", "QmWhale3");
        
        // STREAK badges
        badgeLevels[BadgeType.STREAK][1] = BadgeLevel(175, "Consistent", "7-day activity streak", "QmStreak1");
        badgeLevels[BadgeType.STREAK][2] = BadgeLevel(750, "Dedicated", "30-day activity streak", "QmStreak2");
        badgeLevels[BadgeType.STREAK][3] = BadgeLevel(2750, "Unstoppable", "100-day activity streak", "QmStreak3");
        
        // COLLECTOR badges
        badgeLevels[BadgeType.COLLECTOR][1] = BadgeLevel(1000, "Badge Hunter", "Collected 5 different badges", "QmCollector1");
        badgeLevels[BadgeType.COLLECTOR][2] = BadgeLevel(3000, "Achievement Seeker", "Collected 10 different badges", "QmCollector2");
        badgeLevels[BadgeType.COLLECTOR][3] = BadgeLevel(7500, "Master Collector", "Collected all badge types", "QmCollector3");
        
        // LEGEND badge
        badgeLevels[BadgeType.LEGEND][1] = BadgeLevel(15000, "SquadWallet Legend", "Achieved legendary status", "QmLegend1");
    }

    /**
     * @dev Authorize an agent to award XP
     * @param agent Address of the agent
     * @param authorized Whether the agent is authorized
     */
    function setAgentAuthorization(address agent, bool authorized) external onlyOwner {
        authorizedAgents[agent] = authorized;
        emit AgentAuthorized(agent, authorized);
    }

    /**
     * @dev Award XP to a user (only authorized agents)
     * @param user Address of the user
     * @param amount Amount of XP to award
     * @param reason Reason for awarding XP
     */
    function awardXP(address user, uint256 amount, string memory reason) external {
        require(authorizedAgents[msg.sender] || msg.sender == owner(), "Not authorized");
        
        userData[user].totalXP += amount;
        _updateActivity(user);
        
        emit XPAwarded(user, amount, reason);
        
        // Check for badge eligibility
        _checkBadgeEligibility(user);
    }

    /**
     * @dev Update user activity and streak
     * @param user Address of the user
     */
    function _updateActivity(address user) internal {
        UserData storage data = userData[user];
        uint256 currentDay = block.timestamp / 86400; // Current day number
        uint256 lastActivityDay = data.lastActivityTimestamp / 86400;
        
        if (currentDay == lastActivityDay + 1) {
            // Consecutive day
            data.streakDays++;
            if (data.streakDays <= MAX_STREAK_DAYS) {
                data.totalXP += DAILY_STREAK_XP;
            }
        } else if (currentDay > lastActivityDay + 1) {
            // Streak broken
            data.streakDays = 1;
        }
        // If same day, don't change streak
        
        data.lastActivityTimestamp = block.timestamp;
    }

    /**
     * @dev Record game activity
     * @param user Address of the user
     * @param won Whether the user won the game
     */
    function recordGameActivity(address user, bool won) external {
        require(authorizedAgents[msg.sender] || msg.sender == owner(), "Not authorized");
        
        UserData storage data = userData[user];
        data.gamesPlayed++;
        if (won) {
            data.gamesWon++;
        }
        
        _updateActivity(user);
        _checkBadgeEligibility(user);
    }

    /**
     * @dev Record deposit activity
     * @param user Address of the user
     * @param amount Amount deposited (in wei)
     */
    function recordDeposit(address user, uint256 amount) external {
        require(authorizedAgents[msg.sender] || msg.sender == owner(), "Not authorized");
        
        UserData storage data = userData[user];
        data.totalDeposited += amount;
        
        _updateActivity(user);
        _checkBadgeEligibility(user);
    }

    /**
     * @dev Record voting activity
     * @param user Address of the user
     */
    function recordVote(address user) external {
        require(authorizedAgents[msg.sender] || msg.sender == owner(), "Not authorized");
        
        UserData storage data = userData[user];
        data.proposalsVoted++;
        
        _updateActivity(user);
        _checkBadgeEligibility(user);
    }

    /**
     * @dev Record wallet creation
     * @param user Address of the user
     */
    function recordWalletCreation(address user) external {
        require(authorizedAgents[msg.sender] || msg.sender == owner(), "Not authorized");
        
        UserData storage data = userData[user];
        data.walletsCreated++;
        
        _updateActivity(user);
        _checkBadgeEligibility(user);
    }

    /**
     * @dev Check badge eligibility and mint if qualified
     * @param user Address of the user
     */
    function _checkBadgeEligibility(address user) internal {
        UserData storage data = userData[user];
        
        // Check each badge type
        _checkSpecificBadge(user, BadgeType.NEWCOMER);
        _checkSpecificBadge(user, BadgeType.DEPOSITOR);
        _checkSpecificBadge(user, BadgeType.GAMER);
        _checkSpecificBadge(user, BadgeType.WINNER);
        _checkSpecificBadge(user, BadgeType.VOTER);
        _checkSpecificBadge(user, BadgeType.WHALE);
        _checkSpecificBadge(user, BadgeType.STREAK);
        _checkSpecificBadge(user, BadgeType.COLLECTOR);
        _checkSpecificBadge(user, BadgeType.LEGEND);
    }

    /**
     * @dev Check eligibility for a specific badge type
     * @param user Address of the user
     * @param badgeType Type of badge to check
     */
    function _checkSpecificBadge(address user, BadgeType badgeType) internal {
        UserData storage data = userData[user];
        uint256 currentLevel = data.badgeLevels[badgeType];
        uint256 nextLevel = currentLevel + 1;
        
        // Check if next level exists and user meets requirements
        if (_meetsRequirements(user, badgeType, nextLevel)) {
            _mintBadge(user, badgeType, nextLevel);
        }
    }

    /**
     * @dev Check if user meets requirements for a specific badge level
     * @param user Address of the user
     * @param badgeType Type of badge
     * @param level Level to check
     */
    function _meetsRequirements(address user, BadgeType badgeType, uint256 level) internal view returns (bool) {
        UserData storage data = userData[user];
        BadgeLevel memory requirement = badgeLevels[badgeType][level];
        
        if (requirement.xpRequired == 0 && level > 1) return false; // Level doesn't exist
        
        // Check XP requirement
        if (data.totalXP < requirement.xpRequired) return false;
        
        // Check specific requirements based on badge type
        if (badgeType == BadgeType.NEWCOMER) {
            return data.walletsCreated >= 1;
        } else if (badgeType == BadgeType.DEPOSITOR) {
            return data.totalDeposited >= _getDepositRequirement(level);
        } else if (badgeType == BadgeType.GAMER) {
            return data.gamesPlayed >= _getGameRequirement(level);
        } else if (badgeType == BadgeType.WINNER) {
            return data.gamesWon >= _getWinRequirement(level);
        } else if (badgeType == BadgeType.VOTER) {
            return data.proposalsVoted >= _getVoteRequirement(level);
        } else if (badgeType == BadgeType.WHALE) {
            return data.totalDeposited >= _getWhaleRequirement(level);
        } else if (badgeType == BadgeType.STREAK) {
            return data.streakDays >= _getStreakRequirement(level);
        } else if (badgeType == BadgeType.COLLECTOR) {
            return _getBadgeCount(user) >= _getCollectorRequirement(level);
        } else if (badgeType == BadgeType.LEGEND) {
            return _isLegendEligible(user);
        }
        
        return true;
    }

    /**
     * @dev Get deposit requirement for level
     */
    function _getDepositRequirement(uint256 level) internal pure returns (uint256) {
        if (level == 1) return 0.001 ether;
        if (level == 2) return 0.1 ether;
        if (level == 3) return 1 ether;
        return type(uint256).max;
    }

    /**
     * @dev Get game requirement for level
     */
    function _getGameRequirement(uint256 level) internal pure returns (uint256) {
        if (level == 1) return 1;
        if (level == 2) return 10;
        if (level == 3) return 50;
        return type(uint256).max;
    }

    /**
     * @dev Get win requirement for level
     */
    function _getWinRequirement(uint256 level) internal pure returns (uint256) {
        if (level == 1) return 1;
        if (level == 2) return 5;
        if (level == 3) return 20;
        return type(uint256).max;
    }

    /**
     * @dev Get vote requirement for level
     */
    function _getVoteRequirement(uint256 level) internal pure returns (uint256) {
        if (level == 1) return 1;
        if (level == 2) return 10;
        if (level == 3) return 50;
        return type(uint256).max;
    }

    /**
     * @dev Get whale requirement for level
     */
    function _getWhaleRequirement(uint256 level) internal pure returns (uint256) {
        if (level == 1) return 10 ether;
        if (level == 2) return 50 ether;
        if (level == 3) return 100 ether;
        return type(uint256).max;
    }

    /**
     * @dev Get streak requirement for level
     */
    function _getStreakRequirement(uint256 level) internal pure returns (uint256) {
        if (level == 1) return 7;
        if (level == 2) return 30;
        if (level == 3) return 100;
        return type(uint256).max;
    }

    /**
     * @dev Get collector requirement for level
     */
    function _getCollectorRequirement(uint256 level) internal pure returns (uint256) {
        if (level == 1) return 5;
        if (level == 2) return 10;
        if (level == 3) return 15; // All badge types
        return type(uint256).max;
    }

    /**
     * @dev Check if user is eligible for legend badge
     */
    function _isLegendEligible(address user) internal view returns (bool) {
        UserData storage data = userData[user];
        return data.totalXP >= 15000 && 
               data.gamesWon >= 50 && 
               data.totalDeposited >= 10 ether &&
               _getBadgeCount(user) >= 10;
    }

    /**
     * @dev Get total number of badges owned by user
     */
    function _getBadgeCount(address user) internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i <= uint256(BadgeType.LEGEND); i++) {
            if (userData[user].hasBadge[BadgeType(i)]) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Mint a badge NFT
     * @param user Address of the user
     * @param badgeType Type of badge
     * @param level Level of the badge
     */
    function _mintBadge(address user, BadgeType badgeType, uint256 level) internal {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        userData[user].badgeLevels[badgeType] = level;
        userData[user].hasBadge[badgeType] = true;
        
        tokenBadgeType[tokenId] = badgeType;
        tokenBadgeLevel[tokenId] = level;
        
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, _generateTokenURI(badgeType, level));
        
        emit BadgeMinted(user, tokenId, badgeType, level);
    }

    /**
     * @dev Generate token URI with metadata
     * @param badgeType Type of badge
     * @param level Level of the badge
     */
    function _generateTokenURI(BadgeType badgeType, uint256 level) internal view returns (string memory) {
        BadgeLevel memory badge = badgeLevels[badgeType][level];
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', badge.name, '",',
                        '"description": "', badge.description, '",',
                        '"image": "ipfs://', badge.imageHash, '",',
                        '"attributes": [',
                        '{"trait_type": "Badge Type", "value": "', _getBadgeTypeName(badgeType), '"},',
                        '{"trait_type": "Level", "value": ', level.toString(), '},',
                        '{"trait_type": "XP Required", "value": ', badge.xpRequired.toString(), '}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @dev Get badge type name as string
     */
    function _getBadgeTypeName(BadgeType badgeType) internal pure returns (string memory) {
        if (badgeType == BadgeType.NEWCOMER) return "Newcomer";
        if (badgeType == BadgeType.DEPOSITOR) return "Depositor";
        if (badgeType == BadgeType.GAMER) return "Gamer";
        if (badgeType == BadgeType.WINNER) return "Winner";
        if (badgeType == BadgeType.VOTER) return "Voter";
        if (badgeType == BadgeType.LEADER) return "Leader";
        if (badgeType == BadgeType.WHALE) return "Whale";
        if (badgeType == BadgeType.STREAK) return "Streak";
        if (badgeType == BadgeType.COLLECTOR) return "Collector";
        if (badgeType == BadgeType.LEGEND) return "Legend";
        return "Unknown";
    }

    /**
     * @dev Get user's total XP
     * @param user Address of the user
     */
    function getUserXP(address user) external view returns (uint256) {
        return userData[user].totalXP;
    }

    /**
     * @dev Get user's badge level for a specific type
     * @param user Address of the user
     * @param badgeType Type of badge
     */
    function getUserBadgeLevel(address user, BadgeType badgeType) external view returns (uint256) {
        return userData[user].badgeLevels[badgeType];
    }

    /**
     * @dev Get user's complete stats
     * @param user Address of the user
     */
    function getUserStats(address user) external view returns (
        uint256 totalXP,
        uint256 gamesPlayed,
        uint256 gamesWon,
        uint256 totalDeposited,
        uint256 proposalsVoted,
        uint256 walletsCreated,
        uint256 streakDays
    ) {
        UserData storage data = userData[user];
        return (
            data.totalXP,
            data.gamesPlayed,
            data.gamesWon,
            data.totalDeposited,
            data.proposalsVoted,
            data.walletsCreated,
            data.streakDays
        );
    }

    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
