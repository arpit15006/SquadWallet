import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: "../.env" });

async function main() {
  console.log("🚀 Starting SquadWallet deployment...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  if (parseFloat(ethers.formatEther(await ethers.provider.getBalance(deployer.address))) < 0.001) {
    console.log("❌ Insufficient balance for deployment. Need at least 0.001 ETH");
    return;
  }

  // Deploy XPBadges contract first
  console.log("\n📜 Deploying XPBadges contract...");
  const XPBadges = await ethers.getContractFactory("XPBadges");
  const xpBadges = await XPBadges.deploy();
  await xpBadges.waitForDeployment();
  const xpBadgesAddress = await xpBadges.getAddress();
  console.log("✅ XPBadges deployed to:", xpBadgesAddress);

  // Deploy a simplified GameManager without VRF for now
  console.log("\n🎮 Deploying MockGameManager contract...");
  const MockGameManager = await ethers.getContractFactory("MockGameManager");
  const gameManager = await MockGameManager.deploy();
  await gameManager.waitForDeployment();
  const gameManagerAddress = await gameManager.getAddress();
  console.log("✅ MockGameManager deployed to:", gameManagerAddress);

  // Deploy SquadWallet Factory
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
  try {
    await xpBadges.setAgentAuthorization(squadWalletFactoryAddress, true);
    console.log("✅ Authorized SquadWalletFactory to award XP");
    
    await xpBadges.setAgentAuthorization(gameManagerAddress, true);
    console.log("✅ Authorized GameManager to award XP");
  } catch (error) {
    console.log("⚠️  Permission setup failed, but contracts are deployed");
  }

  // Deploy a test SquadWallet
  console.log("\n🧪 Creating test SquadWallet...");
  try {
    const testWalletTx = await squadWalletFactory.createSquadWallet(
      "Test Squad",
      [deployer.address],
      ["Test User"]
    );
    const receipt = await testWalletTx.wait();
    console.log("✅ Test SquadWallet created successfully");
  } catch (error) {
    console.log("⚠️  Test wallet creation failed, but factory is deployed");
  }

  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("=====================================");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("XPBadges:", xpBadgesAddress);
  console.log("GameManager:", gameManagerAddress);
  console.log("SquadWalletFactory:", squadWalletFactoryAddress);
  console.log("=====================================");

  // Save addresses to a file for frontend use
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contracts: {
      XPBadges: xpBadgesAddress,
      GameManager: gameManagerAddress,
      SquadWalletFactory: squadWalletFactoryAddress
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "../deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment-info.json");

  // Update .env file with contract addresses
  console.log("\n📝 Updating .env file with contract addresses...");
  try {
    let envContent = fs.readFileSync("../.env", "utf8");
    
    envContent = envContent.replace(
      /SQUAD_WALLET_FACTORY=.*/,
      `SQUAD_WALLET_FACTORY=${squadWalletFactoryAddress}`
    );
    envContent = envContent.replace(
      /GAME_MANAGER_CONTRACT=.*/,
      `GAME_MANAGER_CONTRACT=${gameManagerAddress}`
    );
    envContent = envContent.replace(
      /XP_BADGES_CONTRACT=.*/,
      `XP_BADGES_CONTRACT=${xpBadgesAddress}`
    );
    envContent = envContent.replace(
      /VITE_SQUAD_WALLET_FACTORY=.*/,
      `VITE_SQUAD_WALLET_FACTORY=${squadWalletFactoryAddress}`
    );
    envContent = envContent.replace(
      /VITE_GAME_MANAGER_CONTRACT=.*/,
      `VITE_GAME_MANAGER_CONTRACT=${gameManagerAddress}`
    );
    envContent = envContent.replace(
      /VITE_XP_BADGES_CONTRACT=.*/,
      `VITE_XP_BADGES_CONTRACT=${xpBadgesAddress}`
    );
    
    fs.writeFileSync("../.env", envContent);
    console.log("✅ .env file updated with contract addresses");
  } catch (error) {
    console.log("⚠️  Could not update .env file automatically");
    console.log("Please manually add these addresses to your .env file:");
    console.log(`SQUAD_WALLET_FACTORY=${squadWalletFactoryAddress}`);
    console.log(`GAME_MANAGER_CONTRACT=${gameManagerAddress}`);
    console.log(`XP_BADGES_CONTRACT=${xpBadgesAddress}`);
    console.log(`VITE_SQUAD_WALLET_FACTORY=${squadWalletFactoryAddress}`);
    console.log(`VITE_GAME_MANAGER_CONTRACT=${gameManagerAddress}`);
    console.log(`VITE_XP_BADGES_CONTRACT=${xpBadgesAddress}`);
  }

  // Verification instructions
  if (process.env.BASESCAN_API_KEY) {
    console.log("\n🔍 To verify contracts on BaseScan, run:");
    console.log(`npm run verify`);
  } else {
    console.log("\n⚠️  Add BASESCAN_API_KEY to .env to verify contracts");
  }

  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Verify contracts on BaseScan (if API key is set)");
  console.log("2. Test the frontend: cd ../frontend && npm run dev");
  console.log("3. Set up the agent with XMTP and AgentKit keys");
  console.log("4. Create demo content and test all functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
