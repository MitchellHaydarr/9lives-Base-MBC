import { expect } from "chai";
import { ethers } from "hardhat";
import { NineLives } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NineLives", function () {
  let nineLives: NineLives;
  let usdc: any;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let treasury: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, treasury] = await ethers.getSigners();

    // Deploy mock USDC token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();

    // Deploy NineLives contract
    const NineLives = await ethers.getContractFactory("NineLives");
    nineLives = await NineLives.deploy(
      await usdc.getAddress(),
      treasury.address
    );
    await nineLives.waitForDeployment();

    // Mint USDC to users for testing
    await usdc.mint(user1.address, ethers.parseUnits("100", 6));
    await usdc.mint(user2.address, ethers.parseUnits("100", 6));
  });

  describe("Cat Creation", function () {
    it("Should create a new cat with initial values", async function () {
      await nineLives.connect(user1).createCat();
      
      const cat = await nineLives.getCat(user1.address);
      expect(cat.lives).to.equal(9);
      expect(cat.streak).to.equal(0);
      expect(cat.stage).to.equal(0);
      expect(cat.exists).to.be.true;
    });

    it("Should emit CatCreated event", async function () {
      await expect(nineLives.connect(user1).createCat())
        .to.emit(nineLives, "CatCreated")
        .withArgs(user1.address);
    });

    it("Should prevent creating duplicate cats", async function () {
      await nineLives.connect(user1).createCat();
      
      await expect(
        nineLives.connect(user1).createCat()
      ).to.be.revertedWith("Cat already exists");
    });

    it("Should allow different users to create cats", async function () {
      await nineLives.connect(user1).createCat();
      await nineLives.connect(user2).createCat();
      
      const cat1 = await nineLives.getCat(user1.address);
      const cat2 = await nineLives.getCat(user2.address);
      
      expect(cat1.exists).to.be.true;
      expect(cat2.exists).to.be.true;
    });
  });

  describe("Check-in System", function () {
    beforeEach(async function () {
      await nineLives.connect(user1).createCat();
    });

    it("Should update streak on check-in", async function () {
      // Fast forward time by 1 day
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine", []);
      
      await nineLives.connect(user1).checkIn();
      
      const cat = await nineLives.getCat(user1.address);
      expect(cat.streak).to.equal(1);
    });

    it("Should update stage based on streak", async function () {
      // Check in multiple times to increase streak
      for (let i = 0; i < 3; i++) {
        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine", []);
        await nineLives.connect(user1).checkIn();
      }
      
      const cat = await nineLives.getCat(user1.address);
      expect(cat.streak).to.equal(3);
      expect(cat.stage).to.equal(1); // Stage 1 at streak 3-6
    });

    it("Should reset streak after missing days", async function () {
      // First check-in
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine", []);
      await nineLives.connect(user1).checkIn();
      
      // Miss 2+ days
      await ethers.provider.send("evm_increaseTime", [86400 * 3]);
      await ethers.provider.send("evm_mine", []);
      await nineLives.connect(user1).checkIn();
      
      const cat = await nineLives.getCat(user1.address);
      expect(cat.streak).to.equal(1); // Reset to 1
    });

    it("Should prevent checking in too soon", async function () {
      await expect(
        nineLives.connect(user1).checkIn()
      ).to.be.revertedWith("Already checked in today");
    });

    it("Should emit CheckedIn event", async function () {
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine", []);
      
      await expect(nineLives.connect(user1).checkIn())
        .to.emit(nineLives, "CheckedIn")
        .withArgs(user1.address, 1, 0);
    });
  });

  describe("Life System", function () {
    beforeEach(async function () {
      await nineLives.connect(user1).createCat();
    });

    it("Should lose a life", async function () {
      await nineLives.loseLife(user1.address);
      
      const cat = await nineLives.getCat(user1.address);
      expect(cat.lives).to.equal(8);
    });

    it("Should emit LifeLost event", async function () {
      await expect(nineLives.loseLife(user1.address))
        .to.emit(nineLives, "LifeLost")
        .withArgs(user1.address, 8);
    });

    it("Should not lose life below zero", async function () {
      // Lose all lives
      for (let i = 0; i < 9; i++) {
        await nineLives.loseLife(user1.address);
      }
      
      await expect(
        nineLives.loseLife(user1.address)
      ).to.be.revertedWith("Cat has no lives to lose");
    });
  });

  describe("Life Restoration", function () {
    beforeEach(async function () {
      await nineLives.connect(user1).createCat();
      // Lose some lives
      await nineLives.loseLife(user1.address);
      await nineLives.loseLife(user1.address);
      
      // Approve USDC spending
      await usdc.connect(user1).approve(
        await nineLives.getAddress(),
        ethers.parseUnits("10", 6)
      );
    });

    it("Should restore one life for 1 USDC", async function () {
      const initialBalance = await usdc.balanceOf(user1.address);
      
      await nineLives.connect(user1).restoreLife();
      
      const cat = await nineLives.getCat(user1.address);
      expect(cat.lives).to.equal(8); // 9 - 2 + 1
      
      const finalBalance = await usdc.balanceOf(user1.address);
      expect(initialBalance - finalBalance).to.equal(ethers.parseUnits("1", 6));
    });

    it("Should transfer USDC to treasury", async function () {
      const initialTreasuryBalance = await usdc.balanceOf(treasury.address);
      
      await nineLives.connect(user1).restoreLife();
      
      const finalTreasuryBalance = await usdc.balanceOf(treasury.address);
      expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(
        ethers.parseUnits("1", 6)
      );
    });

    it("Should not restore life beyond maximum", async function () {
      // Restore to max first
      await nineLives.connect(user1).restoreLife();
      await nineLives.connect(user1).restoreLife();
      
      await expect(
        nineLives.connect(user1).restoreLife()
      ).to.be.revertedWith("Cat already has maximum lives");
    });

    it("Should emit LifeRestored event", async function () {
      await expect(nineLives.connect(user1).restoreLife())
        .to.emit(nineLives, "LifeRestored")
        .withArgs(user1.address, 8);
    });

    it("Should fail without USDC approval", async function () {
      // Revoke approval
      await usdc.connect(user1).approve(await nineLives.getAddress(), 0);
      
      await expect(
        nineLives.connect(user1).restoreLife()
      ).to.be.revertedWith("USDC transfer failed");
    });
  });

  describe("Helper Functions", function () {
    it("Should check if user has cat", async function () {
      expect(await nineLives.hasCat(user1.address)).to.be.false;
      
      await nineLives.connect(user1).createCat();
      
      expect(await nineLives.hasCat(user1.address)).to.be.true;
    });

    it("Should calculate time until next check-in", async function () {
      await nineLives.connect(user1).createCat();
      
      // Right after creation, should need to wait
      const timeUntilNext = await nineLives.timeUntilNextCheckIn(user1.address);
      expect(timeUntilNext).to.be.greaterThan(0);
      
      // After waiting a day, should be able to check in
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine", []);
      
      const timeUntilNext2 = await nineLives.timeUntilNextCheckIn(user1.address);
      expect(timeUntilNext2).to.equal(0);
    });
  });

  describe("Stage Evolution", function () {
    beforeEach(async function () {
      await nineLives.connect(user1).createCat();
    });

    it("Should evolve through all stages", async function () {
      const checkInAndVerifyStage = async (expectedStreak: number, expectedStage: number) => {
        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine", []);
        await nineLives.connect(user1).checkIn();
        
        const cat = await nineLives.getCat(user1.address);
        expect(cat.streak).to.equal(expectedStreak);
        expect(cat.stage).to.equal(expectedStage);
      };

      // Stage 0 (streak 1-2)
      await checkInAndVerifyStage(1, 0);
      await checkInAndVerifyStage(2, 0);
      
      // Stage 1 (streak 3-6)
      await checkInAndVerifyStage(3, 1);
      await checkInAndVerifyStage(4, 1);
      await checkInAndVerifyStage(5, 1);
      await checkInAndVerifyStage(6, 1);
      
      // Stage 2 (streak 7-11)
      await checkInAndVerifyStage(7, 2);
      await checkInAndVerifyStage(8, 2);
      await checkInAndVerifyStage(9, 2);
      await checkInAndVerifyStage(10, 2);
      await checkInAndVerifyStage(11, 2);
      
      // Stage 3 (streak 12+)
      await checkInAndVerifyStage(12, 3);
      await checkInAndVerifyStage(13, 3);
    });
  });
});

// Mock ERC20 contract for testing
const MockERC20Source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;
    
    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }
    
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
`;
