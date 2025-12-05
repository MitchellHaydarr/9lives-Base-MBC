const hre = require("hardhat");

async function main() {
  const USDC_ADDRESS = process.env.USDC_ADDRESS;
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;

  console.log("Deploying NineLives...");
  console.log("USDC:", USDC_ADDRESS);
  console.log("Treasury:", TREASURY_ADDRESS);

  const NineLives = await hre.ethers.getContractFactory("NineLives");

  // ethers v6 style deploy
  const contract = await NineLives.deploy(USDC_ADDRESS, TREASURY_ADDRESS);

  // wait until it’s actually mined
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("NineLives deployed at:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});