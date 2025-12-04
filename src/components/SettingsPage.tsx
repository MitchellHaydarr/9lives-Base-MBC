import React, { useState } from 'react';

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

const settingsOptions: SettingToggle[] = [
  {
    id: 'reminders',
    label: 'Daily reminder notifications',
    description: 'Get notified to check in with your cat',
    defaultValue: true,
  },
  {
    id: 'warnings',
    label: 'Show streak warnings',
    description: 'Alert when streak is about to reset',
    defaultValue: true,
  },
  {
    id: 'animations',
    label: 'Hide death animations',
    description: 'Disable animations when cat loses all lives',
    defaultValue: false,
  },
  {
    id: 'darkmode',
    label: 'Dark mode',
    description: 'Use dark theme (always on)',
    defaultValue: true,
  },
];

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    settingsOptions.reduce((acc, opt) => ({
      ...acc,
      [opt.id]: opt.defaultValue,
    }), {})
  );

  const handleToggle = (id: string) => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
    console.log(`Setting ${id} toggled to ${!settings[id]}`);
  };

  return (
    <div className="settings-page">
      <h2 className="page-title">Settings</h2>
      <div className="settings-list">
        {settingsOptions.map((option) => (
          <div key={option.id} className="setting-item">
            <div className="setting-info">
              <h3 className="setting-label">{option.label}</h3>
              <p className="setting-description">{option.description}</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings[option.id]}
                onChange={() => handleToggle(option.id)}
                disabled={option.id === 'darkmode'} // Dark mode always on
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>
      
      <div className="settings-footer">
        <p className="version-info">9Lives v1.0.0</p>
        <p className="build-info">Built for MBC 2025</p>
      </div>
    </div>
  );
};

export default SettingsPage;
