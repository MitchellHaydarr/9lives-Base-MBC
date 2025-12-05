import { ethers } from "ethers";
import { NINELIVES_ADDRESS, NINELIVES_ABI } from "../contracts/nineLives";

// Helper to connect to the contract
export function getNineLivesContract(signer: ethers.Signer) {
  return new ethers.Contract(NINELIVES_ADDRESS, NINELIVES_ABI, signer);
}

// Create a new cat for the connected wallet
export async function createCat(signer: ethers.Signer) {
  const contract = getNineLivesContract(signer);
  const tx = await contract.createCat();
  await tx.wait();
}

// Daily check-in
export async function checkIn(signer: ethers.Signer) {
  const contract = getNineLivesContract(signer);
  const tx = await contract.checkIn();
  await tx.wait();

  const owner = await signer.getAddress();
  const cat = await contract.cats(owner);

  return {
    lives: Number(cat.lives),
    streak: Number(cat.streak),
    stage: Number(cat.stage),
  };
}

// Restore life using USDC payment
export async function restoreLife(signer: ethers.Signer) {
  const contract = getNineLivesContract(signer);
  const tx = await contract.restoreLife();
  await tx.wait();
}
