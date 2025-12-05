import { ethers } from 'ethers';
import {
  NINELIVES_ADDRESS,
  NINELIVES_ABI,
} from '../contracts/nineLives';

const DEFAULT_RPC_URL = 'https://sepolia.base.org';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/* =========================================================
   REAL ON-CHAIN IMPLEMENTATION
   ========================================================= */

function getProvider() {
  const url = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || DEFAULT_RPC_URL;
  return new ethers.JsonRpcProvider(url);
}

function getRealContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const p = signerOrProvider ?? getProvider();
  return new ethers.Contract(NINELIVES_ADDRESS, NINELIVES_ABI, p);
}

/* =========================================================
   MOCK IMPLEMENTATION (localStorage)
   ========================================================= */

const MOCK_KEY_PREFIX = 'nineLives_mock_cat_';
const DAY_SECONDS = 86400;

type MockCat = {
  lives: bigint;
  streak: bigint;
  stage: bigint;
  lastCheckIn: bigint;
  exists: boolean;
};

async function getMockKey(signer: ethers.Signer): Promise<string> {
  const addr = (await signer.getAddress()).toLowerCase();
  return `${MOCK_KEY_PREFIX}${addr}`;
}

async function loadMockCat(signer: ethers.Signer): Promise<MockCat | null> {
  const key = await getMockKey(signer);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return {
    lives: BigInt(parsed.lives),
    streak: BigInt(parsed.streak),
    stage: BigInt(parsed.stage),
    lastCheckIn: BigInt(parsed.lastCheckIn),
    exists: Boolean(parsed.exists),
  };
}

async function saveMockCat(signer: ethers.Signer, cat: MockCat): Promise<void> {
  const key = await getMockKey(signer);
  localStorage.setItem(
    key,
    JSON.stringify({
      lives: cat.lives.toString(),
      streak: cat.streak.toString(),
      stage: cat.stage.toString(),
      lastCheckIn: cat.lastCheckIn.toString(),
      exists: cat.exists,
    })
  );
}

function computeStage(streak: bigint): bigint {
  if (streak >= 21n) return 3n;
  if (streak >= 14n) return 2n;
  if (streak >= 7n) return 1n;
  return 0n;
}

/* =========================================================
   EXPORTED FUNCTIONS (they switch between mock / real)
   ========================================================= */

export async function createCat(signer: ethers.Signer): Promise<void> {
  if (USE_MOCK) {
    const existing = await loadMockCat(signer);
    if (existing?.exists) {
      throw new Error('Cat already exists');
    }
    const now = BigInt(Math.floor(Date.now() / 1000));
    const cat: MockCat = {
      lives: 9n,
      streak: 0n,
      stage: 0n,
      lastCheckIn: now,
      exists: true,
    };
    await saveMockCat(signer, cat);
    return;
  }

  const contract = getRealContract(signer);
  const tx = await contract.createCat();
  await tx.wait();
}

export async function checkIn(
  signer: ethers.Signer
): Promise<{ streak: number; stage: number }> {
  if (USE_MOCK) {
    const cat = await loadMockCat(signer);
    if (!cat || !cat.exists) {
      throw new Error('Cat does not exist');
    }
    const now = BigInt(Math.floor(Date.now() / 1000));
    const since = now - cat.lastCheckIn;
    if (since < BigInt(DAY_SECONDS)) {
      throw new Error('Already checked in today');
    }

    const newStreak = cat.streak + 1n;
    const newStage = computeStage(newStreak);
    const updated: MockCat = {
      ...cat,
      streak: newStreak,
      stage: newStage,
      lastCheckIn: now,
    };
    await saveMockCat(signer, updated);

    return {
      streak: Number(newStreak),
      stage: Number(newStage),
    };
  }

  const contract = getRealContract(signer);
  const tx = await contract.checkIn();
  await tx.wait();

  const owner = await signer.getAddress();
  const cat = await contract.cats(owner);

  return {
    streak: Number(cat.streak),
    stage: Number(cat.stage),
  };
}

export async function restoreLife(signer: ethers.Signer): Promise<void> {
  if (USE_MOCK) {
    const cat = await loadMockCat(signer);
    if (!cat || !cat.exists) throw new Error('Cat does not exist');

    const updated: MockCat = {
      ...cat,
      lives: cat.lives < 9n ? cat.lives + 1n : cat.lives,
    };
    await saveMockCat(signer, updated);
    return;
  }

  const contract = getRealContract(signer);
  const tx = await contract.restoreLife();
  await tx.wait();
}

export async function loseLife(signer: ethers.Signer): Promise<void> {
  if (USE_MOCK) {
    const cat = await loadMockCat(signer);
    if (!cat || !cat.exists) throw new Error('Cat does not exist');

    const updated: MockCat = {
      ...cat,
      lives: cat.lives > 0n ? cat.lives - 1n : 0n,
    };
    await saveMockCat(signer, updated);
    return;
  }

  const contract = getRealContract(signer);
  if (!('loseLife' in contract)) {
    throw new Error('loseLife is not implemented on this contract');
  }
  // @ts-ignore
  const tx = await contract.loseLife();
  await tx.wait();
}

/* ---- Read helpers used by useCat ---- */

export async function hasCat(signer: ethers.Signer): Promise<boolean> {
  if (USE_MOCK) {
    const cat = await loadMockCat(signer);
    return Boolean(cat && cat.exists);
  }

  const contract = getRealContract(signer);
  const owner = await signer.getAddress();
  const cat = await contract.cats(owner);
  return Boolean(cat.exists);
}

export async function getCat(signer: ethers.Signer) {
  if (USE_MOCK) {
    const cat = await loadMockCat(signer);
    if (!cat) {
      throw new Error('Cat does not exist');
    }
    return cat;
  }

  const contract = getRealContract(signer);
  const owner = await signer.getAddress();
  const cat = await contract.cats(owner);

  return {
    lives: cat.lives as bigint,
    streak: cat.streak as bigint,
    stage: cat.stage as bigint,
    lastCheckIn: cat.lastCheckIn as bigint,
    exists: Boolean(cat.exists),
  };
}

export async function timeUntilNextCheckIn(
  signer: ethers.Signer
): Promise<bigint> {
  if (USE_MOCK) {
    const cat = await loadMockCat(signer);
    if (!cat) return 0n;

    const now = BigInt(Math.floor(Date.now() / 1000));
    const since = now - cat.lastCheckIn;
    const day = BigInt(DAY_SECONDS);
    if (since >= day) return 0n;
    return day - since;
  }

  const contract = getRealContract(signer);
  const owner = await signer.getAddress();
  const seconds: bigint = await contract.timeUntilNextCheckIn(owner);
  return seconds;
}