import { expect } from "chai";
import { ethers } from "hardhat";
import { SquadWallet, XPBadges, SquadWalletFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SquadWallet", function () {
  let squadWallet: SquadWallet;
  let xpBadges: XPBadges;
  let factory: SquadWalletFactory;
  let owner: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let member3: SignerWithAddress;

  beforeEach(async function () {
    [owner, member1, member2, member3] = await ethers.getSigners();

    // Deploy XPBadges
    const XPBadges = await ethers.getContractFactory("XPBadges");
    xpBadges = await XPBadges.deploy();
    await xpBadges.waitForDeployment();

    // Deploy mock GameManager (simplified for testing)
    const MockGameManager = await ethers.getContractFactory("MockGameManager");
    const mockGameManager = await MockGameManager.deploy();
    await mockGameManager.waitForDeployment();

    // Deploy Factory
    const SquadWalletFactory = await ethers.getContractFactory("SquadWalletFactory");
    factory = await SquadWalletFactory.deploy(
      await xpBadges.getAddress(),
      await mockGameManager.getAddress()
    );
    await factory.waitForDeployment();

    // Create a SquadWallet through factory
    const tx = await factory.createSquadWallet(
      "Test Squad",
      [owner.address, member1.address, member2.address],
      ["Owner", "Member1", "Member2"]
    );
    const receipt = await tx.wait();
    
    // Get wallet address from event
    const walletCreatedEvent = receipt?.logs.find(
      (log: any) => log.fragment?.name === "SquadWalletCreated"
    );
    const walletAddress = walletCreatedEvent?.args?.[0];
    
    squadWallet = await ethers.getContractAt("SquadWallet", walletAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct wallet name", async function () {
      expect(await squadWallet.walletName()).to.equal("Test Squad");
    });

    it("Should have correct initial members", async function () {
      const members = await squadWallet.getAllMembers();
      expect(members).to.have.lengthOf(3);
      expect(members).to.include(owner.address);
      expect(members).to.include(member1.address);
      expect(members).to.include(member2.address);
    });

    it("Should set correct total members count", async function () {
      expect(await squadWallet.totalMembers()).to.equal(3);
    });
  });

  describe("Deposits", function () {
    it("Should allow members to deposit ETH", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await expect(
        squadWallet.connect(member1).depositETH({ value: depositAmount })
      ).to.emit(squadWallet, "Deposit")
        .withArgs(member1.address, depositAmount, ethers.ZeroAddress);

      expect(await squadWallet.getBalance(ethers.ZeroAddress)).to.equal(depositAmount);
    });

    it("Should not allow non-members to deposit", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await expect(
        squadWallet.connect(member3).depositETH({ value: depositAmount })
      ).to.be.revertedWith("Not an active member");
    });

    it("Should update member's total deposited amount", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await squadWallet.connect(member1).depositETH({ value: depositAmount });
      
      const memberInfo = await squadWallet.getMember(member1.address);
      expect(memberInfo.totalDeposited).to.equal(depositAmount);
    });

    it("Should award XP for deposits", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await squadWallet.connect(member1).depositETH({ value: depositAmount });
      
      const memberInfo = await squadWallet.getMember(member1.address);
      // 1 ETH = 1000 XP (1 XP per 0.001 ETH)
      expect(memberInfo.xpPoints).to.equal(1000);
    });
  });

  describe("Proposals", function () {
    beforeEach(async function () {
      // Add some funds to the wallet
      await squadWallet.connect(member1).depositETH({ value: ethers.parseEther("2.0") });
    });

    it("Should allow members to create proposals", async function () {
      await expect(
        squadWallet.connect(member1).createProposal(
          "Test proposal",
          ethers.ZeroAddress,
          ethers.parseEther("0.5"),
          "0x"
        )
      ).to.emit(squadWallet, "ProposalCreated")
        .withArgs(0, member1.address, "Test proposal");
    });

    it("Should not allow non-members to create proposals", async function () {
      await expect(
        squadWallet.connect(member3).createProposal(
          "Test proposal",
          ethers.ZeroAddress,
          ethers.parseEther("0.5"),
          "0x"
        )
      ).to.be.revertedWith("Not an active member");
    });

    it("Should allow members to vote on proposals", async function () {
      // Create proposal
      await squadWallet.connect(member1).createProposal(
        "Test proposal",
        ethers.ZeroAddress,
        ethers.parseEther("0.5"),
        "0x"
      );

      // Vote on proposal
      await expect(
        squadWallet.connect(member2).vote(0, true)
      ).to.emit(squadWallet, "ProposalVoted")
        .withArgs(0, member2.address, true);
    });

    it("Should not allow double voting", async function () {
      // Create proposal
      await squadWallet.connect(member1).createProposal(
        "Test proposal",
        ethers.ZeroAddress,
        ethers.parseEther("0.5"),
        "0x"
      );

      // First vote
      await squadWallet.connect(member2).vote(0, true);

      // Second vote should fail
      await expect(
        squadWallet.connect(member2).vote(0, false)
      ).to.be.revertedWith("Already voted");
    });

    it("Should award XP for voting", async function () {
      // Create proposal
      await squadWallet.connect(member1).createProposal(
        "Test proposal",
        ethers.ZeroAddress,
        ethers.parseEther("0.5"),
        "0x"
      );

      const memberInfoBefore = await squadWallet.getMember(member2.address);
      
      // Vote on proposal
      await squadWallet.connect(member2).vote(0, true);

      const memberInfoAfter = await squadWallet.getMember(member2.address);
      expect(memberInfoAfter.xpPoints).to.equal(memberInfoBefore.xpPoints + 10n);
    });
  });

  describe("Member Management", function () {
    it("Should return correct member information", async function () {
      const memberInfo = await squadWallet.getMember(member1.address);
      
      expect(memberInfo.name).to.equal("Member1");
      expect(memberInfo.isActive).to.be.true;
      expect(memberInfo.totalDeposited).to.equal(0);
      expect(memberInfo.xpPoints).to.equal(0);
    });

    it("Should allow owner to add new members", async function () {
      await expect(
        squadWallet.connect(owner).addMember(member3.address, "Member3")
      ).to.emit(squadWallet, "MemberAdded")
        .withArgs(member3.address, "Member3");

      const memberInfo = await squadWallet.getMember(member3.address);
      expect(memberInfo.isActive).to.be.true;
      expect(memberInfo.name).to.equal("Member3");
    });

    it("Should not allow non-owners to add members", async function () {
      await expect(
        squadWallet.connect(member1).addMember(member3.address, "Member3")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Balance Queries", function () {
    it("Should return correct ETH balance", async function () {
      const depositAmount = ethers.parseEther("1.5");
      await squadWallet.connect(member1).depositETH({ value: depositAmount });
      
      expect(await squadWallet.getBalance(ethers.ZeroAddress)).to.equal(depositAmount);
    });

    it("Should handle receive function", async function () {
      const sendAmount = ethers.parseEther("0.5");
      
      await expect(
        member1.sendTransaction({
          to: await squadWallet.getAddress(),
          value: sendAmount
        })
      ).to.emit(squadWallet, "Deposit")
        .withArgs(member1.address, sendAmount, ethers.ZeroAddress);
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      await squadWallet.connect(member1).depositETH({ value: ethers.parseEther("1.0") });
    });

    it("Should allow owner to emergency withdraw", async function () {
      const withdrawAmount = ethers.parseEther("0.5");
      
      await expect(
        squadWallet.connect(owner).emergencyWithdraw(
          ethers.ZeroAddress,
          withdrawAmount,
          owner.address
        )
      ).to.emit(squadWallet, "Withdrawal")
        .withArgs(owner.address, withdrawAmount, ethers.ZeroAddress);
    });

    it("Should not allow non-owners to emergency withdraw", async function () {
      const withdrawAmount = ethers.parseEther("0.5");
      
      await expect(
        squadWallet.connect(member1).emergencyWithdraw(
          ethers.ZeroAddress,
          withdrawAmount,
          member1.address
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
