import { useState, useEffect, useCallback } from 'react';
import { ethers, Contract } from 'ethers';
import './App.css';
import CatIdleAnimation from './components/CatIdleAnimation';
import HeartsDisplay from './components/HeartsDisplay';
import Controls from './components/Controls';
import FriendsPage from './components/FriendsPage';
import TreasurePage from './components/TreasurePage';
import SettingsPage from './components/SettingsPage';
import { useCat } from './hooks/useCat';

// background image for the cat frame (adjust path if needed)
import catBg from './assets/backgrounds/background1.png';

// Import contract integration functions when available
let contractFunctions: any = null;
try {
  contractFunctions = require('./examples/contractIntegration');
} catch (e) {
  console.log('Contract integration not yet available, using mock mode');
}

type TabKey = 'home' | 'friends' | 'treasure' | 'settings';

function App() {
  const [account, setAccount] = useState<string>('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Use the custom hook to manage cat state
  const { cat, hasCat, refreshCat } = useCat(account, contract || undefined);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed!');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Create provider and signer
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();

      setSigner(newSigner);
      setAccount(accounts[0]);

      // Try to load contract if ABI is available
      try {
        if (contractFunctions) {
          console.log('Contract functions available');
        }
      } catch (err) {
        console.log('Contract not yet deployed, running in demo mode');
      }
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    setAccount('');
    setSigner(null);
    setError('');
    setTxStatus('');
    // Clear any cached cat data for the disconnected account
    if (account) {
      localStorage.removeItem(`cat_${account}`);
    }
  }, [account]);

  // Create cat function
  const handleCreateCat = async () => {
    if (!account) return;

    setLoading(true);
    setTxStatus('Creating your cat...');
    setError('');

    try {
      if (contractFunctions && signer) {
        await contractFunctions.createCat();
      } else {
        // Mock mode for development
        const mockCat = {
          lives: 9,
          streak: 0,
          stage: 0,
          lastCheckIn: Math.floor(Date.now() / 1000).toString(),
          exists: true,
        };
        localStorage.setItem(`cat_${account}`, JSON.stringify(mockCat));
      }

      setTxStatus('Cat created successfully!');
      await refreshCat();
    } catch (err: any) {
      console.error('Failed to create cat:', err);
      setError(err.message || 'Failed to create cat');
    } finally {
      setLoading(false);
      setTimeout(() => setTxStatus(''), 3000);
    }
  };

  // Check in function
  const handleCheckIn = async () => {
    if (!account || !hasCat) return;

    setLoading(true);
    setTxStatus('Checking in...');
    setError('');

    try {
      if (contractFunctions && signer) {
        const result = await contractFunctions.checkIn();
        setTxStatus(
          `Checked in! Streak: ${result.streak}, Stage: ${result.stage}`,
        );
      } else {
        // Mock mode for development
        const mockData = localStorage.getItem(`cat_${account}`);
        if (mockData) {
          const cat = JSON.parse(mockData);
          cat.streak += 1;
          cat.lastCheckIn = Math.floor(Date.now() / 1000).toString();

          // Update stage based on streak
          if (cat.streak >= 12) cat.stage = 3;
          else if (cat.streak >= 7) cat.stage = 2;
          else if (cat.streak >= 3) cat.stage = 1;
          else cat.stage = 0;

          localStorage.setItem(`cat_${account}`, JSON.stringify(cat));
          setTxStatus(`Checked in! Streak: ${cat.streak}`);
        }
      }

      await refreshCat();
    } catch (err: any) {
      console.error('Failed to check in:', err);
      setError(err.message || 'Failed to check in');
    } finally {
      setLoading(false);
      setTimeout(() => setTxStatus(''), 3000);
    }
  };

  // Restore life function
  const handleRestoreLife = async () => {
    if (!account || !hasCat || !cat) return;

    setLoading(true);
    setTxStatus('Restoring life with USDC...');
    setError('');

    try {
      if (contractFunctions && signer) {
        await contractFunctions.restoreLife();
      } else {
        // Mock mode for development
        const mockData = localStorage.getItem(`cat_${account}`);
        if (mockData) {
          const catData = JSON.parse(mockData);
          if (catData.lives < 9) {
            catData.lives += 1;
            localStorage.setItem(`cat_${account}`, JSON.stringify(catData));
          }
        }
      }

      setTxStatus('Life restored!');
      await refreshCat();
    } catch (err: any) {
      console.error('Failed to restore life:', err);
      setError(err.message || 'Failed to restore life');
    } finally {
      setLoading(false);
      setTimeout(() => setTxStatus(''), 3000);
    }
  };

  // Lose life function for testing
  const handleLoseLife = async () => {
    if (!account || !hasCat || !cat || cat.lives === 0) return;

    setLoading(true);
    setError('');

    try {
      const mockData = localStorage.getItem(`cat_${account}`);
      if (mockData) {
        const catData = JSON.parse(mockData);
        if (catData.lives > 0) {
          catData.lives -= 1;
          localStorage.setItem(`cat_${account}`, JSON.stringify(catData));
          setTxStatus('Lost a life (debug)');
        }
      }
      await refreshCat();
    } catch (err: any) {
      console.error('Failed to lose life:', err);
      setError(err.message || 'Failed to lose life');
    } finally {
      setLoading(false);
      setTimeout(() => setTxStatus(''), 3000);
    }
  };

  // Auto-connect on load if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts && accounts.length > 0) {
            connectWallet();
          }
        } catch (err) {
          console.log('Auto-connect check failed:', err);
        }
      }
    };
    checkConnection();
  }, [connectWallet]);

  const renderHomePage = () => (
    <div className="home-page">
      {!account ? (
        <div className="connect-prompt">
          <p>Connect your wallet to start</p>
        </div>
      ) : (
        <>
          {hasCat && cat ? (
            <>
              <div className="stats-section">
                <div className="stat">
                  <span className="stat-label">Streak</span>
                  <span className="stat-value">{cat.streak} days</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Stage</span>
                  <span className="stat-value">
                    {cat.stage === 0 && 'Kitten'}
                    {cat.stage === 1 && 'Young Cat'}
                    {cat.stage === 2 && 'Adult Cat'}
                    {cat.stage === 3 && 'Elder Cat'}
                  </span>
                </div>
              </div>

              {/* CAT BOX WITH PNG BACKGROUND */}
              <div
                className="cat-frame"
                style={{
                  backgroundImage: `url(${catBg})`,
                  backgroundSize: 'cover', // or "contain" if you prefer
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <CatIdleAnimation
                  stage={cat.stage}
                  isGhost={cat.lives === 0}
                  size={300}
                />
              </div>

              <HeartsDisplay lives={cat.lives} />
            </>
          ) : (
            <div className="no-cat">
              <p className="no-cat-message">You don't have a cat yet!</p>
              <p className="no-cat-hint">Create one to start your journey</p>
            </div>
          )}

          <Controls
            hasCat={hasCat}
            lives={cat?.lives || 0}
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