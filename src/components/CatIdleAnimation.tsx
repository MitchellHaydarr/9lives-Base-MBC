import React, { useEffect, useState, useRef } from 'react';

import s0f0 from '../assets/cats/stage0/Frame0.png';
import s0f1 from '../assets/cats/stage0/Frame1.png';
import s0f2 from '../assets/cats/stage0/Frame2.png';
import s0f3 from '../assets/cats/stage0/Frame3.png';

import s1f0 from '../assets/cats/stage1/frame0.png';
import s1f1 from '../assets/cats/stage1/frame1.png';
import s1f2 from '../assets/cats/stage1/frame2.png';
import s1f3 from '../assets/cats/stage1/frame3.png';
import s1f4 from '../assets/cats/stage1/frame4.png';
import s1f5 from '../assets/cats/stage1/frame5.png';
import s1f6 from '../assets/cats/stage1/frame6.png';

import s2f0 from '../assets/cats/stage2/pixil-frame-0.png';
import s2f1 from '../assets/cats/stage2/pixil-frame-1.png';
import s2f2 from '../assets/cats/stage2/pixil-frame-2.png';
import s2f3 from '../assets/cats/stage2/pixil-frame-3.png';
import s2f4 from '../assets/cats/stage2/pixil-frame-4.png';
import s2f5 from '../assets/cats/stage2/pixil-frame-5.png';
import s2f6 from '../assets/cats/stage2/pixil-frame-6.png';

import s3f0 from '../assets/cats/stage3/pixil-frame-0.png';
import s3f1 from '../assets/cats/stage3/pixil-frame-1.png';
import s3f2 from '../assets/cats/stage3/pixil-frame-2.png';
import s3f3 from '../assets/cats/stage3/pixil-frame-3.png';
import s3f4 from '../assets/cats/stage3/pixil-frame-4.png';
import s3f5 from '../assets/cats/stage3/pixil-frame-5.png';
import s3f6 from '../assets/cats/stage3/pixil-frame-6.png';

import bg1 from '../assets/backgrounds/background1.png';

interface CatIdleAnimationProps {
  stage?: number;
  isGhost?: boolean;
  size?: number;
  animationSpeed?: number;
}

const CatIdleAnimation: React.FC<CatIdleAnimationProps> = ({
  stage = 0,
  isGhost = false,
  size = 96,
  animationSpeed = 140,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const stage0 = [s0f0, s0f1, s0f2, s0f3];
  const stage1 = [s1f0, s1f1, s1f2, s1f3, s1f4, s1f5, s1f6];
  const stage2 = [s2f0, s2f1, s2f2, s2f3, s2f4, s2f5, s2f6];
  const stage3 = [s3f0, s3f1, s3f2, s3f3, s3f4, s3f5, s3f6];

  const frames =
    stage === 0 ? stage0 :
    stage === 1 ? stage1 :
    stage === 2 ? stage2 :
    stage3;

  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, animationSpeed);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [frames, animationSpeed]);

  const bgStyle: React.CSSProperties = {
    backgroundImage: `url(${bg1})`,
  };

  return (
    <div className="cat-bg" style={bgStyle}>
      <img
        src={frames[currentFrame]}
        alt="Cat"
        style={{
          height: 96,       // controls cat size
          width: 'auto',
          imageRendering: 'pixelated',
          filter: isGhost ? 'grayscale(100%) opacity(0.5)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      />
    </div>
  );
};

export default CatIdleAnimation;