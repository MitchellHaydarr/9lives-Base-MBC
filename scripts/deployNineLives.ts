import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

/**
 * Deploy NineLives contract to Base Sepolia
 * Usage: npx hardhat run scripts/deployNineLives.ts --network baseSepolia
 */
async function main() {
  console.log("🚀 Starting NineLives deployment...");

  // Validate environment variables
  const usdcAddress = process.env.USDC_ADDRESS;
  const treasuryAddress = process.env.TREASURY_ADDRESS;

  if (!usdcAddress || !treasuryAddress) {
    throw new Error(
      "Missing required environment variables. Please check your .env file."
    );
  }

  console.log("Configuration:");
  console.log("  USDC Address:", usdcAddress);
  console.log("  Treasury Address:", treasuryAddress);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("  Deployer Address:", deployer.address);

  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("  Deployer Balance:", ethers.formatEther(balance), "ETH");

  // Deploy the contract
  console.log("\n📝 Deploying NineLives contract...");
  const NineLives = await ethers.getContractFactory("NineLives");
  const nineLives = await NineLives.deploy(usdcAddress, treasuryAddress);

  // Wait for deployment
  await nineLives.waitForDeployment();
  const contractAddress = await nineLives.getAddress();

  console.log("✅ NineLives deployed to:", contractAddress);

  // Save deployment information
  const deploymentInfo = {
    contract: "NineLives",
    address: contractAddress,
    network: "baseSepolia",
    chainId: 84532,
    usdcAddress: usdcAddress,
    treasuryAddress: treasuryAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to JSON file
  const deploymentPath = path.join(
    deploymentsDir,
    `NineLives_baseSepolia.json`
  );
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 Deployment info saved to:", deploymentPath);

  // Save contract address for frontend
  const frontendPath = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath, { recursive: true });
  }

  const contractAddresses = {
    NineLives: contractAddress,
    USDC: usdcAddress,
    Treasury: treasuryAddress,
  };

  fs.writeFileSync(
    path.join(frontendPath, "addresses.json"),
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("📱 Contract addresses saved for frontend");

  // Copy ABI to frontend
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "NineLives.sol",
    "NineLives.json"
  );
  
  // Wait a moment for artifacts to be generated
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(frontendPath, "NineLives.abi.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log("📋 ABI copied to frontend");
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Verify the contract on Base Sepolia explorer");
  console.log("2. Test the contract functions");
  console.log("3. Integrate with your React frontend");
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
