import React, { useState, useEffect } from 'react';
import { colors, font, radius, cardStyle } from '../tokens';

const SIGNALS = [
  { text: 'NVDA Bullish Momentum Detected',  color: colors.green,  icon: '▲', dir: 'BUY' },
  { text: 'BTC Breakout Probability 81%',    color: colors.teal,   icon: '⚡', dir: 'WATCH' },
  { text: 'ETH Volume Surge +34%',           color: colors.green,  icon: '▲', dir: 'BUY' },
  { text: 'TSLA Trend Reversal Signal',      color: colors.amber,  icon: '◈', dir: 'HOLD' },
  { text: 'Market Fear Index Declining',     color: colors.green,  icon: '▲', dir: 'WATCH' },
  { text: 'HSBA London LSE Breaking Out',    color: colors.teal,   icon: '▲', dir: 'BUY' },
  { text: 'Gold Safe Haven Demand Rising',   color: colors.amber,  icon: '◈', dir: 'HOLD' },
  { text: 'SAP Frankfurt Strong Q2 2026',    color: colors.green,  icon: '▲', dir: 'BUY' },
  { text: 'RELIANCE NSE Momentum +2.1%',    color: colors.green,  icon: '▲', dir: 'BUY' },
  { text: 'USD/INR Forex Under Pressure',    color: colors.red,    icon: '▼', dir: 'SELL' },
  { text: 'Nasdaq Strength Increasing',      color: colors.teal,   icon: '▲', dir: 'WATCH' },
  { text: 'Oil Supply Concerns Elevated',    color: colors.red,    icon: '▼', dir: 'SELL' },
  { text: 'TCS NSE AI Division Growth',      color: colors.green,  icon: '▲', dir: 'BUY' },
  { text: 'SOL Solana +4.1% Volume Spike',   color: colors.purple, icon: '⚡', dir: 'WATCH' },
];

const DIR_COLOR: Record<string, string> = {
  BUY:   colors.green,
  SELL:  colors.red,
  HOLD:  colors.amber,
  WATCH: colors.teal,
};

const SignalFeed: React.FC = () => {
  const [visible, setVisible] = useState<number[]>([0, 1, 2, 3]);
  const [idx, setIdx] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => [...prev.slice(-4), idx % SIGNALS.length]);
      setIdx(i => i + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [idx]);

  return (
    <div style={{
      ...cardStyle,
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.7rem',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: font.heading,
          color: colors.textTeal,
          fontSize: '0.65rem',
          letterSpacing: '2px',
        }}>
          <span style={{
            width: '7px', height: '7px',
            borderRadius: '50%',
            background: colors.amber,
            boxShadow: `0 0 8px ${colors.amber}`,
            display: 'inline-block',
            animation: 'demoFlash 2s infinite',
          }} />
          SIGNAL MONITOR
        </div>

        {/* DEMO badge — clearly not live */}
        <div style={{
          background: `${colors.amber}18`,
          border: `1px solid ${colors.amber}55`,
          borderRadius: radius.pill,
          padding: '0.1rem 0.6rem',
          fontFamily: font.mono,
          fontSize: '0.58rem',
          color: colors.amber,
          letterSpacing: '1px',
        }}>
          DEMO DATA · NOT REAL
        </div>
      </div>

      {/* Signals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {visible.map((sigIdx, i) => {
          const sig = SIGNALS[sigIdx % SIGNALS.length];
          const dirColor = DIR_COLOR[sig.dir] || colors.teal;
          return (
            <div key={`${sigIdx}-${i}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.7rem',
              background: `${sig.color}08`,
              border: `1px solid ${sig.color}28`,
              borderRadius: radius.sm,
              animation: i === visible.length - 1 ? 'slideIn 0.35s ease' : 'none',
              fontFamily: font.mono,
              fontSize: '0.71rem',
              color: colors.textPrimary,
              transition: 'all 0.3s',
            }}>
              <span style={{ color: sig.color, fontSize: '0.8rem', minWidth: '14px' }}>
                {sig.icon}
              </span>
              <span style={{ flex: 1 }}>{sig.text}</span>
              <span style={{
                padding: '0.1rem 0.4rem',
                background: `${dirColor}18`,
                border: `1px solid ${dirColor}44`,
                borderRadius: '4px',
                fontSize: '0.6rem',
                color: dirColor,
                fontFamily: font.heading,
                letterSpacing: '0.5px',
                flexShrink: 0,
              }}>
                {sig.dir}
              </span>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: '0.6rem',
        fontFamily: font.mono,
        fontSize: '0.58rem',
        color: colors.textDim,
        lineHeight: 1.4,
        borderTop: `1px solid ${colors.borderDim}`,
        paddingTop: '0.5rem',
      }}>
        ⓘ Illustrative signals only — not generated by the live AI pipeline. Run an analysis above to get real recommendations.
      </div>

      <style>{`
        @keyframes demoFlash {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default SignalFeed;
