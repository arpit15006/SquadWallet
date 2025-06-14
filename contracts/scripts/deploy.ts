import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function main() {
  console.log("🚀 Starting SquadWallet deployment to Base...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Chainlink VRF configuration
  const VRF_COORDINATOR = process.env.CHAINLINK_VRF_COORDINATOR || "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE";
  const KEY_HASH = process.env.CHAINLINK_KEY_HASH || "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805";
  const SUBSCRIPTION_ID = process.env.CHAINLINK_SUBSCRIPTION_ID || "1"; // You'll need to create this

  console.log("\n🎯 Deployment Configuration:");
  console.log("VRF Coordinator:", VRF_COORDINATOR);
  console.log("Key Hash:", KEY_HASH);
  console.log("Subscription ID:", SUBSCRIPTION_ID);

  // Deploy XPBadges contract first
  console.log("\n📜 Deploying XPBadges contract...");
  const XPBadges = await ethers.getContractFactory("XPBadges");
  const xpBadges = await XPBadges.deploy();
  await xpBadges.waitForDeployment();
  const xpBadgesAddress = await xpBadges.getAddress();
  console.log("✅ XPBadges deployed to:", xpBadgesAddress);

  // Deploy GameManager contract
  console.log("\n🎮 Deploying GameManager contract...");
  const GameManager = await ethers.getContractFactory("GameManager");
  const gameManager = await GameManager.deploy(
    VRF_COORDINATOR,
    SUBSCRIPTION_ID,
    KEY_HASH
  );
  await gameManager.waitForDeployment();
  const gameManagerAddress = await gameManager.getAddress();
  console.log("✅ GameManager deployed to:", gameManagerAddress);

  // Deploy SquadWallet Factory (we'll create a factory pattern)
  console.log("\n🏦 Deploying SquadWalletFactory contract...");
  const SquadWalletFactory = await ethers.getContractFactory("SquadWalletFactory");
  const squadWalletFactory = await SquadWalletFactory.deploy(
    xpBadgesAddress,
    gameManagerAddress
  );
  await squadWalletFactory.waitForDeployment();
  const squadWalletFactoryAddress = await squadWalletFactory.getAddress();
  console.log("✅ SquadWalletFactory deployed to:", squadWalletFactoryAddress);

  // Authorize the factory and game manager to award XP
  console.log("\n🔐 Setting up permissions...");
  await xpBadges.setAgentAuthorization(squadWalletFactoryAddress, true);
  await xpBadges.setAgentAuthorization(gameManagerAddress, true);
  console.log("✅ Authorized contracts to award XP");

  // Deploy a test SquadWallet
  console.log("\n🧪 Creating test SquadWallet...");
  const testWalletTx = await squadWalletFactory.createSquadWallet(
    "Test Squad",
    [deployer.address],
    ["Test User"]
  );
  const receipt = await testWalletTx.wait();
  
  // Get the created wallet address from events
  const walletCreatedEvent = receipt?.logs.find(
    (log: any) => log.fragment?.name === "SquadWalletCreated"
  );
  const testWalletAddress = walletCreatedEvent?.args?.[0];
  console.log("✅ Test SquadWallet created at:", testWalletAddress);

  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("=====================================");
  console.log("XPBadges:", xpBadgesAddress);
  console.log("GameManager:", gameManagerAddress);
  console.log("SquadWalletFactory:", squadWalletFactoryAddress);
  console.log("Test SquadWallet:", testWalletAddress);
  console.log("=====================================");

  // Save addresses to a file for frontend use
  const deploymentInfo = {
    network: "base",
    chainId: 8453,
    contracts: {
      XPBadges: xpBadgesAddress,
      GameManager: gameManagerAddress,
      SquadWalletFactory: squadWalletFactoryAddress,
      TestSquadWallet: testWalletAddress
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    vrfConfig: {
      coordinator: VRF_COORDINATOR,
      keyHash: KEY_HASH,
      subscriptionId: SUBSCRIPTION_ID
    }
  };

  const fs = require("fs");
  fs.writeFileSync(
    "../deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment-info.json");

  // Verification instructions
  console.log("\n🔍 To verify contracts on BaseScan, run:");
  console.log(`npx hardhat verify --network base ${xpBadgesAddress}`);
  console.log(`npx hardhat verify --network base ${gameManagerAddress} "${VRF_COORDINATOR}" ${SUBSCRIPTION_ID} "${KEY_HASH}"`);
  console.log(`npx hardhat verify --network base ${squadWalletFactoryAddress} "${xpBadgesAddress}" "${gameManagerAddress}"`);

  console.log("\n✨ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
