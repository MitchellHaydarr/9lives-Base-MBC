/**
 * Frontend Integration Examples for NineLives Contract
 * 
 * This file demonstrates how to interact with the NineLives smart contract
 * from your React application using ethers.js v6
 */

import { ethers, Contract } from 'ethers';

// Import contract ABI and addresses (these will be generated after deployment)
import NineLivesABI from '../contracts/NineLives.abi.json';
import contractAddresses from '../contracts/addresses.json';

// TypeScript interfaces for the contract
interface Cat {
  lives: number;
  streak: number;
  stage: number;
  lastCheckIn: bigint;
  exists: boolean;
}

/**
 * Connect to the user's wallet and get the signer
 */
async function connectWallet(): Promise<ethers.Signer> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Create provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Verify network (Base Sepolia chainId: 84532)
  const network = await provider.getNetwork();
  if (network.chainId !== 84532n) {
    try {
      // Try to switch to Base Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14A34' }], // 84532 in hex
      });
    } catch (error: any) {
      // If the chain doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x14A34',
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.base.org'],
            blockExplorerUrls: ['https://sepolia.basescan.org'],
          }],
        });
      } else {
        throw error;
      }
    }
  }

  return signer;
}

/**
 * Get contract instances
 */
async function getContracts(signer: ethers.Signer) {
  // NineLives contract
  const nineLivesContract = new Contract(
    contractAddresses.NineLives,
    NineLivesABI,
    signer
  );

  // USDC contract (minimal ERC20 ABI for approve)
  const usdcABI = [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
  ];
  
  const usdcContract = new Contract(
    contractAddresses.USDC,
    usdcABI,
    signer
  );

  return { nineLivesContract, usdcContract };
}

/**
 * Example: Create a new cat for the user
 */
export async function createCat(): Promise<string> {
  try {
    const signer = await connectWallet();
    const { nineLivesContract } = await getContracts(signer);

    // Check if cat already exists
    const userAddress = await signer.getAddress();
    const hasCat = await nineLivesContract.hasCat(userAddress);
    
    if (hasCat) {
      throw new Error('You already have a cat!');
    }

    // Create the cat
    const tx = await nineLivesContract.createCat();
    console.log('Transaction sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    return receipt.hash;
  } catch (error) {
    console.error('Error creating cat:', error);
    throw error;
  }
}

/**
 * Example: Daily check-in
 */
export async function checkIn(): Promise<{ streak: number; stage: number }> {
  try {
    const signer = await connectWallet();
    const { nineLivesContract } = await getContracts(signer);

    // Check if can check in
    const userAddress = await signer.getAddress();
    const timeUntilNext = await nineLivesContract.timeUntilNextCheckIn(userAddress);
    
    if (timeUntilNext > 0n) {
      const hours = Number(timeUntilNext) / 3600;
      throw new Error(`Please wait ${hours.toFixed(1)} hours before checking in again`);
    }

    // Perform check-in
    const tx = await nineLivesContract.checkIn();
    console.log('Check-in transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Check-in confirmed:', receipt.hash);

    // Get updated cat data
    const cat = await nineLivesContract.getCat(userAddress);
    
    return {
      streak: Number(cat.streak),
      stage: Number(cat.stage),
    };
  } catch (error) {
    console.error('Error checking in:', error);
    throw error;
  }
}

/**
 * Example: Restore a life using USDC
 */
export async function restoreLife(): Promise<string> {
  try {
    const signer = await connectWallet();
    const { nineLivesContract, usdcContract } = await getContracts(signer);

    const userAddress = await signer.getAddress();

    // Check current lives
    const cat = await nineLivesContract.getCat(userAddress);
    if (cat.lives >= 9) {
      throw new Error('Cat already has maximum lives!');
    }

    // Check USDC balance
    const usdcBalance = await usdcContract.balanceOf(userAddress);
    const RESTORE_COST = ethers.parseUnits('1', 6); // 1 USDC (6 decimals)
    
    if (usdcBalance < RESTORE_COST) {
      throw new Error('Insufficient USDC balance');
    }

    // Check current allowance
    const currentAllowance = await usdcContract.allowance(
      userAddress,
      contractAddresses.NineLives
    );

    // Approve USDC spending if needed
    if (currentAllowance < RESTORE_COST) {
      console.log('Approving USDC spending...');
      const approveTx = await usdcContract.approve(
        contractAddresses.NineLives,
        RESTORE_COST
      );
      await approveTx.wait();
      console.log('USDC approval confirmed');
    }

    // Restore life
    const tx = await nineLivesContract.restoreLife();
    console.log('Restore life transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Life restored successfully:', receipt.hash);

    return receipt.hash;
  } catch (error) {
    console.error('Error restoring life:', error);
    throw error;
  }
}

/**
 * Example: Get cat data
 */
export async function getCatData(address?: string): Promise<Cat | null> {
  try {
    const signer = await connectWallet();
    const { nineLivesContract } = await getContracts(signer);

    const targetAddress = address || await signer.getAddress();

    // Check if cat exists
    const hasCat = await nineLivesContract.hasCat(targetAddress);
    if (!hasCat) {
      return null;
    }

    // Get cat data
    const cat = await nineLivesContract.getCat(targetAddress);

    return {
      lives: Number(cat.lives),
      streak: Number(cat.streak),
      stage: Number(cat.stage),
      lastCheckIn: cat.lastCheckIn,
      exists: cat.exists,
    };
  } catch (error) {
    console.error('Error getting cat data:', error);
    throw error;
  }
}

/**
 * Example: Listen to contract events
 */
export function listenToEvents(
  onCatCreated?: (owner: string) => void,
  onCheckedIn?: (owner: string, streak: number, stage: number) => void,
  onLifeLost?: (owner: string, lives: number) => void,
  onLifeRestored?: (owner: string, lives: number) => void
) {
  connectWallet().then(async (signer) => {
    const { nineLivesContract } = await getContracts(signer);

    if (onCatCreated) {
      nineLivesContract.on('CatCreated', (owner: string) => {
        console.log('Cat created for:', owner);
        onCatCreated(owner);
      });
    }

    if (onCheckedIn) {
      nineLivesContract.on('CheckedIn', (owner: string, streak: bigint, stage: bigint) => {
        console.log(`Check-in: ${owner}, Streak: ${streak}, Stage: ${stage}`);
        onCheckedIn(owner, Number(streak), Number(stage));
      });
    }

    if (onLifeLost) {
      nineLivesContract.on('LifeLost', (owner: string, lives: bigint) => {
        console.log(`Life lost: ${owner}, Remaining: ${lives}`);
        onLifeLost(owner, Number(lives));
      });
    }

    if (onLifeRestored) {
      nineLivesContract.on('LifeRestored', (owner: string, lives: bigint) => {
        console.log(`Life restored: ${owner}, Total: ${lives}`);
        onLifeRestored(owner, Number(lives));
      });
    }
  });
}

/**
 * Example React Hook Usage:
 * 
 * import { useState, useEffect } from 'react';
 * import { getCatData, createCat, checkIn, restoreLife } from './contractIntegration';
 * 
 * function useCat() {
 *   const [cat, setCat] = useState(null);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     getCatData().then(setCat).finally(() => setLoading(false));
 *   }, []);
 * 
 *   const handleCreateCat = async () => {
 *     await createCat();
 *     const newCat = await getCatData();
 *     setCat(newCat);
 *   };
 * 
 *   const handleCheckIn = async () => {
 *     const result = await checkIn();
 *     const updatedCat = await getCatData();
 *     setCat(updatedCat);
 *     return result;
 *   };
 * 
 *   const handleRestoreLife = async () => {
 *     await restoreLife();
 *     const updatedCat = await getCatData();
 *     setCat(updatedCat);
 *   };
 * 
 *   return { cat, loading, handleCreateCat, handleCheckIn, handleRestoreLife };
 * }
 */
