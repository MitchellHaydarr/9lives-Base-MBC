import React from 'react';

const TreasurePage: React.FC = () => {
  return (
    <div className="treasure-page">
      <h2 className="page-title">Treasure</h2>
      <div className="treasure-content">
        <div className="treasure-chest">
          <svg 
            width="120" 
            height="100" 
            viewBox="0 0 120 100" 
            fill="none"
            style={{ margin: '2rem auto', display: 'block' }}
          >
            {/* Chest Body */}
            <rect x="20" y="40" width="80" height="50" fill="#8b4513" stroke="#654321" strokeWidth="2"/>
            {/* Chest Lid */}
            <path d="M20 40 Q60 20 100 40" fill="#a0522d" stroke="#654321" strokeWidth="2"/>
            {/* Lock */}
            <circle cx="60" cy="55" r="8" fill="#ffd700" stroke="#daa520" strokeWidth="2"/>
            <rect x="56" y="55" width="8" height="12" fill="#ffd700"/>
          </svg>
        </div>
        
        <div className="treasure-info">
          <h3>Coming Soon</h3>
          <p className="treasure-description">
            Unlock treasure chests by maintaining your streak and keeping your cat alive!
          </p>
          
          <div className="treasure-features">
            <div className="feature-item">
              <span className="feature-text">• Cosmetic items for your cat</span>
            </div>
            <div className="feature-item">
              <span className="feature-text">• USDC rewards for dedication</span>
            </div>
            <div className="feature-item">
              <span className="feature-text">• Exclusive NFT collectibles</span>
            </div>
          </div>
          
          <p className="treasure-hint">
            Keep building your streak to be ready when treasures launch!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TreasurePage;
