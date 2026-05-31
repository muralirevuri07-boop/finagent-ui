import React from 'react';

const ITEMS = [
  { s: 'NVDA', c: '+2.1%', up: true },
  { s: 'AAPL', c: '-0.8%', up: false },
  { s: 'BTC',  c: '+3.2%', up: true },
  { s: 'TSLA', c: '+1.5%', up: true },
  { s: 'GOLD', c: '+0.4%', up: true },
  { s: 'ETH',  c: '+2.8%', up: true },
  { s: 'TCS',  c: '+1.1%', up: true },
  { s: 'SAP',  c: '+0.7%', up: true },
  { s: 'HSBA', c: '+1.4%', up: true },
  { s: 'OIL',  c: '-1.2%', up: false },
  { s: 'MSFT', c: '+0.9%', up: true },
  { s: 'SOL',  c: '+4.1%', up: true },
];

const all = [...ITEMS, ...ITEMS];

const TickerTape: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      background: 'rgba(0,0,0,0.8)',
      borderBottom: '1px solid rgba(0,255,157,0.2)',
      padding: '6px 0',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        display: 'flex',
        width: 'max-content',
        animation: 'ticker 40s linear infinite',
      }}>
        {all.map((item, i) => (
          <span key={i} style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.75rem',
            padding: '0 2rem',
            whiteSpace: 'nowrap',
            color: item.up ? '#00ff9d' : '#ff0066',
          }}>
            {item.s} {item.up ? '▲' : '▼'} {item.c}
            <span style={{ color: 'rgba(0,255,157,0.3)', marginLeft: '1rem' }}>·</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
    </div>
  );
};

export default TickerTape;