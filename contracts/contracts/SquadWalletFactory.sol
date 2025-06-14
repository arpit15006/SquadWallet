// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SquadWallet.sol";
import "./XPBadges.sol";
import "./GameManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SquadWalletFactory
 * @dev Factory contract for creating and managing SquadWallet instances
 * @notice Enables easy creation of group wallets with integrated XP and gaming
 */
contract SquadWalletFactory is Ownable {
    
    // Events
    event SquadWalletCreated(
        address indexed walletAddress,
        address indexed creator,
        string walletName,
        address[] members
    );
    event XPBadgesUpdated(address indexed oldAddress, address indexed newAddress);
    event GameManagerUpdated(address indexed oldAddress, address indexed newAddress);

    // State variables
    XPBadges public xpBadges;
    GameManager public gameManager;
    
    mapping(address => address[]) public userWallets; // user => wallet addresses
    mapping(address => bool) public isSquadWallet; // wallet address => is valid
    address[] public allWallets;
    
    uint256 public totalWallets;
    uint256 public constant MAX_INITIAL_MEMBERS = 10;

    /**
     * @dev Constructor
     * @param _xpBadges Address of the XPBadges contract
     * @param _gameManager Address of the GameManager contract
     */
    constructor(address _xpBadges, address _gameManager) Ownable(msg.sender) {
        require(_xpBadges != address(0), "Invalid XPBadges address");
        require(_gameManager != address(0), "Invalid GameManager address");
        
        xpBadges = XPBadges(_xpBadges);
        gameManager = GameManager(_gameManager);
    }

    /**
     * @dev Create a new SquadWallet
     * @param walletName Name of the squad wallet
     * @param initialMembers Array of initial member addresses
     * @param memberNames Array of initial member names
     */
    function createSquadWallet(
        string memory walletName,
        address[] memory initialMembers,
        string[] memory memberNames
    ) external returns (address) {
        require(bytes(walletName).length > 0, "Wallet name cannot be empty");
        require(initialMembers.length > 0, "Must have at least one member");
        require(initialMembers.length <= MAX_INITIAL_MEMBERS, "Too many initial members");
        require(initialMembers.length == memberNames.length, "Members and names length mismatch");
        
        // Validate that creator is in the initial members list
        bool creatorIncluded = false;
        for (uint256 i = 0; i < initialMembers.length; i++) {
            require(initialMembers[i] != address(0), "Invalid member address");
            require(bytes(memberNames[i]).length > 0, "Member name cannot be empty");
            
            if (initialMembers[i] == msg.sender) {
                creatorIncluded = true;
            }
        }
        require(creatorIncluded, "Creator must be included in initial members");

        // Deploy new SquadWallet
        SquadWallet newWallet = new SquadWallet(
            walletName,
            initialMembers,
            memberNames
        );
        
        address walletAddress = address(newWallet);
        
        // Update tracking
        isSquadWallet[walletAddress] = true;
        allWallets.push(walletAddress);
        totalWallets++;
        
        // Add wallet to each member's list
        for (uint256 i = 0; i < initialMembers.length; i++) {
            userWallets[initialMembers[i]].push(walletAddress);
            
            // Award XP for wallet creation (only to creator)
            if (initialMembers[i] == msg.sender) {
                xpBadges.awardXP(initialMembers[i], 100, "Created SquadWallet");
                xpBadges.recordWalletCreation(initialMembers[i]);
            } else {
                // Award joining XP to other members
                xpBadges.awardXP(initialMembers[i], 25, "Joined SquadWallet");
            }
        }

        emit SquadWalletCreated(walletAddress, msg.sender, walletName, initialMembers);
        return walletAddress;
    }

    /**
     * @dev Record a deposit for XP tracking
     * @param user Address of the user making the deposit
     * @param amount Amount deposited
     */
    function recordDeposit(address user, uint256 amount) external {
        require(isSquadWallet[msg.sender], "Only SquadWallets can call this");
        
        // Award XP based on deposit amount (1 XP per 0.001 ETH)
        uint256 xpAmount = amount / 1e15;
        if (xpAmount > 0) {
            xpBadges.awardXP(user, xpAmount, "Made deposit");
            xpBadges.recordDeposit(user, amount);
        }
    }

    /**
     * @dev Record a vote for XP tracking
     * @param user Address of the user voting
     */
    function recordVote(address user) external {
        require(isSquadWallet[msg.sender], "Only SquadWallets can call this");
        
        xpBadges.awardXP(user, 10, "Voted on proposal");
        xpBadges.recordVote(user);
    }

    /**
     * @dev Record game participation
     * @param user Address of the user
     * @param won Whether the user won
     * @param wager Amount wagered
     */
    function recordGameParticipation(address user, bool won, uint256 wager) external {
        require(msg.sender == address(gameManager), "Only GameManager can call this");
        
        uint256 baseXP = 50; // Base XP for playing
        uint256 winBonus = won ? 100 : 0; // Bonus XP for winning
        uint256 wagerBonus = wager / 1e16; // Bonus XP based on wager (1 XP per 0.01 ETH)
        
        uint256 totalXP = baseXP + winBonus + wagerBonus;
        
        string memory reason = won ? "Won game" : "Played game";
        xpBadges.awardXP(user, totalXP, reason);
        xpBadges.recordGameActivity(user, won);
    }

    /**
     * @dev Get all wallets for a user
     * @param user Address of the user
     */
    function getUserWallets(address user) external view returns (address[] memory) {
        return userWallets[user];
    }

    /**
     * @dev Get all created wallets
     */
    function getAllWallets() external view returns (address[] memory) {
        return allWallets;
    }

    /**
     * @dev Get wallet information
     * @param walletAddress Address of the wallet
     */
    function getWalletInfo(address walletAddress) external view returns (
        string memory name,
        uint256 totalMembers,
        uint256 createdAt,
        address[] memory members
    ) {
        require(isSquadWallet[walletAddress], "Not a valid SquadWallet");
        
        SquadWallet wallet = SquadWallet(payable(walletAddress));
        return (
            wallet.walletName(),
            wallet.totalMembers(),
            wallet.createdAt(),
            wallet.getAllMembers()
        );
    }

    /**
     * @dev Get user statistics across all wallets
     * @param user Address of the user
     */
    function getUserGlobalStats(address user) external view returns (
        uint256 walletsCount,
        uint256 totalXP,
        uint256 gamesPlayed,
        uint256 gamesWon,
        uint256 totalDeposited,
        uint256 proposalsVoted
    ) {
        walletsCount = userWallets[user].length;
        
        (
            totalXP,
            gamesPlayed,
            gamesWon,
            totalDeposited,
            proposalsVoted,
            ,
            
        ) = xpBadges.getUserStats(user);
    }

    /**
     * @dev Check if an address is a valid SquadWallet
     * @param walletAddress Address to check
     */
    function isValidSquadWallet(address walletAddress) external view returns (bool) {
        return isSquadWallet[walletAddress];
    }

    /**
     * @dev Get factory statistics
     */
    function getFactoryStats() external view returns (
        uint256 totalWalletsCreated,
        uint256 totalUsers,
        address xpBadgesContract,
        address gameManagerContract
    ) {
        // Calculate unique users (simplified - counts wallet memberships)
        uint256 uniqueUsers = 0;
        for (uint256 i = 0; i < allWallets.length; i++) {
            if (isSquadWallet[allWallets[i]]) {
                SquadWallet wallet = SquadWallet(payable(allWallets[i]));
                uniqueUsers += wallet.totalMembers();
            }
        }
        
        return (
            totalWallets,
            uniqueUsers,
            address(xpBadges),
            address(gameManager)
        );
    }

    /**
     * @dev Update XPBadges contract address (only owner)
     * @param newXPBadges New XPBadges contract address
     */
    function updateXPBadges(address newXPBadges) external onlyOwner {
        require(newXPBadges != address(0), "Invalid address");
        
        address oldAddress = address(xpBadges);
        xpBadges = XPBadges(newXPBadges);
        
        emit XPBadgesUpdated(oldAddress, newXPBadges);
    }

    /**
     * @dev Update GameManager contract address (only owner)
     * @param newGameManager New GameManager contract address
     */
    function updateGameManager(address newGameManager) external onlyOwner {
        require(newGameManager != address(0), "Invalid address");
        
        address oldAddress = address(gameManager);
        gameManager = GameManager(newGameManager);
        
        emit GameManagerUpdated(oldAddress, newGameManager);
    }

    /**
     * @dev Emergency function to mark a wallet as invalid (only owner)
     * @param walletAddress Address of the wallet to invalidate
     */
    function invalidateWallet(address walletAddress) external onlyOwner {
        isSquadWallet[walletAddress] = false;
    }

    /**
     * @dev Get leaderboard data (top users by XP)
     * @param limit Number of top users to return
     */
    function getLeaderboard(uint256 limit) external view returns (
        address[] memory users,
        uint256[] memory xpAmounts,
        string[] memory names
    ) {
        // This is a simplified implementation
        // In production, you might want to maintain a sorted list or use a more efficient approach
        
        users = new address[](limit);
        xpAmounts = new uint256[](limit);
        names = new string[](limit);
        
        // For now, return empty arrays - this would need to be implemented
        // with proper user tracking and sorting mechanisms
        
        return (users, xpAmounts, names);
    }

    /**
     * @dev Batch create multiple wallets (for testing/admin purposes)
     * @param walletNames Array of wallet names
     * @param memberArrays Array of member arrays
     * @param nameArrays Array of name arrays
     */
    function batchCreateWallets(
        string[] memory walletNames,
        address[][] memory memberArrays,
        string[][] memory nameArrays
    ) external onlyOwner returns (address[] memory) {
        require(walletNames.length == memberArrays.length, "Length mismatch");
        require(walletNames.length == nameArrays.length, "Length mismatch");
        require(walletNames.length <= 10, "Too many wallets in batch");
        
        address[] memory createdWallets = new address[](walletNames.length);
        
        for (uint256 i = 0; i < walletNames.length; i++) {
            createdWallets[i] = this.createSquadWallet(
                walletNames[i],
                memberArrays[i],
                nameArrays[i]
            );
        }
        
        return createdWallets;
    }
}
