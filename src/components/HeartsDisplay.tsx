import React from 'react';

interface HeartsDisplayProps {
  lives: number;
  maxLives?: number;
}

const HeartsDisplay: React.FC<HeartsDisplayProps> = ({ lives, maxLives = 9 }) => {
  const hearts = Array.from({ length: maxLives }, (_, index) => index < lives);

  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg 
      width="20" 
      height="18" 
      viewBox="0 0 20 18" 
      fill={filled ? '#dc2626' : 'none'}
      stroke={filled ? '#dc2626' : '#4a4a4a'}
      strokeWidth="2"
      style={{
        transition: 'all 0.2s ease',
        opacity: filled ? 1 : 0.4
      }}
    >
      <path d="M17.367 2.842a4.583 4.583 0 0 0-6.48 0L10 3.73l-.887-.888a4.583 4.583 0 0 0-6.48 6.48l.887.888L10 16.69l6.48-6.48.887-.888a4.583 4.583 0 0 0 0-6.48z" />
    </svg>
  );

  return (
    <div className="hearts-display">
      <div className="hearts-row">
        {hearts.map((isFull, index) => (
          <div
            key={index}
            className="heart-icon"
            title={`Life ${index + 1}`}
          >
            <HeartIcon filled={isFull} />
          </div>
        ))}
      </div>
      <div className="hearts-counter">
        {lives}/{maxLives}
      </div>
    </div>
  );
};

export default HeartsDisplay;
