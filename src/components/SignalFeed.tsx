import React, { useState, useEffect } from 'react';

const SIGNALS = [
  { text: 'NVDA Bullish Momentum Detected',  color: '#00ff9d', icon: '▲' },
  { text: 'BTC Breakout Probability 81%',    color: '#00c8ff', icon: '⚡' },
  { text: 'ETH Volume Surge +34%',           color: '#00ff9d', icon: '▲' },
  { text: 'TSLA Trend Reversal Signal',      color: '#ffaa00', icon: '◈' },
  { text: 'Market Fear Index Declining',     color: '#00ff9d', icon: '▲' },
  { text: 'HSBA London LSE Breaking Out',    color: '#00c8ff', icon: '▲' },
  { text: 'Gold Safe Haven Demand Rising',   color: '#ffaa00', icon: '◈' },
  { text: 'SAP Frankfurt Strong Q2 2026',    color: '#00ff9d', icon: '▲' },
  { text: 'RELIANCE NSE Momentum +2.1%',    color: '#00ff9d', icon: '▲' },
  { text: 'USD/INR Forex Under Pressure',    color: '#ff0066', icon: '▼' },
  { text: 'Nasdaq Strength Increasing',      color: '#00c8ff', icon: '▲' },
  { text: 'Oil Supply Concerns Elevated',    color: '#ff0066', icon: '▼' },
  { text: 'TCS NSE AI Division Growth',      color: '#00ff9d', icon: '▲' },
  { text: 'SOL Solana +4.1% Volume Spike',   color: '#ff00ff', icon: '⚡' },
];

const SignalFeed: React.FC = () => {
  const [visible, setVisible] = useState<number[]>([0, 1, 2, 3]);
  const [idx, setIdx] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => [...prev.slice(-4), idx % SIGNALS.length]);
      setIdx(i => i + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [idx]);

  return (
    <div style={{
      background: 'rgba(0,5,16,0.85)',
      border: '1px solid rgba(0,255,157,0.2)',
      borderRadius: '14px',
      padding: '1rem',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top gradient border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, #00ff9d, #ff00ff, transparent)',
      }} />

      {/* Header */}
      <div style={{
        fontFamily: "'Orbitron', monospace",
        color: '#00ff9d',
        fontSize: '0.7rem',
        letterSpacing: '3px',
        marginBottom: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#00ff9d',
          boxShadow: '0 0 10px #00ff9d',
          display: 'inline-block',
          animation: 'livePulse 1s infinite',
        }} />
        ◈ LIVE AI SIGNALS
      </div>

      {/* Signals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {visible.map((sigIdx, i) => {
          const sig = SIGNALS[sigIdx % SIGNALS.length];
          return (
            <div key={`${sigIdx}-${i}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.7rem',
              background: `${sig.color}0d`,
              border: `1px solid ${sig.color}44`,
              borderRadius: '8px',
              animation: i === visible.length - 1 ? 'slideIn 0.4s ease' : 'none',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.73rem',
              color: '#ffffff',
              transition: 'all 0.3s',
            }}>
              <span style={{
                color: sig.color,
                fontSize: '0.85rem',
                textShadow: `0 0 8px ${sig.color}`,
                minWidth: '16px',
              }}>{sig.icon}</span>
              <span>{sig.text}</span>
              <span style={{
                marginLeft: 'auto',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: sig.color,
                boxShadow: `0 0 6px ${sig.color}`,
                flexShrink: 0,
              }} />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes livePulse {
          0%,100% { opacity: 1; box-shadow: 0 0 10px #00ff9d; }
          50%      { opacity: 0.3; box-shadow: none; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default SignalFeed;