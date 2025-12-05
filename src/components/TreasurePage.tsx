import React from 'react';

const TreasurePage: React.FC = () => {
  return (
    <div className="treasure-page">
      <h2 className="page-title">Treasure</h2>
      <div className="treasure-content">
        <div className="treasure-chest">
          <svg 
            width="160" 
            height="140" 
            viewBox="0 0 160 140" 
            fill="none"
          >
            {/* Chest Body */}
            <rect x="30" y="60" width="100" height="60" fill="#2a2a2a" stroke="#8b0000" strokeWidth="2"/>
            {/* Chest Lid */}
            <path d="M30 60 Q80 35 130 60" fill="#333333" stroke="#8b0000" strokeWidth="2"/>
            {/* Lock */}
            <circle cx="80" cy="80" r="10" fill="#dc2626" stroke="#8b0000" strokeWidth="2"/>
            <rect x="75" y="80" width="10" height="15" fill="#dc2626"/>
            {/* Decorative Lines */}
            <line x1="30" y1="90" x2="130" y2="90" stroke="#8b0000" strokeWidth="1" opacity="0.5"/>
            <line x1="30" y1="100" x2="130" y2="100" stroke="#8b0000" strokeWidth="1" opacity="0.5"/>
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
