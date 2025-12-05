import React, { useState } from "react";

interface ControlsProps {
  hasCat: boolean;
  lives: number;
  onCreateCat: () => void;
  onCheckIn: (note?: string) => void;
  onRestoreLife: () => void;
  onLoseLife: () => void;
  loading: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  hasCat,
  lives,
  onCreateCat,
  onCheckIn,
  onRestoreLife,
  onLoseLife,
  loading,
}) => {
  const [note, setNote] = useState("");

  if (!hasCat) {
    return (
      <div className="controls">
        <button
          className="btn btn-primary"
          onClick={onCreateCat}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Cat"}
        </button>
      </div>
    );
  }

  return (
    <div className="controls">
      {/* row of buttons – same vibe as before */}
      <div className="controls-row">
        <button
          className="btn btn-check-in"
          onClick={() => onCheckIn(note)}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check In"}
        </button>

        <button
          className="btn btn-debug"
          type="button"
          onClick={onLoseLife}
        >
          Lose Life
        </button>

        {lives < 9 && (
          <button
            className="btn btn-restore"
            type="button"
            onClick={onRestoreLife}
            disabled={loading}
          >
            Restore Life
          </button>
        )}
      </div>

      {/* NEW: text box directly underneath the buttons */}
      <input
        className="checkin-input"
        type="text"
        placeholder="Write something for today’s check-in…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  );
};

export default Controls;