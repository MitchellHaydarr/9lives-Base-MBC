import React, { useState } from "react";

const SettingsPage: React.FC = () => {
  const [dailyReminders, setDailyReminders] = useState(true);
  const [streakWarnings, setStreakWarnings] = useState(true);
  const [hideDeathAnimations, setHideDeathAnimations] = useState(false);

  return (
    <div className="settings-page">
      <h2 className="page-title">Settings</h2>
      <p className="page-subtitle">
        These are local demo settings. In a full version they could be stored on-chain or in your
        wallet profile.
      </p>

      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <p className="setting-label">Daily reminder notifications</p>
            <p className="setting-description">
              Get notified when it is time to check in with your cat.
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={dailyReminders}
              onChange={(e) => setDailyReminders(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <p className="setting-label">Show streak warnings</p>
            <p className="setting-description">
              Warn you when your streak is about to reset.
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={streakWarnings}
              onChange={(e) => setStreakWarnings(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <p className="setting-label">Hide death animations</p>
            <p className="setting-description">
              Keep things gentle when a cat runs out of lives.
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={hideDeathAnimations}
              onChange={(e) => setHideDeathAnimations(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="settings-footer">
        <p className="version-info">9Lives v1.0.0</p>
        <p className="build-info">Built for MBC 2025 hackathon demo</p>
      </div>
    </div>
  );
};

export default SettingsPage;