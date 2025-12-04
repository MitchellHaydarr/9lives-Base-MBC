import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface Cat {
  lives: number;
  streak: number;
  stage: number;
  lastCheckIn: bigint;
  exists: boolean;
}

interface UseCatReturn {
  cat: Cat | null;
  loading: boolean;
  error: string | null;
  canCheckIn: boolean;
  hasCat: boolean;
  refreshCat: () => Promise<void>;
}

// Temporary mock contract functions for development
// These will be replaced with real contract calls when deployed
const mockContract = {
  hasCat: async (address: string): Promise<boolean> => {
    // Check localStorage for mock data
    const mockData = localStorage.getItem(`cat_${address}`);
    return mockData !== null;
  },
  getCat: async (address: string): Promise<Cat> => {
    const mockData = localStorage.getItem(`cat_${address}`);
    if (mockData) {
      return JSON.parse(mockData);
    }
    throw new Error('Cat does not exist');
  },
  timeUntilNextCheckIn: async (address: string): Promise<bigint> => {
    const mockData = localStorage.getItem(`cat_${address}`);
    if (mockData) {
      const cat = JSON.parse(mockData);
      const lastCheckIn = BigInt(cat.lastCheckIn);
      const now = BigInt(Math.floor(Date.now() / 1000));
      const dayInSeconds = BigInt(86400);
      const timeSince = now - lastCheckIn;
      
      if (timeSince >= dayInSeconds) {
        return BigInt(0);
      }
      return dayInSeconds - timeSince;
    }
    return BigInt(0);
  }
};

export const useCat = (address: string | undefined, contract?: ethers.Contract): UseCatReturn => {
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [hasCat, setHasCat] = useState(false);

  const refreshCat = useCallback(async () => {
    if (!address) {
      setCat(null);
      setHasCat(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use real contract if available, otherwise use mock
      const contractToUse = contract || mockContract;

      // Check if cat exists
      const exists = await contractToUse.hasCat(address);
      setHasCat(exists);

      if (exists) {
        // Get cat data
        const catData = await contractToUse.getCat(address);
        
        // Convert BigInt to number for display
        const formattedCat: Cat = {
          lives: typeof catData.lives === 'bigint' ? Number(catData.lives) : catData.lives,
          streak: typeof catData.streak === 'bigint' ? Number(catData.streak) : catData.streak,
          stage: typeof catData.stage === 'bigint' ? Number(catData.stage) : catData.stage,
          lastCheckIn: typeof catData.lastCheckIn === 'bigint' ? catData.lastCheckIn : BigInt(catData.lastCheckIn),
          exists: catData.exists
        };

        setCat(formattedCat);

        // Check if can check in
        const timeUntilNext = await contractToUse.timeUntilNextCheckIn(address);
        setCanCheckIn(timeUntilNext === BigInt(0));
      } else {
        setCat(null);
        setCanCheckIn(false);
      }
    } catch (err: any) {
      console.error('Error loading cat:', err);
      setError(err.message || 'Failed to load cat data');
      setCat(null);
      setHasCat(false);
    } finally {
      setLoading(false);
    }
  }, [address, contract]);

  useEffect(() => {
    refreshCat();

    // Set up polling for updates every 30 seconds
    const interval = setInterval(refreshCat, 30000);

    return () => clearInterval(interval);
  }, [refreshCat]);

  return {
    cat,
    loading,
    error,
    canCheckIn,
    hasCat,
    refreshCat
  };
};
