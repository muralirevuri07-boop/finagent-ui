import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalysePanelProps {
  result: any;
  loading: boolean;
  agentStep: number;
  ticker: string;
}

const AGENTS = [
  { name: 'NEWS AGENT',      icon: '📰', desc: 'Scraping live market news via Tavily' },
  { name: 'RAG MEMORY',      icon: '🧠', desc: 'Retrieving historical context from ChromaDB' },
  { name: 'FINANCIAL DATA',  icon: '📊', desc: 'Fetching live price & market data' },
  { name: 'SENTIMENT AI',    icon: '💭', desc: 'Analysing market sentiment via Groq LLM' },
  { name: 'REPORT GEN',      icon: '📋', desc: 'Generating institutional-grade report' },
  { name: 'FINAL DECISION',  icon: '⚡', desc: 'Compiling AI recommendation' },
];

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'rgba(0,5,16,0.85)',
    border: '1px solid rgba(0,255,157,0.2)',
    borderRadius: '14px',
    padding: '1.2rem',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
      background: 'linear-gradient(90deg, transparent, #00ff9d, #00c8ff, transparent)',
      opacity: 0.6,
    }} />
    {children}
  </div>
);

const PanelTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontFamily: "'Orbitron', monospace",
    color: '#00ff9d',
    fontSize: '0.7rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(0,255,157,0.15)',
  }}>{children}</div>
);

const MetricCard: React.FC<{ label: string; value: string; color?: string; big?: boolean }> = ({ label, value, color = '#00ff9d', big }) => (
  <div style={{
    background: 'rgba(0,5,16,0.8)',
    border: `1px solid ${color}44`,
    borderRadius: '12px',
    padding: '1rem 0.8rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    animation: 'flyIn 0.5s ease forwards',
  }}>
    <div style={{
      position: 'absolute', top: 0, left: '-100%', width: '60%', height: '1px',
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      animation: 'scanLine 3s ease-in-out infinite',
    }} />
    <div style={{
      fontFamily: "'Share Tech Mono', monospace",
      color: `${color}88`,
      fontSize: '0.6rem',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      marginBottom: '0.5rem',
    }}>{label}</div>
    <div style={{
      fontFamily: "'Orbitron', monospace",
      color,
      fontSize: big ? '1.8rem' : '1.1rem',
      fontWeight: 900,
      textShadow: `0 0 20px ${color}88`,
      animation: big ? 'recPulse 2s infinite' : 'none',
    }}>{value}</div>
    <style>{`
      @keyframes scanLine { 0%{left:-100%} 100%{left:200%} }
      @keyframes flyIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes recPulse { 0%,100%{text-shadow:0 0 20px ${color}88} 50%{text-shadow:0 0 40px ${color},0 0 80px ${color}44} }
    `}</style>
  </div>
);

const AnalysePanel: React.FC<AnalysePanelProps> = ({ result, loading, agentStep, ticker }) => {

  // LOADING STATE — Agent progress
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Panel>
          <PanelTitle>◈ AGENT PIPELINE — EXECUTING</PanelTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {AGENTS.map((agent, i) => {
              const done    = i < agentStep;
              const active  = i === agentStep - 1;
              const pending = i >= agentStep;
              const color   = done ? '#00ff9d' : active ? '#00c8ff' : 'rgba(255,255,255,0.2)';
              return (
                <div key={i} style={{ animation: `fadeIn 0.4s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.78rem', color }}>
                      {agent.icon} {agent.name}
                    </span>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem', color }}>
                      {done ? '100%' : active ? '...' : '0%'}
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: done ? '100%' : active ? '60%' : '0%',
                      background: done
                        ? 'linear-gradient(90deg, #00ff9d, #00c8ff)'
                        : 'linear-gradient(90deg, #00c8ff, #ff00ff)',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease',
                      boxShadow: done ? '0 0 10px rgba(0,255,157,0.5)' : 'none',
                    }} />
                  </div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.3)',
                    marginTop: '0.2rem',
                  }}>{agent.desc}</div>
                </div>
              );
            })}
          </div>
        </Panel>
        <style>{`
          @keyframes fadeIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        `}</style>
      </div>
    );
  }

  // EMPTY STATE
  if (!result) {
    return (
      <Panel>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            color: 'rgba(0,255,157,0.3)',
            fontSize: '1rem',
            letterSpacing: '3px',
            marginBottom: '1rem',
          }}>⬡ AWAITING MARKET DATA</div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.8rem',
          }}>Select a market, enter a ticker and click ⚡ ANALYSE MARKET</div>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {['NVDA','AAPL','TSLA','BTC-USD','HSBA','TCS'].map(t => (
              <span key={t} style={{
                background: 'rgba(0,255,157,0.05)',
                border: '1px solid rgba(0,255,157,0.15)',
                borderRadius: '20px',
                padding: '0.3rem 1rem',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.75rem',
                color: 'rgba(0,255,157,0.4)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </Panel>
    );
  }

  // RESULTS STATE
  const report    = result.report    || {};
  const sentiment = result.sentiment || {};
  const fin       = result.financial_data || {};
  const rag       = result.rag_context    || {};
  const rec       = report.recommendation || 'N/A';
  const currency  = fin.currency || '$';
  const recColor  = rec === 'BUY' ? '#00ff9d' : rec === 'SELL' ? '#ff0066' : '#ffaa00';
  const sentColor = sentiment.sentiment === 'Bullish' ? '#00ff9d' : sentiment.sentiment === 'Bearish' ? '#ff0066' : '#ffaa00';

  const priceHistory = (fin.price_history || []).map((p: number, i: number) => ({ day: i + 1, price: p }));
  const ohlc = fin.ohlc || {};
  const volumeData = (ohlc.volume || []).map((v: number, i: number) => ({
    day: i + 1,
    volume: v,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem' }}>
        <MetricCard label="Recommendation" value={rec} color={recColor} big />
        <MetricCard label="Confidence" value={report.confidence || 'N/A'} color="#00c8ff" />
        <MetricCard label="Sentiment" value={sentiment.sentiment || 'N/A'} color={sentColor} />
        <MetricCard label="Live Price" value={fin.current_price || 'N/A'} color="#00ff9d" />
        <MetricCard label="24H Change" value={fin.change_percent || 'N/A'} color={(fin.change_percent || '').includes('-') ? '#ff0066' : '#00ff9d'} />
      </div>

      {/* RAG BADGE */}
      <div style={{
        background: 'rgba(0,200,255,0.06)',
        border: '1px solid rgba(0,200,255,0.25)',
        borderRadius: '10px',
        padding: '0.7rem 1rem',
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '2px', color: '#00c8ff' }}>◈ RAG · CHROMADB · VECTOR MEMORY</span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#fff' }}>📦 Embeddings: <b style={{ color: '#00c8ff' }}>{rag.total_stored || 0}</b></span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#fff' }}>✨ Fresh: <b style={{ color: '#00c8ff' }}>{rag.freshly_stored || 0}</b></span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#fff' }}>🧠 Model: <b style={{ color: '#00c8ff' }}>all-MiniLM-L6-v2</b></span>
        {report.rag_insight && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>💡 {report.rag_insight}</span>}
      </div>

      {/* DATA + REPORT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Panel>
          <PanelTitle>◈ Market Data Matrix</PanelTitle>
          {[
            ['ASSET',    fin.company_name || ticker],
            ['MARKET',   fin.market_label || result.market],
            ['52W HIGH', fin['52w_high'] || 'N/A'],
            ['52W LOW',  fin['52w_low']  || 'N/A'],
            ['DAY HIGH', fin.day_high    || 'N/A'],
            ['DAY LOW',  fin.day_low     || 'N/A'],
            ['VOLUME',   String(fin.volume || 'N/A')],
            ['AI TARGET',`${currency}${report.target_price || 'N/A'}`],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.4rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: '0.82rem',
            }}>
              <span style={{ color: 'rgba(0,255,157,0.5)' }}>{k}</span>
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{v}</span>
            </div>
          ))}
        </Panel>

        <Panel>
          <PanelTitle>◈ AI Intelligence Report</PanelTitle>
          <div style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.9,
            borderLeft: '2px solid #00ff9d',
            paddingLeft: '1rem',
            marginBottom: '1rem',
          }}>{report.reasoning || 'N/A'}</div>

          <PanelTitle>◈ News Summary</PanelTitle>
          <div style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.9,
            borderLeft: '2px solid #00c8ff',
            paddingLeft: '1rem',
            marginBottom: '1rem',
          }}>{report.news_summary || 'N/A'}</div>

          <PanelTitle>◈ Risk Vectors</PanelTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {(report.risks || []).map((r: string, i: number) => (
              <div key={i} style={{
                background: 'rgba(255,0,102,0.08)',
                border: '1px solid rgba(255,0,102,0.3)',
                borderRadius: '8px',
                padding: '0.4rem 0.6rem',
                fontFamily: "'Share Tech Mono',monospace",
                color: '#ff6699',
                fontSize: '0.72rem',
              }}>⚠ {r}</div>
            ))}
          </div>
        </Panel>
      </div>

      {/* CHARTS */}
      <Panel>
        <PanelTitle>◈ Price History — {ticker} · 30 Days</PanelTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: 'rgba(0,255,157,0.5)', marginBottom: '0.5rem', letterSpacing: '2px' }}>◈ LINE CHART</div>
            {priceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={priceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="day" stroke="rgba(0,255,157,0.2)" tick={{ fill: 'rgba(0,255,157,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                  <YAxis stroke="rgba(0,255,157,0.2)" tick={{ fill: 'rgba(0,255,157,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} domain={['auto', 'auto']} width={60} />
                  <Tooltip
                    contentStyle={{ background: '#000c20', border: '1px solid rgba(0,255,157,0.4)', borderRadius: '8px', fontFamily: 'Share Tech Mono', fontSize: '0.75rem' }}
                    labelStyle={{ color: '#00ff9d' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#00ff9d" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#00ff9d' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,255,157,0.3)', fontFamily: 'Share Tech Mono', fontSize: '0.75rem' }}>
                No price data available
              </div>
            )}
          </div>

          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: 'rgba(0,255,157,0.5)', marginBottom: '0.5rem', letterSpacing: '2px' }}>◈ VOLUME BARS</div>
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volumeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="day" stroke="rgba(0,255,157,0.2)" tick={{ fill: 'rgba(0,255,157,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                  <YAxis stroke="rgba(0,255,157,0.2)" tick={{ fill: 'rgba(0,255,157,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} width={60} />
                  <Tooltip
                    contentStyle={{ background: '#000c20', border: '1px solid rgba(0,255,157,0.4)', borderRadius: '8px', fontFamily: 'Share Tech Mono', fontSize: '0.75rem' }}
                    labelStyle={{ color: '#00ff9d' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Bar dataKey="volume" fill="#00c8ff" opacity={0.7} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,255,157,0.3)', fontFamily: 'Share Tech Mono', fontSize: '0.75rem' }}>
                No volume data available
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* SENTIMENT */}
      <Panel>
        <PanelTitle>◈ Sentiment Signal</PanelTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '1rem', fontWeight: 700, color: sentColor, textShadow: `0 0 15px ${sentColor}88` }}>
              {sentiment.sentiment || 'N/A'}
            </span>
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '1rem', color: sentColor }}>
              {((sentiment.score || 0) * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', height: '14px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(sentiment.score || 0) * 100}%`,
              background: `linear-gradient(90deg, ${sentColor}66, ${sentColor})`,
              borderRadius: '10px',
              boxShadow: `0 0 15px ${sentColor}66`,
              transition: 'width 1.5s ease',
            }} />
          </div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            {sentiment.summary || ''}
          </div>
        </div>
      </Panel>

      {/* EXPORT */}
      <button
        onClick={() => {
          const text = `FINAGENT GLOBAL REPORT\n${'='.repeat(50)}\nAsset: ${fin.company_name || ticker}\nRecommendation: ${rec}\nPrice: ${fin.current_price}\nChange: ${fin.change_percent}\nTarget: ${currency}${report.target_price}\n\nReasoning:\n${report.reasoning}\n\nRisks:\n${(report.risks || []).map((r: string) => '• ' + r).join('\n')}\n${'='.repeat(50)}\nNOT FINANCIAL ADVICE`;
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `finagent_${ticker}.txt`; a.click();
        }}
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,157,0.1), rgba(0,200,255,0.1))',
          border: '1px solid rgba(0,255,157,0.4)',
          borderRadius: '8px',
          color: '#00ff9d',
          fontFamily: "'Orbitron',monospace",
          fontSize: '0.75rem',
          letterSpacing: '2px',
          padding: '0.8rem',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,157,0.4)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
      >
        📄 EXPORT REPORT
      </button>

    </div>
  );
};

export default AnalysePanel;