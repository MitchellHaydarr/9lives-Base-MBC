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

  const { cat, hasCat, refreshCat } = useCat(account, contract || undefined);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (!window.ethereum) throw new Error('MetaMask not installed');

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setSigner(signer);
      setAccount(accounts[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem(`cat_${account}`);
    setAccount('');
    setSigner(null);
    setError('');
    setTxStatus('');
  }, [account]);

  const handleCreateCat = async () => {
    if (!account) return;

    setLoading(true);
    setTxStatus('Creating your cat...');
    setError('');

    try {
      if (contractFunctions && signer) {
        await contractFunctions.createCat();
      } else {
        const mockCat = {
          lives: 9,
          streak: 0,
          stage: 0,
          lastCheckIn: Math.floor(Date.now() / 1000).toString(),
          exists: true
        };
        localStorage.setItem(`cat_${account}`, JSON.stringify(mockCat));
      }

      setTxStatus('Cat created!');
      await refreshCat();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setTxStatus(''), 2000);
    }
  };

  // UPDATED: CHECK-IN FUNCTION NOW ACCEPTS A NOTE
  const handleCheckIn = async (note?: string) => {
    console.log("User check-in note:", note);

    if (!account || !hasCat) return;

    setLoading(true);
    setTxStatus('Checking in...');
    setError('');

    try {
      if (contractFunctions && signer) {
        await contractFunctions.checkIn();
      } else {
        const stored = localStorage.getItem(`cat_${account}`);
        if (stored) {
          const data = JSON.parse(stored);
          data.streak += 1;
          data.lastCheckIn = Math.floor(Date.now() / 1000).toString();

          if (data.streak >= 12) data.stage = 3;
          else if (data.streak >= 7) data.stage = 2;
          else if (data.streak >= 3) data.stage = 1;
          else data.stage = 0;

          localStorage.setItem(`cat_${account}`, JSON.stringify(data));
        }
      }

      await refreshCat();
      setTxStatus('Checked in!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setTxStatus(''), 2000);
    }
  };

  const handleRestoreLife = async () => {
    if (!account || !hasCat || !cat) return;

    setLoading(true);
    setTxStatus('Restoring life...');
    setError('');

    try {
      if (contractFunctions && signer) {
        await contractFunctions.restoreLife();
      } else {
        const stored = localStorage.getItem(`cat_${account}`);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.lives < 9) data.lives += 1;
          localStorage.setItem(`cat_${account}`, JSON.stringify(data));
        }
      }

      await refreshCat();
      setTxStatus('Life restored!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setTxStatus(''), 2000);
    }
  };

  const handleLoseLife = async () => {
    if (!account || !hasCat || !cat) return;

    setLoading(true);

    try {
      const stored = localStorage.getItem(`cat_${account}`);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.lives > 0) data.lives -= 1;
        localStorage.setItem(`cat_${account}`, JSON.stringify(data));
      }
      await refreshCat();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) connectWallet();
      }
    })();
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
                    {cat.stage === 0 && "Kitten"}
                    {cat.stage === 1 && "Young Cat"}
                    {cat.stage === 2 && "Adult Cat"}
                    {cat.stage === 3 && "Elder Cat"}
                  </span>
                </div>
              </div>

              <div className="cat-frame">
                <CatIdleAnimation
                  stage={cat.stage}
                  isGhost={cat.lives === 0}
                  size={160}
                />
              </div>

              <HeartsDisplay lives={cat.lives} />
            </>
          ) : (
            <div className="no-cat">
              <p>You don't have a cat yet!</p>
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
              <button className="btn-connect" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        <nav className="tab-bar">
          <button className={`tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            Home
          </button>
          <button className={`tab ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>
            Friends
          </button>
          <button className={`tab ${activeTab === 'treasure' ? 'active' : ''}`} onClick={() => setActiveTab('treasure')}>
            Treasure
          </button>
          <button className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
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