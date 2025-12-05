import { useEffect, useState } from "react";

// Type for Circle API result
interface CircleBalanceResponse {
  data?: {
    available?: { currency: string; amount: string }[];
    unsettled?: { currency: string; amount: string }[];
  };
}

const SettingsPage = () => {
  // -----------------------------
  // Circle Sandbox Balance State
  // -----------------------------
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [circleLoading, setCircleLoading] = useState(false);
  const [circleError, setCircleError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCircleBalance = async () => {
      setCircleLoading(true);
      setCircleError(null);

      try {
        const res = await fetch("http://localhost:8787/api/circle/balances");
        const json = (await res.json()) as CircleBalanceResponse;

        const available = json.data?.available ?? [];
        const usdc = available.find(
          (b) => b.currency === "USDC" || b.currency === "USD"
        );

        setUsdcBalance(usdc?.amount ?? "0");
      } catch (err: any) {
        setCircleError("Unable to reach Circle Sandbox API");
      }

      setCircleLoading(false);
    };

    fetchCircleBalance();
  }, []);

  // -----------------------------
  // UI RENDER
  // -----------------------------
  return (
    <div className="settings-page">
      <h2 className="settings-title">Settings</h2>

      {/* -------------------------------------------------- */}
      {/* CIRCLE INTEGRATION CARD */}
      {/* -------------------------------------------------- */}
      <div className="settings-card">
        <h3 className="settings-section-title">Circle Integration</h3>

        <p className="settings-label">USDC Balance (Sandbox):</p>

        {circleLoading ? (
          <p className="settings-value">Loading...</p>
        ) : circleError ? (
          <p className="settings-error">{circleError}</p>
        ) : (
          <p className="settings-value">{usdcBalance} USDC</p>
        )}

        <p className="settings-hint">
          Circle USDC balance fetched from your Sandbox business account.
        </p>
      </div>

      {/* -------------------------------------------------- */}
      {/* OTHER SETTINGS CARD — BELOW CIRCLE CARD */}
      {/* -------------------------------------------------- */}
      <div className="settings-card">
        <h3 className="settings-section-title">App Preferences</h3>

        <div className="settings-item">
          <label>Sound Effects:</label>
          <input type="checkbox" defaultChecked />
        </div>

        <div className="settings-item">
          <label>Animations:</label>
          <input type="checkbox" defaultChecked />
        </div>

        <div className="settings-item">
          <label>Dark Mode:</label>
          <input type="checkbox" defaultChecked />
        </div>

        <p className="settings-hint">More customization options coming soon.</p>
      </div>

      {/* -------------------------------------------------- */}
      {/* ACCOUNT CARD */}
      {/* -------------------------------------------------- */}
      <div className="settings-card">
        <h3 className="settings-section-title">Account</h3>

        <div className="settings-item">
          <button className="btn-small">Reset Cat Data</button>
        </div>

        <p className="settings-hint">
          (Mock only) Deletes your local cat data for testing.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;