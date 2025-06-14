// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockGameManager
 * @dev Mock contract for testing purposes
 */
contract MockGameManager {
    event GameCreated(uint256 indexed gameId, address indexed creator);
    
    uint256 public gameCount;
    
    function createDiceGame(uint256 wager) external payable returns (uint256) {
        uint256 gameId = gameCount++;
        emit GameCreated(gameId, msg.sender);
        return gameId;
    }
    
    function createCoinFlipGame(uint256 wager) external payable returns (uint256) {
        uint256 gameId = gameCount++;
        emit GameCreated(gameId, msg.sender);
        return gameId;
    }
}
