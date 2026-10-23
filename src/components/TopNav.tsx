import React, { useState } from 'react';
import { colors, font, radius } from '../tokens';

const MARKETS = [
  { label: '🇺🇸 US',         value: 'US' },
  { label: '🇮🇳 NSE',        value: 'NSE' },
  { label: '🇮🇳 BSE',        value: 'BSE' },
  { label: '🇬🇧 LSE',        value: 'LSE' },
  { label: '🇩🇪 Frankfurt',  value: 'Frankfurt' },
  { label: '🇯🇵 Tokyo',      value: 'Tokyo' },
  { label: '🇭🇰 HK',         value: 'HongKong' },
  { label: '🇸🇬 SGX',        value: 'Singapore' },
  { label: '₿ Crypto',       value: 'Crypto' },
  { label: '💱 Forex',       value: 'Forex' },
  { label: '🏅 Commodity',   value: 'Commodity' },
];

const EXAMPLES: Record<string, string[]> = {
  US:        ['NVDA','AAPL','TSLA','MSFT','GOOGL','META','AMZN'],
  NSE:       ['TCS','RELIANCE','INFY','HDFCBANK','WIPRO'],
  BSE:       ['WIPRO','TATAMOTORS','BAJFINANCE','ADANIENT'],
  LSE:       ['HSBA','BP','AZN','SHEL','RIO'],
  Frankfurt: ['SAP','BMW','SIE','BAYN','ADS'],
  Tokyo:     ['7203','6758','9984','6501','8306'],
  HongKong:  ['0700','0941','1299','0005','2318'],
  Singapore: ['D05','O39','U11','Z74','C38U'],
  Crypto:    ['BTC-USD','ETH-USD','SOL-USD','BNB-USD'],
  Forex:     ['GBPUSD=X','EURUSD=X','USDINR=X','USDJPY=X'],
  Commodity: ['GC=F','CL=F','SI=F','NG=F'],
};

interface TopNavProps {
  ticker: string;
  setTicker: (t: string) => void;
  market: string;
  setMarket: (m: string) => void;
  onAnalyse: () => void;
  loading: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ ticker, setTicker, market, setMarket, onAnalyse, loading }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const examples = EXAMPLES[market] || EXAMPLES['US'];

  const inputStyle: React.CSSProperties = {
    background: 'rgba(0,12,30,0.8)',
    border: `1px solid ${searchFocused ? colors.teal : colors.border}`,
    borderRadius: radius.sm,
    color: colors.textPrimary,
    fontFamily: font.mono,
    fontSize: '0.85rem',
    padding: '0.38rem 0.75rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '130px',
  };

  const selectStyle: React.CSSProperties = {
    background: 'rgba(0,12,30,0.9)',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    color: colors.textTeal,
    fontFamily: font.mono,
    fontSize: '0.78rem',
    padding: '0.38rem 0.6rem',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as any,
    WebkitAppearance: 'none' as any,
    minWidth: '130px',
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(4,8,15,0.97)',
      borderBottom: `1px solid ${colors.border}`,
      backdropFilter: 'blur(24px)',
      padding: '0 1.2rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        height: '52px',
        maxWidth: '1600px',
        margin: '0 auto',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{
            width: '28px', height: '28px',
            background: `linear-gradient(135deg, ${colors.teal}22, ${colors.green}22)`,
            border: `1px solid ${colors.teal}55`,
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem',
          }}>◈</div>
          <span style={{
            fontFamily: font.heading,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '2px',
            color: colors.textPrimary,
          }}>FINAGENT</span>
          <span style={{
            fontFamily: font.heading,
            fontSize: '0.7rem',
            color: colors.textTeal,
            letterSpacing: '1px',
            opacity: 0.8,
          }}>GLOBAL</span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '22px', background: colors.border, flexShrink: 0 }} />

        {/* Market selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <select
            value={market}
            onChange={e => setMarket(e.target.value)}
            style={selectStyle}
          >
            {MARKETS.map(m => (
              <option key={m.value} value={m.value} style={{ background: '#040810' }}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ticker input */}
        <input
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && !loading && onAnalyse()}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={examples[0] || 'TICKER'}
          style={inputStyle}
        />

        {/* Analyse button */}
        <button
          onClick={onAnalyse}
          disabled={loading}
          style={{
            background: loading
              ? 'rgba(0,200,255,0.05)'
              : `linear-gradient(135deg, rgba(0,200,255,0.15), rgba(0,232,122,0.12))`,
            border: `1px solid ${loading ? colors.border : colors.teal}`,
            borderRadius: radius.sm,
            color: loading ? colors.textDim : colors.teal,
            fontFamily: font.heading,
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '1.5px',
            padding: '0.4rem 1.1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '⟳ ANALYSING' : '⚡ ANALYSE'}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '22px', background: colors.border, flexShrink: 0 }} />

        {/* Quick picks */}
        <div style={{ display: 'flex', gap: '0.35rem', overflow: 'hidden', flex: 1 }}>
          {examples.slice(0, 6).map(ex => (
            <button
              key={ex}
              onClick={() => setTicker(ex)}
              style={{
                background: ticker === ex ? `rgba(0,200,255,0.14)` : 'transparent',
                border: `1px solid ${ticker === ex ? colors.borderHi : colors.borderDim}`,
                borderRadius: radius.sm,
                color: ticker === ex ? colors.textTeal : colors.textDim,
                fontFamily: font.mono,
                fontSize: '0.7rem',
                padding: '0.22rem 0.55rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (ticker !== ex) {
                  e.currentTarget.style.color = colors.textSecondary;
                  e.currentTarget.style.borderColor = colors.border;
                }
              }}
              onMouseLeave={e => {
                if (ticker !== ex) {
                  e.currentTarget.style.color = colors.textDim;
                  e.currentTarget.style.borderColor = colors.borderDim;
                }
              }}
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Right — status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
          marginLeft: 'auto',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#00e87a',
            boxShadow: '0 0 6px #00e87a',
          }} />
          <span style={{
            fontFamily: font.mono,
            fontSize: '0.62rem',
            color: colors.textDim,
            letterSpacing: '0.5px',
          }}>LIVE</span>
        </div>
      </div>

      <style>{`
        nav select option { background: #040810; }
      `}</style>
    </nav>
  );
};

export default TopNav;
