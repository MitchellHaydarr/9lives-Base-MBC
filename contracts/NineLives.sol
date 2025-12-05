// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NineLives
 * @dev A habit tracking smart contract where users maintain virtual cats with lives, streaks, and evolving stages.
 */
contract NineLives {
    struct Cat {
        uint8 lives;
        uint16 streak;
        uint8 stage;
        uint64 lastCheckIn;
        bool exists;
    }

    mapping(address => Cat) public cats;

    IERC20 public immutable usdc;
    address public immutable treasury;

    uint256 public constant RESTORE_COST = 1 * 10**6; // 1 USDC (6 decimals)
    uint256 public constant MAX_LIVES = 9;
    uint256 public constant CHECK_IN_INTERVAL = 1 days;

    event CatCreated(address indexed owner, uint8 lives, uint16 streak, uint8 stage);
    event CheckedIn(address indexed owner, uint16 streak, uint8 stage);
    event LifeRestored(address indexed owner, uint8 lives);

    constructor(address _usdc, address _treasury) {
        require(_usdc != address(0), "USDC address required");
        require(_treasury != address(0), "Treasury required");

        usdc = IERC20(_usdc);
        treasury = _treasury;
    }

    function createCat() external {
        require(!cats[msg.sender].exists, "Cat already exists");

        cats[msg.sender] = Cat({
            lives: uint8(MAX_LIVES),
            streak: 0,
            stage: 0,
            lastCheckIn: uint64(block.timestamp),
            exists: true
        });

        emit CatCreated(msg.sender, MAX_LIVES, 0, 0);
    }

    function checkIn() external {
        Cat storage cat = cats[msg.sender];
        require(cat.exists, "No cat found");
        require(block.timestamp > cat.lastCheckIn + CHECK_IN_INTERVAL, "Already checked in");

        cat.streak++;
        cat.lastCheckIn = uint64(block.timestamp);

        // Stage logic
        if (cat.streak >= 30 && cat.stage < 3) cat.stage = 3;
        else if (cat.streak >= 14 && cat.stage < 2) cat.stage = 2;
        else if (cat.streak >= 7 && cat.stage < 1) cat.stage = 1;

        emit CheckedIn(msg.sender, cat.streak, cat.stage);
    }

    function restoreLife() external {
        Cat storage cat = cats[msg.sender];
        require(cat.exists, "No cat found");
        require(cat.lives < MAX_LIVES, "Already at max lives");

        bool success = usdc.transferFrom(msg.sender, treasury, RESTORE_COST);
        require(success, "USDC transfer failed");

        cat.lives++;

        emit LifeRestored(msg.sender, cat.lives);
    }
}