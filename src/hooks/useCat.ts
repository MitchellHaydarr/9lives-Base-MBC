import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import * as contractFunctions from '../Examples/contractIntegration';

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

export const useCat = (
  address: string | undefined,
  signer: ethers.Signer | null
): UseCatReturn => {
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [hasCat, setHasCat] = useState(false);

  const refreshCat = useCallback(async () => {
    if (!address || !signer) {
      setCat(null);
      setHasCat(false);
      setCanCheckIn(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ these must exist in contractIntegration
      const exists = await contractFunctions.hasCat(signer);
      setHasCat(exists);

      if (exists) {
        const catData = await contractFunctions.getCat(signer);

        const formattedCat: Cat = {
          lives:
            typeof catData.lives === 'bigint'
              ? Number(catData.lives)
              : catData.lives,
          streak:
            typeof catData.streak === 'bigint'
              ? Number(catData.streak)
              : catData.streak,
          stage:
            typeof catData.stage === 'bigint'
              ? Number(catData.stage)
              : catData.stage,
          lastCheckIn:
            typeof catData.lastCheckIn === 'bigint'
              ? catData.lastCheckIn
              : BigInt(catData.lastCheckIn),
          exists: catData.exists,
        };

        setCat(formattedCat);

        const timeUntilNext = await contractFunctions.timeUntilNextCheckIn(
          signer
        );
        setCanCheckIn(timeUntilNext === 0n);
      } else {
        setCat(null);
        setCanCheckIn(false);
      }
    } catch (err: any) {
      console.error('Error loading cat:', err);
      setError(err.message || 'Failed to load cat data');
      setCat(null);
      setHasCat(false);
      setCanCheckIn(false);
    } finally {
      setLoading(false);
    }
  }, [address, signer]);

  useEffect(() => {
    refreshCat();
    const interval = setInterval(refreshCat, 30000);
    return () => clearInterval(interval);
  }, [refreshCat]);

  return {
    cat,
    loading,
    error,
    canCheckIn,
    hasCat,
    refreshCat,
  };
};