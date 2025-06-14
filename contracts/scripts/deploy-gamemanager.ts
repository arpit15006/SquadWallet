import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: "../.env" });

async function main() {
  console.log("🎮 Deploying fixed GameManager contract...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📝 Deploying with account:", deployer.address);
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  if (parseFloat(ethers.formatEther(await ethers.provider.getBalance(deployer.address))) < 0.01) {
    console.log("❌ Insufficient balance for deployment. Need at least 0.01 ETH");
    return;
  }

  // VRF Configuration for Base Sepolia
  const VRF_COORDINATOR = "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE";
  const KEY_HASH = "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805";
  const SUBSCRIPTION_ID = 1;

  console.log("\n🎯 VRF Configuration:");
  console.log("VRF Coordinator:", VRF_COORDINATOR);
  console.log("Key Hash:", KEY_HASH);
  console.log("Subscription ID:", SUBSCRIPTION_ID);

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

  // Test the getGame function
  console.log("\n🧪 Testing getGame function...");
  try {
    const gameCount = await gameManager.gameCount();
    console.log("📊 Current game count:", gameCount.toString());
    
    if (gameCount > 0) {
      const game = await gameManager.getGame(0);
      console.log("✅ getGame(0) works! Game data:", {
        id: game[0].toString(),
        creator: game[1],
        gameType: game[2].toString(),
        wager: ethers.formatEther(game[3]),
        totalPot: ethers.formatEther(game[4]),
        playersCount: game[5].length,
        state: game[6].toString(),
        createdAt: game[7].toString(),
        winner: game[8]
      });
    } else {
      console.log("ℹ️  No games exist yet, but getGame function is ready");
    }
  } catch (error) {
    console.log("❌ getGame test failed:", error);
  }

  // Summary
  console.log("\n🎉 GameManager Deployment Summary:");
  console.log("=====================================");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("GameManager:", gameManagerAddress);
  console.log("=====================================");

  // Update .env file with new GameManager address
  console.log("\n📝 Updating .env file with new GameManager address...");
  try {
    let envContent = fs.readFileSync("../.env", "utf8");
    
    envContent = envContent.replace(
      /GAME_MANAGER_CONTRACT=.*/,
      `GAME_MANAGER_CONTRACT=${gameManagerAddress}`
    );
    envContent = envContent.replace(
      /VITE_GAME_MANAGER_CONTRACT=.*/,
      `VITE_GAME_MANAGER_CONTRACT=${gameManagerAddress}`
    );
    
    fs.writeFileSync("../.env", envContent);
    console.log("✅ .env file updated with new GameManager address");
  } catch (error) {
    console.log("⚠️  Could not update .env file automatically");
    console.log("Please manually update these in your .env file:");
    console.log(`GAME_MANAGER_CONTRACT=${gameManagerAddress}`);
    console.log(`VITE_GAME_MANAGER_CONTRACT=${gameManagerAddress}`);
  }

  console.log("\n✨ GameManager deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Restart the agent to use the new contract");
  console.log("2. Test game creation and joining");
  console.log("3. Verify the contract on BaseScan if needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ GameManager deployment failed:", error);
    process.exit(1);
  });
