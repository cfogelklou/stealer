import { useState, useEffect } from 'react';
import './App.css';

interface StolenCredential {
  credentials: string;
  timestamp: string;
  auctionPrice: string;
  id: number;
}

const STORAGE_KEY = 'stolen_credentials';

function App() {
  const [stolenCreds, setStolenCreds] = useState<StolenCredential[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [latestPrice, setLatestPrice] = useState('');

  // Load stored credentials on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setStolenCreds(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored credentials');
      }
    }
  }, []);

  // Check URL parameters for new credentials or forget command
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const credsParam = params.get('creds');
    const forgetParam = params.get('forget');

    // Clear localStorage if forget=true
    if (forgetParam === 'true') {
      localStorage.removeItem(STORAGE_KEY);
      setStolenCreds([]);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (credsParam) {
      try {
        const decoded = atob(credsParam);
        addCredentials(decoded);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error('Failed to decode credentials');
      }
    }
  }, []);

  const addCredentials = (credentials: string) => {
    // Split by lines and filter out empty lines
    const lines = credentials.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) return;

    const newCreds: StolenCredential[] = lines.map((line, index) => ({
      credentials: line,
      timestamp: new Date().toISOString(),
      auctionPrice: (Math.random() * 10000 + 500).toFixed(2),
      id: Date.now() + index
    }));

    const totalPrice = newCreds.reduce((sum, c) => sum + parseFloat(c.auctionPrice), 0).toFixed(2);
    const updated = [...stolenCreds, ...newCreds];
    setStolenCreds(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Show animation
    setShowAnimation(true);
    setLatestPrice(totalPrice);
    setTimeout(() => setShowAnimation(false), 3000);
  };

  // Listen for messages from parent window (for iframe embedding)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STEAL_CREDENTIALS') {
        addCredentials(event.data.credentials);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [stolenCreds]);

  return (
    <div className="app">
      <header className="header">
        <h1>🦹 CREDENTIAL HARVESTER 3000</h1>
        <p className="subtitle">Dark Web Auction House</p>
      </header>

      {showAnimation && (
        <div className="animation-overlay">
          <div className="animation-content">
            <div className="skull">💀</div>
            <h2>CREDENTIALS STOLEN!</h2>
            <div className="money-rain">
              {[...Array(20)].map((_, i) => (
                <span key={i} className="money" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}>💰</span>
              ))}
            </div>
            <p className="price-tag">SOLD FOR ${latestPrice}!</p>
          </div>
        </div>
      )}

      <main className="main">
        <div className="stats">
          <div className="stat-card">
            <h3>{stolenCreds.length}</h3>
            <p>Credentials Harvested</p>
          </div>
          <div className="stat-card">
            <h3>${stolenCreds.reduce((sum, c) => sum + parseFloat(c.auctionPrice), 0).toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="credentials-list">
          <h2>Recent Acquisitions</h2>
          {stolenCreds.length === 0 ? (
            <p className="empty-state">Waiting for credentials... 👀</p>
          ) : (
            stolenCreds.slice().reverse().map((cred) => (
              <div key={cred.id} className="credential-card">
                <div className="credential-header">
                  <span className="timestamp">{new Date(cred.timestamp).toLocaleString()}</span>
                  <span className="price">💰 ${cred.auctionPrice}</span>
                </div>
                <pre className="credential-content">{cred.credentials}</pre>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
