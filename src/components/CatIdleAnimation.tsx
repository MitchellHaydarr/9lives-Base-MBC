import React, { useEffect, useState, useRef } from 'react';
import frame0 from '../assets/cats/stage0/frame0.png';
import frame1 from '../assets/cats/stage0/frame1.png';
import frame2 from '../assets/cats/stage0/frame2.png';
import frame3 from '../assets/cats/stage0/frame3.png';
import frame4 from '../assets/cats/stage0/frame4.png';
import frame5 from '../assets/cats/stage0/frame5.png';
import frame6 from '../assets/cats/stage0/frame6.png';

interface CatIdleAnimationProps {
  stage?: number;
  isGhost?: boolean;
  size?: number;
  animationSpeed?: number;
}

const CatIdleAnimation: React.FC<CatIdleAnimationProps> = ({
  stage = 0,
  isGhost = false,
  size = 128,
  animationSpeed = 140
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // For now we only have stage0 frames
  const frames = [frame0, frame1, frame2, frame3, frame4, frame5, frame6];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, animationSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [animationSpeed, frames.length]);

  return (
    <div 
      className="cat-animation-container"
      style={{
        width: size,
        height: size,              // square container is fine
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <img
        src={frames[currentFrame]}
        alt="Cat idle animation"
        style={{
          /* KEY FIXES: keep aspect ratio */
          height: '100%',          // fill container vertically
          width: 'auto',           // auto width so no horizontal squish
          imageRendering: 'pixelated',
          filter: isGhost ? 'grayscale(100%) opacity(0.5)' : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
      {isGhost && (
        <div 
          style={{
            position: 'absolute',
            bottom: -20,
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic'
          }}
        >
          Ghost Mode
        </div>
      )}
    </div>
  );
};

export default CatIdleAnimation;