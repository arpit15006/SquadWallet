import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("📝 Account:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
}

main().catch(console.error);
