import React, { useState } from "react";

export default function TracklistMenu({
  tracklistOpen,
  setTracklistOpen,
  tracklist,
  handleRemoveFromTracklist,
  handleSubmitTracklist, // not used anymore, but kept for backward compatibility
}) {
  // New: handle submit with API call
  const [notification, setNotification] = useState(null);
  const handleSubmit = async () => {
    if (!tracklist.length) return;
    const tickers = tracklist.map(c => c.exchange_ticker);
    try {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL || " http://localhost:8000";
      const res = await fetch(`${apiBase}/analyze-companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "exchange_tickers": tickers }),
      });
      if (!res.ok) throw new Error('Failed to analyze companies');
      const data = await res.json();
      setNotification('Analysis submitted!');
      setTimeout(() => setNotification(null), 2500);
      setTracklistOpen(false);
    } catch (err) {
      setNotification('Error: ' + err.message);
      setTimeout(() => setNotification(null), 3000);
    }
  };
  return (
    <>
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 32,
          background: notification.startsWith('Error') ? '#ffebee' : '#e0f7fa',
          color: notification.startsWith('Error') ? '#c62828' : '#00796b',
          border: notification.startsWith('Error') ? '1px solid #c62828' : '1px solid #00796b',
          borderRadius: 8,
          padding: '0.8rem 1.5rem',
          fontWeight: 500,
          fontSize: 16,
          zIndex: 2000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          transition: 'opacity 0.3s',
        }}>
          {notification}
        </div>
      )}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: tracklistOpen ? 0 : '-350px',
          width: 320,
          height: '100vh',
          background: '#fff',
          boxShadow: '0 0 16px rgba(0,0,0,0.13)',
          borderLeft: '1px solid #b2dfdb',
          zIndex: 1000,
          transition: 'right 0.3s',
          padding: '1.5rem 1.2rem 1.2rem 1.2rem',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#00796b' }}>Tracklist</h3>
        <button
          style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#00796b' }}
          onClick={() => setTracklistOpen(false)}
          title="Close"
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, minHeight: 0 }}>
        {tracklist.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No companies tracked yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tracklist.map((c) => (
              <li key={c.company_name} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, background: '#e0f7fa', borderRadius: 6, padding: '0.5rem 0.7rem' }}>
                <span style={{ flex: 1, color: '#00796b', fontWeight: 500 }}>{c.company_name}</span>
                <button
                  style={{ background: 'none', border: 'none', color: '#d32f2f', fontSize: 18, cursor: 'pointer', marginLeft: 8 }}
                  title="Remove"
                  onClick={() => handleRemoveFromTracklist(c.company_name)}
                >
                  –
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <button
          className="navbar-btn"
          style={{
            width: '100%',
            background: '#00796b',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            borderRadius: 6,
            padding: '0.7rem 0',
            maxWidth: 260,
            boxSizing: 'border-box',
          }}
          disabled={tracklist.length === 0}
          onClick={handleSubmit}
        >
          Submit Tracklist
        </button>
      </div>
      </div>
    </>
  );
}
