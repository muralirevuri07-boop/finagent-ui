import React, { useRef, useEffect } from 'react';

const MARKETS = [
  { label: '🇺🇸 US Stocks',  value: 'US' },
  { label: '🇮🇳 India NSE',  value: 'NSE' },
  { label: '🇮🇳 India BSE',  value: 'BSE' },
  { label: '🇬🇧 London LSE', value: 'LSE' },
  { label: '🇩🇪 Frankfurt',  value: 'Frankfurt' },
  { label: '🇯🇵 Tokyo',      value: 'Tokyo' },
  { label: '🇭🇰 Hong Kong',  value: 'HongKong' },
  { label: '🇸🇬 Singapore',  value: 'Singapore' },
  { label: '₿ Crypto',       value: 'Crypto' },
  { label: '💱 Forex',       value: 'Forex' },
  { label: '🏅 Commodities', value: 'Commodity' },
];

const EXAMPLES: Record<string, string[]> = {
  US:        ['NVDA','AAPL','TSLA','MSFT','GOOGL'],
  NSE:       ['TCS','RELIANCE','INFY','HDFCBANK'],
  BSE:       ['WIPRO','TATAMOTORS','BAJFINANCE'],
  LSE:       ['HSBA','BP','AZN','SHEL'],
  Frankfurt: ['SAP','BMW','SIE','BAYN'],
  Tokyo:     ['7203','6758','9984'],
  HongKong:  ['0700','0941','1299'],
  Singapore: ['D05','O39','U11'],
  Crypto:    ['BTC-USD','ETH-USD','SOL-USD'],
  Forex:     ['GBPUSD=X','EURUSD=X','USDINR=X'],
  Commodity: ['GC=F','CL=F','SI=F'],
};

interface HeroProps {
  ticker: string;
  setTicker: (t: string) => void;
  market: string;
  setMarket: (m: string) => void;
  onAnalyse: () => void;
  loading: boolean;
}

const Hero: React.FC<HeroProps> = ({ ticker, setTicker, market, setMarket, onAnalyse, loading }) => {
  const globeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = globeRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width  = 200;
    canvas.height = 200;
    let angle = 0;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, 200, 200);
      angle += 0.005;

      // Outer glow rings
      for (let i = 3; i >= 1; i--) {
        ctx.beginPath();
        ctx.arc(100, 100, 70 + i * 12, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,157,${0.05 * i})`;
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Globe
      const grad = ctx.createRadialGradient(85, 85, 10, 100, 100, 70);
      grad.addColorStop(0, 'rgba(0,200,120,0.4)');
      grad.addColorStop(0.5, 'rgba(0,100,80,0.2)');
      grad.addColorStop(1, 'rgba(0,50,40,0.1)');
      ctx.beginPath();
      ctx.arc(100, 100, 70, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,255,157,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Latitude lines
      ctx.strokeStyle = 'rgba(0,255,157,0.15)';
      ctx.lineWidth = 0.8;
      [-40, -20, 0, 20, 40].forEach(lat => {
        const y = 100 + lat;
        const r = Math.sqrt(70 * 70 - lat * lat);
        ctx.beginPath();
        ctx.ellipse(100, y, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Longitude lines
      for (let i = 0; i < 6; i++) {
        const a = angle + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.ellipse(100, 100, Math.abs(Math.cos(a)) * 70, 70, Math.sin(a) * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,157,${0.1 + Math.abs(Math.cos(a)) * 0.15})`;
        ctx.stroke();
      }

      // Orbiting particles
      for (let i = 0; i < 5; i++) {
        const a = angle * 2 + (i * Math.PI * 2) / 5;
        const px = 100 + Math.cos(a) * 85;
        const py = 100 + Math.sin(a) * 30;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff9d';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff9d';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Pulse ring
      const pulse = Math.sin(angle * 3) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(100, 100, 75 + pulse * 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,255,157,${0.1 * pulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const examples = EXAMPLES[market] || EXAMPLES['US'];

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1.5rem 1rem', position: 'relative', zIndex: 2 }}>

      {/* Globe + Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
        <canvas ref={globeRef} style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,157,0.5))' }} />
        <div>
          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #00ff9d, #00c8ff, #ff00ff, #00ff9d)',
            backgroundSize: '300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 4s ease infinite',
            filter: 'drop-shadow(0 0 20px rgba(0,255,157,0.4))',
          }}>
            FINAGENT GLOBAL
          </h1>
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: 'rgba(0,255,157,0.5)',
            fontSize: '0.75rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginTop: '0.3rem',
          }}>
            [ AI Trading War Room · LangGraph · Groq · RAG · 11 Markets ]
          </p>

          {/* Tech badges */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.8rem', flexWrap: 'wrap' }}>
            {['LangGraph','Groq','Tavily','ChromaDB','RAG','FastAPI'].map(t => (
              <span key={t} style={{
                background: 'rgba(0,255,157,0.08)',
                border: '1px solid rgba(0,255,157,0.25)',
                borderRadius: '20px',
                padding: '0.15rem 0.7rem',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.65rem',
                color: 'rgba(0,255,157,0.7)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <select
          value={market}
          onChange={e => setMarket(e.target.value)}
          style={{
            background: 'rgba(0,5,16,0.9)',
            border: '1px solid rgba(0,255,157,0.35)',
            borderRadius: '8px',
            color: '#00ff9d',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.82rem',
            padding: '0.6rem 1rem',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '180px',
          }}>
          {MARKETS.map(m => <option key={m.value} value={m.value} style={{ background: '#000510' }}>{m.label}</option>)}
        </select>

        <input
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && onAnalyse()}
          placeholder={examples[0]}
          style={{
            background: 'rgba(0,5,16,0.9)',
            border: '1px solid rgba(0,255,157,0.35)',
            borderRadius: '8px',
            color: '#ffffff',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.9rem',
            padding: '0.6rem 1rem',
            outline: 'none',
            width: '160px',
          }}
        />

        <button
          onClick={onAnalyse}
          disabled={loading}
          style={{
            background: loading ? 'rgba(0,255,157,0.1)' : 'linear-gradient(135deg, rgba(0,255,157,0.2), rgba(0,200,255,0.2))',
            border: '1px solid #00ff9d',
            borderRadius: '8px',
            color: '#00ff9d',
            fontFamily: "'Orbitron', monospace",
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '2px',
            padding: '0.65rem 1.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            animation: loading ? 'none' : 'btnPulse 2s infinite',
          }}>
          {loading ? '⟳ ANALYSING...' : '⚡ ANALYSE MARKET'}
        </button>
      </div>

      {/* Example chips */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginTop: '0.8rem', flexWrap: 'wrap' }}>
        {examples.map(e => (
          <span
            key={e}
            onClick={() => setTicker(e)}
            style={{
              background: 'rgba(0,255,157,0.08)',
              border: '1px solid rgba(0,255,157,0.2)',
              borderRadius: '20px',
              padding: '0.15rem 0.7rem',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.72rem',
              color: 'rgba(0,255,157,0.7)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e2 => (e2.currentTarget.style.background = 'rgba(0,255,157,0.2)')}
            onMouseLeave={e2 => (e2.currentTarget.style.background = 'rgba(0,255,157,0.08)')}
          >
            {e}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0%; }
          50%  { background-position: 100%; }
          100% { background-position: 0%; }
        }
        @keyframes btnPulse {
          0%,100% { box-shadow: 0 0 10px rgba(0,255,157,0.3); }
          50%      { box-shadow: 0 0 25px rgba(0,255,157,0.7), 0 0 50px rgba(0,255,157,0.3); }
        }
      `}</style>
    </div>
  );
};

export default Hero;