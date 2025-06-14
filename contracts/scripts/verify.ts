import { run } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("🔍 Verifying contracts on BaseScan...");

  // Load deployment info
  const deploymentPath = "../deployment-info.json";
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployment-info.json not found. Deploy contracts first.");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contracts = deploymentInfo.contracts;

  try {
    // Verify XPBadges
    console.log("📜 Verifying XPBadges...");
    await run("verify:verify", {
      address: contracts.XPBadges,
      constructorArguments: []
    });
    console.log("✅ XPBadges verified");

    // Verify GameManager
    console.log("🎮 Verifying GameManager...");
    await run("verify:verify", {
      address: contracts.GameManager,
      constructorArguments: [
        deploymentInfo.vrfConfig.coordinator,
        deploymentInfo.vrfConfig.subscriptionId,
        deploymentInfo.vrfConfig.keyHash
      ]
    });
    console.log("✅ GameManager verified");

    // Verify SquadWalletFactory
    console.log("🏭 Verifying SquadWalletFactory...");
    await run("verify:verify", {
      address: contracts.SquadWalletFactory,
      constructorArguments: [
        contracts.XPBadges,
        contracts.GameManager
      ]
    });
    console.log("✅ SquadWalletFactory verified");

    console.log("\n🎉 All contracts verified successfully!");
    console.log("\n📋 Verified contracts:");
    console.log(`• XPBadges: https://basescan.org/address/${contracts.XPBadges}`);
    console.log(`• GameManager: https://basescan.org/address/${contracts.GameManager}`);
    console.log(`• SquadWalletFactory: https://basescan.org/address/${contracts.SquadWalletFactory}`);

  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
