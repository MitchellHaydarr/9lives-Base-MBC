import React from 'react';

interface ControlsProps {
  hasCat: boolean;
  lives: number;
  onCreateCat: () => Promise<void>;
  onCheckIn: () => Promise<void>;
  onRestoreLife: () => Promise<void>;
  onLoseLife?: () => Promise<void>;
  loading?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  hasCat,
  lives,
  onCreateCat,
  onCheckIn,
  onRestoreLife,
  onLoseLife,
  loading = false
}) => {
  return (
    <div className="controls">
      {!hasCat ? (
        <button
          className="btn btn-primary"
          onClick={onCreateCat}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Cat'}
        </button>
      ) : (
        <>
          <div className="controls-row">
            <button
              className="btn btn-check-in"
              onClick={onCheckIn}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Check In'}
            </button>

            {lives < 9 && (
              <button
                className="btn btn-restore"
                onClick={onRestoreLife}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Restore Life (1 USDC)'}
              </button>
            )}
            
            {onLoseLife && (
              <button
                className="btn btn-debug"
                onClick={onLoseLife}
                disabled={loading || lives === 0}
              >
                Lose Life
              </button>
            )}
          </div>
          
          <p className="controls-note">
            * Daily check-in restrictions disabled for demo
          </p>
        </>
      )}
    </div>
  );
};

export default Controls;
