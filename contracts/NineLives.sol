// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NineLives
 * @dev A habit tracking smart contract where users maintain virtual cats with lives, streaks, and evolution stages
 */
contract NineLives {
    struct Cat {
        uint8 lives;
        uint16 streak;
        uint8 stage;
        uint64 lastCheckIn;
        bool exists;
    }

    // State variables
    mapping(address => Cat) public cats;
    IERC20 public immutable usdc;
    address public immutable treasury;
    
    // Constants
    uint256 public constant RESTORE_COST = 1 * 10**6; // 1 USDC (6 decimals)
    uint256 public constant MAX_LIVES = 9;
    uint256 public constant CHECK_IN_INTERVAL = 1 days;
    
    // Events
    event CatCreated(address indexed owner);
    event CheckedIn(address indexed owner, uint16 streak, uint8 stage);
    event LifeLost(address indexed owner, uint8 lives);
    event LifeRestored(address indexed owner, uint8 lives);

    /**
     * @dev Constructor initializes USDC token and treasury addresses
     * @param _usdc Address of the USDC token contract
     * @param _treasury Address that receives USDC payments
     */
    constructor(address _usdc, address _treasury) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_treasury != address(0), "Invalid treasury address");
        usdc = IERC20(_usdc);
        treasury = _treasury;
    }

    /**
     * @dev Creates a new cat for the message sender
     */
    function createCat() external {
        require(!cats[msg.sender].exists, "Cat already exists");
        
        cats[msg.sender] = Cat({
            lives: 9,
            streak: 0,
            stage: 0,
            lastCheckIn: uint64(block.timestamp),
            exists: true
        });
        
        emit CatCreated(msg.sender);
    }

    /**
     * @dev Returns the cat data for a specific user
     * @param user Address of the cat owner
     * @return Cat struct containing all cat data
     */
    function getCat(address user) external view returns (Cat memory) {
        require(cats[user].exists, "Cat does not exist");
        return cats[user];
    }

    /**
     * @dev Daily check-in function to maintain streak
     * Updates streak and evolves the cat based on streak milestones
     */
    function checkIn() external {
        Cat storage cat = cats[msg.sender];
        require(cat.exists, "Cat does not exist");
        
        // Simple timing check - can be improved for production
        // Currently allows one check-in per day
        uint256 timeSinceLastCheckIn = block.timestamp - cat.lastCheckIn;
        require(timeSinceLastCheckIn >= CHECK_IN_INTERVAL, "Already checked in today");
        
        // Update streak
        // If more than 2 days since last check-in, reset streak
        if (timeSinceLastCheckIn > 2 * CHECK_IN_INTERVAL) {
            cat.streak = 1;
        } else {
            cat.streak++;
        }
        
        // Update last check-in time
        cat.lastCheckIn = uint64(block.timestamp);
        
        // Calculate stage based on streak
        uint8 newStage = _calculateStage(cat.streak);
        cat.stage = newStage;
        
        emit CheckedIn(msg.sender, cat.streak, newStage);
    }

    /**
     * @dev Calculates evolution stage based on streak
     * @param streak Current streak value
     * @return stage Evolution stage (0-3)
     */
    function _calculateStage(uint16 streak) private pure returns (uint8) {
        if (streak >= 12) {
            return 3;
        } else if (streak >= 7) {
            return 2;
        } else if (streak >= 3) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * @dev Decrements a cat's life count
     * @param user Address of the cat owner
     * @notice For MVP, users can call this themselves
     */
    function loseLife(address user) external {
        Cat storage cat = cats[user];
        require(cat.exists, "Cat does not exist");
        require(cat.lives > 0, "Cat has no lives to lose");
        
        cat.lives--;
        emit LifeLost(user, cat.lives);
    }

    /**
     * @dev Restores one life by paying USDC
     * @notice Requires prior approval of USDC spending
     */
    function restoreLife() external {
        Cat storage cat = cats[msg.sender];
        require(cat.exists, "Cat does not exist");
        require(cat.lives < MAX_LIVES, "Cat already has maximum lives");
        
        // Transfer USDC from user to treasury
        require(
            usdc.transferFrom(msg.sender, treasury, RESTORE_COST),
            "USDC transfer failed"
        );
        
        cat.lives++;
        emit LifeRestored(msg.sender, cat.lives);
    }

    /**
     * @dev Helper function to check if a user has a cat
     * @param user Address to check
     * @return bool Whether the user has created a cat
     */
    function hasCat(address user) external view returns (bool) {
        return cats[user].exists;
    }

    /**
     * @dev Helper function to get time until next check-in is allowed
     * @param user Address of the cat owner
     * @return uint256 Seconds until next check-in (0 if can check in now)
     */
    function timeUntilNextCheckIn(address user) external view returns (uint256) {
        Cat memory cat = cats[user];
        if (!cat.exists) return 0;
        
        uint256 timeSinceLastCheckIn = block.timestamp - cat.lastCheckIn;
        if (timeSinceLastCheckIn >= CHECK_IN_INTERVAL) {
            return 0;
        }
        return CHECK_IN_INTERVAL - timeSinceLastCheckIn;
    }
}
