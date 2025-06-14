// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

/**
 * @title GameManager
 * @dev Manages dice roll and coin flip games with provably fair randomness
 * @notice Uses Chainlink VRF for secure random number generation
 */
contract GameManager is VRFConsumerBaseV2, ReentrancyGuard, Ownable {
    
    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable vrfCoordinator;
    uint64 private immutable subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Game types
    enum GameType { DICE, COIN_FLIP }
    
    // Game states
    enum GameState { PENDING, ACTIVE, COMPLETED, CANCELLED }

    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator, GameType gameType, uint256 wager);
    event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 wager);
    event GameStarted(uint256 indexed gameId, uint256 requestId);
    event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 payout, uint256 randomResult);
    event XPAwarded(address indexed player, uint256 xpAmount);

    // Structs
    struct Game {
        uint256 id;
        address creator;
        GameType gameType;
        uint256 wager;
        uint256 totalPot;
        address[] players;
        GameState state;
        uint256 createdAt;
        uint256 requestId;
        uint256 randomResult;
        address winner;
    }

    struct PlayerStats {
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 totalWagered;
        uint256 totalWon;
        uint256 xpEarned;
    }

    // State variables
    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(address => uint256)) public playerWagers; // gameId => player => wager
    mapping(uint256 => mapping(address => uint256)) public playerResults; // gameId => player => result
    mapping(uint256 => uint256) private requestIdToGameId; // VRF request ID to game ID
    mapping(address => PlayerStats) public playerStats;
    
    uint256 public gameCount;
    uint256 public constant MAX_PLAYERS_DICE = 6;
    uint256 public constant MIN_WAGER = 0.001 ether;
    uint256 public constant MAX_WAGER = 10 ether;
    uint256 public constant HOUSE_FEE_PERCENT = 2; // 2% house fee
    uint256 public constant GAME_TIMEOUT = 1 hours;

    // XP rewards
    uint256 public constant XP_PER_GAME = 50;
    uint256 public constant XP_WIN_BONUS = 100;

    /**
     * @dev Constructor
     * @param _vrfCoordinator Chainlink VRF Coordinator address
     * @param _subscriptionId Chainlink VRF subscription ID
     * @param _keyHash Chainlink VRF key hash
     */
    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    /**
     * @dev Create a new dice game
     * @param wager Amount to wager (must be >= MIN_WAGER)
     */
    function createDiceGame(uint256 wager) external payable nonReentrant returns (uint256) {
        require(msg.value == wager, "Sent value must equal wager");
        require(wager >= MIN_WAGER && wager <= MAX_WAGER, "Invalid wager amount");

        uint256 gameId = gameCount++;
        Game storage game = games[gameId];
        
        game.id = gameId;
        game.creator = msg.sender;
        game.gameType = GameType.DICE;
        game.wager = wager;
        game.totalPot = wager;
        game.state = GameState.PENDING;
        game.createdAt = block.timestamp;
        
        game.players.push(msg.sender);
        playerWagers[gameId][msg.sender] = wager;

        emit GameCreated(gameId, msg.sender, GameType.DICE, wager);
        return gameId;
    }

    /**
     * @dev Create a new coin flip game
     * @param wager Amount to wager
     */
    function createCoinFlipGame(uint256 wager) external payable nonReentrant returns (uint256) {
        require(msg.value == wager, "Sent value must equal wager");
        require(wager >= MIN_WAGER && wager <= MAX_WAGER, "Invalid wager amount");

        uint256 gameId = gameCount++;
        Game storage game = games[gameId];
        
        game.id = gameId;
        game.creator = msg.sender;
        game.gameType = GameType.COIN_FLIP;
        game.wager = wager;
        game.totalPot = wager;
        game.state = GameState.PENDING;
        game.createdAt = block.timestamp;
        
        game.players.push(msg.sender);
        playerWagers[gameId][msg.sender] = wager;

        emit GameCreated(gameId, msg.sender, GameType.COIN_FLIP, wager);
        return gameId;
    }

    /**
     * @dev Join an existing game
     * @param gameId ID of the game to join
     */
    function joinGame(uint256 gameId) external payable nonReentrant {
        Game storage game = games[gameId];
        require(game.state == GameState.PENDING, "Game not available for joining");
        require(msg.value == game.wager, "Must send exact wager amount");
        require(!_isPlayerInGame(gameId, msg.sender), "Already in this game");
        
        if (game.gameType == GameType.DICE) {
            require(game.players.length < MAX_PLAYERS_DICE, "Game is full");
        } else if (game.gameType == GameType.COIN_FLIP) {
            require(game.players.length < 2, "Coin flip game is full");
        }

        game.players.push(msg.sender);
        playerWagers[gameId][msg.sender] = msg.value;
        game.totalPot += msg.value;

        emit PlayerJoined(gameId, msg.sender, msg.value);

        // Auto-start coin flip when 2 players join
        if (game.gameType == GameType.COIN_FLIP && game.players.length == 2) {
            _startGame(gameId);
        }
    }

    /**
     * @dev Start a dice game (can be called by creator or when max players reached)
     * @param gameId ID of the game to start
     */
    function startDiceGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.state == GameState.PENDING, "Game not pending");
        require(game.gameType == GameType.DICE, "Not a dice game");
        require(game.players.length >= 2, "Need at least 2 players");
        require(
            msg.sender == game.creator || game.players.length == MAX_PLAYERS_DICE,
            "Only creator can start or game must be full"
        );

        _startGame(gameId);
    }

    /**
     * @dev Internal function to start a game and request randomness
     * @param gameId ID of the game to start
     */
    function _startGame(uint256 gameId) internal {
        Game storage game = games[gameId];
        game.state = GameState.ACTIVE;

        // Request randomness from Chainlink VRF
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        game.requestId = requestId;
        requestIdToGameId[requestId] = gameId;

        emit GameStarted(gameId, requestId);
    }

    /**
     * @dev Callback function used by VRF Coordinator
     * @param requestId ID of the VRF request
     * @param randomWords Array of random numbers
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 gameId = requestIdToGameId[requestId];
        Game storage game = games[gameId];
        
        require(game.state == GameState.ACTIVE, "Game not active");
        
        uint256 randomResult = randomWords[0];
        game.randomResult = randomResult;
        
        _resolveGame(gameId, randomResult);
    }

    /**
     * @dev Resolve the game based on random result
     * @param gameId ID of the game
     * @param randomResult Random number from VRF
     */
    function _resolveGame(uint256 gameId, uint256 randomResult) internal {
        Game storage game = games[gameId];
        
        if (game.gameType == GameType.DICE) {
            _resolveDiceGame(gameId, randomResult);
        } else if (game.gameType == GameType.COIN_FLIP) {
            _resolveCoinFlipGame(gameId, randomResult);
        }
        
        game.state = GameState.COMPLETED;
    }

    /**
     * @dev Resolve dice game - highest roll wins
     * @param gameId ID of the game
     * @param randomResult Random number from VRF
     */
    function _resolveDiceGame(uint256 gameId, uint256 randomResult) internal {
        Game storage game = games[gameId];
        
        uint256 highestRoll = 0;
        address winner = address(0);
        
        // Generate dice rolls for each player
        for (uint256 i = 0; i < game.players.length; i++) {
            address player = game.players[i];
            uint256 playerRoll = (uint256(keccak256(abi.encode(randomResult, i))) % 6) + 1;
            playerResults[gameId][player] = playerRoll;

            if (playerRoll > highestRoll) {
                highestRoll = playerRoll;
                winner = player;
            }
        }
        
        game.winner = winner;
        _distributePayout(gameId);
    }

    /**
     * @dev Resolve coin flip game - random 0 or 1, player 0 wins on 0, player 1 wins on 1
     * @param gameId ID of the game
     * @param randomResult Random number from VRF
     */
    function _resolveCoinFlipGame(uint256 gameId, uint256 randomResult) internal {
        Game storage game = games[gameId];
        
        uint256 coinResult = randomResult % 2; // 0 or 1
        address winner = game.players[coinResult];
        
        game.winner = winner;
        playerResults[gameId][game.players[0]] = coinResult == 0 ? 1 : 0; // Winner gets 1
        playerResults[gameId][game.players[1]] = coinResult == 1 ? 1 : 0; // Winner gets 1
        
        _distributePayout(gameId);
    }

    /**
     * @dev Distribute payout to winner and update stats
     * @param gameId ID of the game
     */
    function _distributePayout(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        uint256 houseFee = (game.totalPot * HOUSE_FEE_PERCENT) / 100;
        uint256 payout = game.totalPot - houseFee;
        
        // Transfer payout to winner
        (bool success, ) = payable(game.winner).call{value: payout}("");
        require(success, "Payout transfer failed");
        
        // Update player stats and award XP
        for (uint256 i = 0; i < game.players.length; i++) {
            address player = game.players[i];
            PlayerStats storage stats = playerStats[player];
            
            stats.gamesPlayed++;
            stats.totalWagered += playerWagers[gameId][player];
            stats.xpEarned += XP_PER_GAME;
            
            if (player == game.winner) {
                stats.gamesWon++;
                stats.totalWon += payout;
                stats.xpEarned += XP_WIN_BONUS;
                emit XPAwarded(player, XP_PER_GAME + XP_WIN_BONUS);
            } else {
                emit XPAwarded(player, XP_PER_GAME);
            }
        }
        
        emit GameCompleted(gameId, game.winner, payout, game.randomResult);
    }

    /**
     * @dev Cancel a game if it hasn't started within timeout period
     * @param gameId ID of the game to cancel
     */
    function cancelGame(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.state == GameState.PENDING, "Game not pending");
        require(
            block.timestamp > game.createdAt + GAME_TIMEOUT,
            "Game timeout not reached"
        );
        
        game.state = GameState.CANCELLED;
        
        // Refund all players
        for (uint256 i = 0; i < game.players.length; i++) {
            address player = game.players[i];
            uint256 refund = playerWagers[gameId][player];
            (bool success, ) = payable(player).call{value: refund}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @dev Check if a player is in a specific game
     * @param gameId ID of the game
     * @param player Address of the player
     */
    function _isPlayerInGame(uint256 gameId, address player) internal view returns (bool) {
        Game storage game = games[gameId];
        for (uint256 i = 0; i < game.players.length; i++) {
            if (game.players[i] == player) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Get game information
     * @param gameId ID of the game
     */
    function getGame(uint256 gameId) external view returns (
        uint256 id,
        address creator,
        GameType gameType,
        uint256 wager,
        uint256 totalPot,
        address[] memory players,
        GameState state,
        uint256 createdAt,
        address winner
    ) {
        Game storage game = games[gameId];
        return (
            game.id,
            game.creator,
            game.gameType,
            game.wager,
            game.totalPot,
            game.players,
            game.state,
            game.createdAt,
            game.winner
        );
    }

    /**
     * @dev Get player result for a specific game
     * @param gameId ID of the game
     * @param player Address of the player
     */
    function getPlayerResult(uint256 gameId, address player) external view returns (uint256) {
        return playerResults[gameId][player];
    }

    /**
     * @dev Get player wager for a specific game
     * @param gameId ID of the game
     * @param player Address of the player
     */
    function getPlayerWager(uint256 gameId, address player) external view returns (uint256) {
        return playerWagers[gameId][player];
    }

    /**
     * @dev Get player statistics
     * @param player Address of the player
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    /**
     * @dev Withdraw house fees (only owner)
     */
    function withdrawHouseFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Emergency function to resolve stuck games (only owner)
     * @param gameId ID of the game
     * @param fallbackRandom Fallback random number
     */
    function emergencyResolve(uint256 gameId, uint256 fallbackRandom) external onlyOwner {
        Game storage game = games[gameId];
        require(game.state == GameState.ACTIVE, "Game not active");
        require(
            block.timestamp > game.createdAt + (GAME_TIMEOUT * 2),
            "Emergency timeout not reached"
        );
        
        _resolveGame(gameId, fallbackRandom);
    }
}
