import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';

import CatIdleAnimation from './components/CatIdleAnimation';
import HeartsDisplay from './components/HeartsDisplay';
import Controls from './components/Controls';
import FriendsPage from './components/FriendsPage';
import TreasurePage from './components/TreasurePage';
import SettingsPage from './components/SettingsPage';

import * as contractFunctions from './Examples/contractIntegration';
import { useCat } from './hooks/useCat';

// 👇 Turn this ON for your demo video, OFF for real on-chain behaviour
const DEMO_MODE = true;

type TabKey = 'home' | 'friends' | 'treasure' | 'settings';

type DemoCat = {
  lives: number;
  streak: number;
  stage: number;
};

function App() {
  const [account, setAccount] = useState('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // 👇 demo-only cat state (ignored when DEMO_MODE = false)
  const [demoCat, setDemoCat] = useState<DemoCat | null>(null);

  // Real contract-backed state (used when DEMO_MODE = false)
  const { cat, hasCat, refreshCat } = useCat(account, signer);

  // Pick which cat to show
  const currentCat = DEMO_MODE ? demoCat : (cat as any | null);
  const currentHasCat = DEMO_MODE ? !!demoCat : hasCat;
  const currentLives = currentCat?.lives ?? 0;

  // -----------------------------
  // Connect Wallet
  // -----------------------------
  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const accounts: string[] = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(ethereum);
      const newSigner = await provider.getSigner();

      setSigner(newSigner);
      setAccount(accounts[0]);
    } catch (err: any) {
      setError(err.message || 'Wallet connection failed');
    }

    setLoading(false);
  }, []);

  // -----------------------------
  // Disconnect Wallet
  // -----------------------------
  const disconnectWallet = () => {
    setAccount('');
    setSigner(null);
    setTxStatus('');
    setError('');
    setDemoCat(null); // clear demo cat too
  };

  // -----------------------------
  // Create Cat
  // -----------------------------
  const handleCreateCat = async () => {
    // DEMO: just create a fake cat in memory
    if (DEMO_MODE) {
      if (!demoCat) {
        setDemoCat({
          lives: 9,
          streak: 0,
          stage: 0,
        });
        setTxStatus('Cat created! (demo mode)');
      } else {
        setTxStatus('You already have a cat (demo)');
      }
      setTimeout(() => setTxStatus(''), 2500);
      return;
    }

    // REAL: call contract
    if (!signer) return;

    setLoading(true);
    setTxStatus('Creating your cat...');
    setError('');

    try {
      await contractFunctions.createCat(signer);
      setTxStatus('Cat created successfully!');
      await refreshCat();
    } catch (err: any) {
      setError(err.message || 'Create cat failed');
    }

    setLoading(false);
    setTimeout(() => setTxStatus(''), 2500);
  };

  // -----------------------------
  // Check In
  // -----------------------------
  const handleCheckIn = async () => {
    if (!signer) return;

    setLoading(true);
    setTxStatus('Checking in...');
    setError('');

    // DEMO: increment local streak + evolve
    if (DEMO_MODE) {
      if (!demoCat) {
        setLoading(false);
        setError('Create a cat first (demo)');
        return;
      }

      const newStreak = demoCat.streak + 1;

      // simple evolution logic for the video
      let newStage = demoCat.stage;
      if (newStreak >= 3 && newStreak < 7) newStage = 1;       // young cat
      else if (newStreak >= 7 && newStreak < 14) newStage = 2; // adult
      else if (newStreak >= 14) newStage = 3;                  // elder

      setDemoCat({
        ...demoCat,
        streak: newStreak,
        stage: newStage,
      });

      setLoading(false);
      setTxStatus(`Checked in! Streak: ${newStreak} (demo)`);
      setTimeout(() => setTxStatus(''), 2500);
      return;
    }

    // REAL: call contract
    try {
      const result = await contractFunctions.checkIn(signer);
      setTxStatus(`Checked in! Streak: ${result.streak}`);
      await refreshCat();
    } catch (err: any) {
      // keep your nicer error messages here if you added them
      setError(err.message || 'Check-in failed');
    }

    setLoading(false);
    setTimeout(() => setTxStatus(''), 2500);
  };

  // -----------------------------
  // Restore Life
  // -----------------------------
  const handleRestoreLife = async () => {
    if (!signer) return;

    setLoading(true);
    setTxStatus('Restoring life...');
    setError('');

    // DEMO: just bump lives up to 9
    if (DEMO_MODE) {
      if (!demoCat) {
        setLoading(false);
        setError('Create a cat first (demo)');
        return;
      }

      const newLives = Math.min(9, demoCat.lives + 1);
      setDemoCat({
        ...demoCat,
        lives: newLives,
      });

      setLoading(false);
      setTxStatus('Life restored! (demo, costs 1 USDC)');
      setTimeout(() => setTxStatus(''), 2500);
      return;
    }

    // REAL: call contract
    try {
      await contractFunctions.restoreLife(signer);
      setTxStatus('Life restored!');
      await refreshCat();
    } catch (err: any) {
      setError(err.message || 'Failed to restore life');
    }

    setLoading(false);
    setTimeout(() => setTxStatus(''), 2500);
  };

  // -----------------------------
  // Debug: Lose Life
  // -----------------------------
  const handleLoseLife = async () => {
    if (!signer) return;

    setLoading(true);
    setTxStatus('');
    setError('');

    // DEMO: just decrement lives
    if (DEMO_MODE) {
      if (!demoCat) {
        setLoading(false);
        setError('Create a cat first (demo)');
        return;
      }

      const newLives = Math.max(0, demoCat.lives - 1);
      setDemoCat({
        ...demoCat,
        lives: newLives,
      });

      setLoading(false);
      setTxStatus('Life lost (demo)');
      setTimeout(() => setTxStatus(''), 2500);
      return;
    }

    // REAL: call contract
    try {
      await contractFunctions.loseLife(signer);
      setTxStatus('Life lost');
      await refreshCat();
    } catch (err: any) {
      setError(err.message || 'Failed to lose life');
    }

    setLoading(false);
    setTimeout(() => setTxStatus(''), 2500);
  };

  // -----------------------------
  // Auto-connect
  // -----------------------------
  useEffect(() => {
    async function checkConnection() {
      const ethereum = (window as any).ethereum;
      if (!ethereum) return;

      const accounts: string[] = await ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        connectWallet();
      }
    }

    checkConnection();
  }, [connectWallet]);

  // -----------------------------
  // Home page
  // -----------------------------
  const renderHomePage = () => (
    <div className="home-page">
      {!account ? (
        <div className="connect-prompt">
          <p>Connect your wallet to start</p>
        </div>
      ) : (
        <>
          {currentHasCat && currentCat ? (
            <>
              <div className="stats-section">
                <div className="stat">
                  <span className="stat-label">Streak</span>
                  <span className="stat-value">{currentCat.streak} days</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Stage</span>
                  <span className="stat-value">
                    {currentCat.stage === 0 && 'Kitten'}
                    {currentCat.stage === 1 && 'Young Cat'}
                    {currentCat.stage === 2 && 'Adult Cat'}
                    {currentCat.stage === 3 && 'Elder Cat'}
                  </span>
                </div>
              </div>

              <div className="cat-frame">
                <CatIdleAnimation
                  stage={currentCat.stage}
                  isGhost={currentLives === 0}
                  size={200}
                />
              </div>

              <HeartsDisplay lives={currentLives} />
            </>
          ) : (
            <div className="no-cat">
              <p className="no-cat-message">You don't have a cat yet!</p>
              <p className="no-cat-hint">Create one to begin</p>
            </div>
          )}

          <Controls
            hasCat={currentHasCat}
            lives={currentLives}
            onCreateCat={handleCreateCat}
            onCheckIn={handleCheckIn}
            onRestoreLife={handleRestoreLife}
            onLoseLife={handleLoseLife}
            loading={loading}
          />
        </>
      )}
    </div>
  );

  // -----------------------------
  // Main shell
  // -----------------------------
  return (
    <div className="app-wrapper">
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-title">9Lives</h1>

          <div className="wallet-section">
            {account ? (
              <div className="wallet-info">
                <span className="wallet-address">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button className="btn-disconnect" onClick={disconnectWallet}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                className="btn-connect"
                onClick={connectWallet}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </header>

        <nav className="tab-bar">
          <button
            className={`tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
          <button
            className={`tab ${activeTab === 'treasure' ? 'active' : ''}`}
            onClick={() => setActiveTab('treasure')}
          >
            Treasure
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>

        <main className="app-content">
          {activeTab === 'home' && renderHomePage()}
          {activeTab === 'friends' && <FriendsPage />}
          {activeTab === 'treasure' && <TreasurePage />}
          {activeTab === 'settings' && <SettingsPage />}

          {txStatus && <div className="status-message success">{txStatus}</div>}
          {error && <div className="status-message error">{error}</div>}
        </main>
      </div>
    </div>
  );
}

export default App;