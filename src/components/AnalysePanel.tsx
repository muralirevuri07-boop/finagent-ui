import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { jsPDF } from 'jspdf';
import { colors, font, radius } from '../tokens';

interface AnalysePanelProps {
  result: any;
  loading: boolean;
  agentStep: number;
  ticker: string;
}

const AGENTS = [
  { name: 'NEWS AGENT',      icon: '📰', desc: 'Scraping live market news via Tavily' },
  { name: 'RAG MEMORY',      icon: '🧠', desc: 'Retrieving historical context from ChromaDB' },
  { name: 'FINANCIAL DATA',  icon: '📊', desc: 'Fetching live price & fundamentals' },
  { name: 'HIST FINANCIALS', icon: '📂', desc: 'Loading 10-year financials via FMP' },
  { name: 'SENTIMENT AI',    icon: '💭', desc: 'Analysing market sentiment via Groq LLM' },
  { name: 'REPORT GEN',      icon: '📋', desc: 'Generating institutional-grade report' },
  { name: 'FINAL DECISION',  icon: '⚡', desc: 'Compiling AI recommendation' },
];

// ── 10-year financials table ──────────────────────────────────────────────────
const FinTable: React.FC<{
  title: string;
  rows: any[];
  cols: { key: string; label: string; accent?: string }[];
}> = ({ title, rows, cols }) => {
  const [yearFilter, setYearFilter] = React.useState<2 | 5 | 10>(10);
  if (!rows || rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => String(b.year).localeCompare(String(a.year)));
  const filtered = sorted.slice(0, yearFilter);
  const displayRows = [...filtered].reverse();

  const btnBase: React.CSSProperties = {
    fontFamily: "'Share Tech Mono',monospace",
    fontSize: '0.62rem',
    letterSpacing: '1px',
    padding: '0.2rem 0.55rem',
    border: '1px solid rgba(0,200,255,0.25)',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginLeft: '0.35rem',
  };

  return (
    <div style={{ marginBottom: '1.4rem', overflowX: 'auto' }}>
      {/* Header row with title + year filter buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: 'rgba(0,200,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', marginRight: '0.25rem' }}>SHOW</span>
          {([2, 5, 10] as const).map(y => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              style={{
                ...btnBase,
                background: yearFilter === y ? 'rgba(0,200,255,0.18)' : 'rgba(0,200,255,0.04)',
                color: yearFilter === y ? '#00c8ff' : 'rgba(255,255,255,0.4)',
                borderColor: yearFilter === y ? 'rgba(0,200,255,0.55)' : 'rgba(0,200,255,0.15)',
              }}
            >
              {y}Y
            </button>
          ))}
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Year</th>
            {cols.map(c => <th key={c.key} style={thStyle}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(0,200,255,0.03)' : 'transparent' }}>
              <td style={{ ...tdStyle, color: '#00c8ff', fontWeight: 'bold' }}>{row.year}</td>
              {cols.map(c => (
                <td key={c.key} style={{ ...tdStyle, color: c.accent || '#e0e8ff' }}>
                  {row[c.key] ?? 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  fontFamily: "'Share Tech Mono',monospace",
  fontSize: '0.62rem',
  color: 'rgba(0,255,157,0.5)',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  padding: '0.4rem 0.6rem',
  borderBottom: '1px solid rgba(0,255,157,0.15)',
  textAlign: 'right',
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  fontFamily: "'Share Tech Mono',monospace",
  fontSize: '0.78rem',
  padding: '0.35rem 0.6rem',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  textAlign: 'right',
};

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
  }}>
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
    }}>{value}</div>
  </div>
);

const ScenarioCard: React.FC<{
  label: string; price: string; upside?: string; color: string; isBase?: boolean;
}> = ({ label, price, upside, color, isBase }) => (
  <div style={{
    background: isBase ? `rgba(0,200,255,0.08)` : 'rgba(0,5,16,0.8)',
    border: `1px solid ${color}55`,
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
    position: 'relative',
    flex: 1,
  }}>
    {isBase && (
      <div style={{
        position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
        background: color, color: '#000', fontSize: '0.55rem', fontFamily: "'Orbitron',monospace",
        letterSpacing: '2px', padding: '2px 10px', borderRadius: '0 0 6px 6px', fontWeight: 900,
      }}>BASE CASE</div>
    )}
    <div style={{ fontFamily: "'Share Tech Mono',monospace", color: `${color}88`, fontSize: '0.6rem', letterSpacing: '2px', marginBottom: '0.4rem', marginTop: isBase ? '0.6rem' : 0 }}>
      {label}
    </div>
    <div style={{ fontFamily: "'Orbitron',monospace", color, fontSize: '1.3rem', fontWeight: 900, textShadow: `0 0 15px ${color}66` }}>
      {price}
    </div>
    {upside && (
      <div style={{ fontFamily: "'Share Tech Mono',monospace", color: `${color}aa`, fontSize: '0.72rem', marginTop: '0.3rem' }}>
        {upside}
      </div>
    )}
  </div>
);

const DataRow: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.4rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontFamily: "'Share Tech Mono',monospace",
    fontSize: '0.82rem',
  }}>
    <span style={{ color: 'rgba(0,255,157,0.5)' }}>{label}</span>
    <span style={{ color: accent || '#ffffff', fontWeight: 'bold' }}>{value}</span>
  </div>
);

type ResearchTab = 'overview' | 'fundamentals' | 'valuation' | 'ai_report' | 'charts' | 'risk';

const RESEARCH_TABS: { id: ResearchTab; label: string; icon: string }[] = [
  { id: 'overview',     label: 'Overview',      icon: '◈' },
  { id: 'fundamentals', label: 'Fundamentals',  icon: '📊' },
  { id: 'valuation',    label: 'Valuation',     icon: '⚖' },
  { id: 'ai_report',   label: 'AI Report',     icon: '🤖' },
  { id: 'charts',      label: 'Charts',        icon: '📈' },
  { id: 'risk',        label: 'Risk',          icon: '⚠' },
];

const AnalysePanel: React.FC<AnalysePanelProps> = ({ result, loading, agentStep, ticker }) => {
  const [activeTab, setActiveTab] = useState<ResearchTab>('overview');

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Panel>
          <PanelTitle>◈ AGENT PIPELINE — EXECUTING</PanelTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {AGENTS.map((agent, i) => {
              const done   = i < agentStep;
              const active = i === agentStep - 1;
              const color  = done ? '#00ff9d' : active ? '#00c8ff' : 'rgba(255,255,255,0.2)';
              return (
                <div key={i}>
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
                    }} />
                  </div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>
                    {agent.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    );
  }

  if (!result) {
    return (
      <Panel>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontFamily: "'Orbitron', monospace", color: 'rgba(0,255,157,0.3)', fontSize: '1rem', letterSpacing: '3px', marginBottom: '1rem' }}>
            ⬡ AWAITING MARKET DATA
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            Select a market, enter a ticker and click ⚡ ANALYSE MARKET
          </div>
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

  const report    = result.report                 || {};
  const sentiment = result.sentiment              || {};
  const fin       = result.financial_data         || {};
  const rag       = result.rag_context            || {};
  const valuation = result.valuation              || {};
  const signal    = result.signal                 || {};
  const histFin   = result.historical_financials  || {};
  const rec       = report.recommendation || 'N/A';
  const currency  = fin.currency || '$';
  const recColor  = rec === 'BUY' ? '#00ff9d' : rec === 'SELL' ? '#ff0066' : '#ffaa00';
  const sentColor = sentiment.sentiment === 'Bullish' ? '#00ff9d' : sentiment.sentiment === 'Bearish' ? '#ff0066' : '#ffaa00';

  const priceHistory = (fin.price_history || []).map((p: number, i: number) => ({ day: i + 1, price: p }));
  const ohlc         = fin.ohlc || {};
  const volumeData   = (ohlc.volume || []).map((v: number, i: number) => ({ day: i + 1, volume: v }));

  // Valuation — prefer top-level valuation object, fall back to report fields
  const valAvailable     = valuation.available   ?? report.valuation_available        ?? false;
  const valMethod        = valuation.method       || report.valuation_method           || 'N/A';
  const valBear          = valuation.bear         ?? report.target_bear;
  const valBase          = valuation.base         ?? report.target_price;
  const valBull          = valuation.bull         ?? report.target_bull;
  const valUpside        = valuation.upside_base  || report.valuation_upside           || 'N/A';
  const valHorizon       = valuation.horizon      || '12 months';
  const valAssumptions   = valuation.assumptions  || report.valuation_assumptions      || {};
  const valCurrency      = valuation.currency     || currency;
  const valUnavailReason = valuation.unavailable_reason || report.valuation_unavailable_reason || '';

  const fmtVal = (v: number | null | undefined) =>
    v != null ? `${valCurrency}${v.toLocaleString()}` : 'N/A';

  const upsideNum   = parseFloat((valUpside || '').replace('%',''));
  const upsideColor = isNaN(upsideNum) ? '#ffaa00' : upsideNum > 0 ? '#00ff9d' : '#ff0066';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* RESEARCH TABS */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        background: 'rgba(0,8,22,0.7)',
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: '0.3rem',
        backdropFilter: 'blur(16px)',
        flexWrap: 'wrap',
      }}>
        {RESEARCH_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? colors.bgActive : 'transparent',
              border: `1px solid ${activeTab === tab.id ? colors.borderHi : 'transparent'}`,
              borderRadius: '6px',
              color: activeTab === tab.id ? colors.textTeal : colors.textDim,
              fontFamily: font.mono,
              fontSize: '0.72rem',
              letterSpacing: '0.5px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
              transition: 'all 0.18s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = colors.textSecondary; }}
            onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = colors.textDim; }}
          >
            <span style={{ fontSize: '0.75rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TOP METRICS — always visible */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.8rem' }}>
        <MetricCard label="Recommendation" value={rec}                                                         color={recColor}  big />
        <MetricCard label="Signal Score"   value={signal.score != null ? `${signal.score}/100` : 'N/A'}        color={signal.tier === 'strong_buy' || signal.tier === 'buy' ? '#00ff9d' : signal.tier === 'strong_sell' || signal.tier === 'sell' ? '#ff0066' : '#ffaa00'} />
        <MetricCard label="Confidence"     value={report.confidence || 'N/A'}                                  color="#00c8ff" />
        <MetricCard label="Sentiment"      value={sentiment.sentiment || 'N/A'}                                color={sentColor} />
        <MetricCard label="Live Price"     value={fin.current_price  || 'N/A'}                                 color="#00ff9d" />
        <MetricCard label="24H Change"     value={fin.change_percent || 'N/A'}                                 color={(fin.change_percent || '').includes('-') ? '#ff0066' : '#00ff9d'} />
      </div>

      {/* DCF VALUATION — valuation tab */}
      {(activeTab === 'valuation' || activeTab === 'overview') && <Panel>
        <PanelTitle>◈ DCF Valuation · {valMethod} · {valHorizon}</PanelTitle>

        {valAvailable ? (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <ScenarioCard label="🐻 Bear Case" price={fmtVal(valBear)} color="#ff6644" />
              <ScenarioCard label="⚖ Base Case" price={fmtVal(valBase)} upside={valUpside} color="#00c8ff" isBase />
              <ScenarioCard label="🐂 Bull Case" price={fmtVal(valBull)} color="#00ff9d" />
            </div>

            <div style={{
              background: `${upsideColor}11`,
              border: `1px solid ${upsideColor}44`,
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                Upside to Base vs Current Price
              </span>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '1rem', fontWeight: 900, color: upsideColor, textShadow: `0 0 15px ${upsideColor}66` }}>
                {valUpside}
              </span>
            </div>

            {Object.keys(valAssumptions).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {Object.entries(valAssumptions).map(([k, v]) => (
                  <div key={k} style={{
                    background: 'rgba(0,200,255,0.04)',
                    border: '1px solid rgba(0,200,255,0.12)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.7rem',
                  }}>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.58rem', color: 'rgba(0,200,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      {k.replace(/_/g,' ')}
                    </div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#fff' }}>
                      {String(v)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: 'rgba(255,170,0,0.07)',
            border: '1px solid rgba(255,170,0,0.3)',
            borderRadius: '10px',
            padding: '1rem',
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: '0.8rem',
            color: '#ffaa00',
          }}>
            ⚠ Valuation unavailable — {valUnavailReason || 'insufficient data for this asset type'}
          </div>
        )}
      </Panel>}

      {/* RAG BADGE — overview + ai_report */}
      {(activeTab === 'overview' || activeTab === 'ai_report') && <div style={{
        background: 'rgba(0,200,255,0.06)',
        border: '1px solid rgba(0,200,255,0.25)',
        borderRadius: '10px',
        padding: '0.7rem 1rem',
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '2px', color: '#00c8ff' }}>◈ RAG · VECTOR MEMORY</span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#fff' }}>📦 Embeddings: <b style={{ color: '#00c8ff' }}>{rag.total_stored || 0}</b></span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#fff' }}>✨ Fresh: <b style={{ color: '#00c8ff' }}>{rag.freshly_stored || 0}</b></span>
        {report.rag_insight && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>💡 {report.rag_insight}</span>}
      </div>}

      {/* MARKET DATA + FUNDAMENTALS — fundamentals + overview tabs */}
      {(activeTab === 'fundamentals' || activeTab === 'overview') && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Panel>
          <PanelTitle>◈ Market Data</PanelTitle>
          <DataRow label="ASSET"    value={fin.company_name || ticker} />
          <DataRow label="MARKET"   value={fin.market_label || result.market} />
          <DataRow label="52W HIGH" value={fin['52w_high'] || 'N/A'} />
          <DataRow label="52W LOW"  value={fin['52w_low']  || 'N/A'} />
          <DataRow label="DAY HIGH" value={fin.day_high    || 'N/A'} />
          <DataRow label="DAY LOW"  value={fin.day_low     || 'N/A'} />
          <DataRow label="VOLUME"   value={String(fin.volume || 'N/A')} />
          <DataRow label="BETA"     value={String(fin.beta  || 'N/A')} />
          <DataRow label="SECTOR"   value={fin.sector   || 'N/A'} />
          <DataRow label="INDUSTRY" value={fin.industry || 'N/A'} />
        </Panel>

        <Panel>
          <PanelTitle>◈ Fundamentals</PanelTitle>
          <DataRow label="MARKET CAP"    value={fin.market_cap        || 'N/A'} />
          <DataRow label="EV"            value={fin.enterprise_value  || 'N/A'} />
          <DataRow label="P/E (TTM)"     value={String(fin.pe_ratio   || 'N/A')} />
          <DataRow label="FWD P/E"       value={String(fin.forward_pe || 'N/A')} />
          <DataRow label="P/B"           value={String(fin.price_to_book || 'N/A')} />
          <DataRow label="EV/EBITDA"     value={String(fin.ev_to_ebitda  || 'N/A')} />
          <DataRow label="EPS (TTM)"     value={String(fin.eps_ttm    || 'N/A')} />
          <DataRow label="EPS FWD"       value={String(fin.eps_forward|| 'N/A')} />
          <DataRow label="REVENUE TTM"   value={fin.revenue_ttm       || 'N/A'} />
          <DataRow label="GROSS MARGIN"  value={fin.gross_margin      || 'N/A'} accent="#00ff9d" />
          <DataRow label="OP MARGIN"     value={fin.operating_margin  || 'N/A'} accent="#00c8ff" />
          <DataRow label="NET MARGIN"    value={fin.net_margin        || 'N/A'} accent="#00c8ff" />
          <DataRow label="FREE CF"       value={fin.free_cashflow     || 'N/A'} accent="#00ff9d" />
          <DataRow label="TOTAL CASH"    value={fin.total_cash        || 'N/A'} />
          <DataRow label="TOTAL DEBT"    value={fin.total_debt        || 'N/A'} accent="#ff6644" />
          <DataRow label="DIV YIELD"     value={fin.dividend_yield    || 'N/A'} />
        </Panel>
      </div>}

      {/* 10-YEAR FINANCIALS — fundamentals tab only */}
      {histFin.available && (activeTab === 'fundamentals' || activeTab === 'overview') && (
        <Panel>
          <PanelTitle>◈ 10-Year Financial Statements · {histFin.symbol} · {histFin.years_available} years</PanelTitle>

          {/* Trend badges */}
          {histFin.trends && Object.keys(histFin.trends).length > 0 && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {Object.entries(histFin.trends).map(([k, v]) => {
                const up = String(v).startsWith('↑') || String(v).startsWith('+');
                const color = up ? '#00ff9d' : '#ff6644';
                return (
                  <div key={k} style={{
                    background: `${color}11`,
                    border: `1px solid ${color}44`,
                    borderRadius: '20px',
                    padding: '0.25rem 0.75rem',
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: '0.7rem',
                    color,
                  }}>
                    {k.replace(/_/g,' ').toUpperCase()}: <b>{String(v)}</b>
                  </div>
                );
              })}
            </div>
          )}

          <FinTable
            title="Income Statement"
            rows={histFin.income_statement || []}
            cols={[
              { key: 'revenue',          label: 'Revenue' },
              { key: 'gross_profit',     label: 'Gross Profit', accent: '#00ff9d' },
              { key: 'operating_income', label: 'Op Income',    accent: '#00c8ff' },
              { key: 'net_income',       label: 'Net Income',   accent: '#00ff9d' },
              { key: 'ebitda',           label: 'EBITDA' },
              { key: 'eps',              label: 'EPS',          accent: '#00c8ff' },
              { key: 'gross_margin',     label: 'Gross %',      accent: '#00ff9d' },
              { key: 'op_margin',        label: 'Op %',         accent: '#00c8ff' },
              { key: 'net_margin',       label: 'Net %',        accent: '#00c8ff' },
            ]}
          />

          <FinTable
            title="Balance Sheet"
            rows={histFin.balance_sheet || []}
            cols={[
              { key: 'total_assets',      label: 'Total Assets' },
              { key: 'total_liabilities', label: 'Liabilities',  accent: '#ff6644' },
              { key: 'total_equity',      label: 'Equity',       accent: '#00ff9d' },
              { key: 'cash',              label: 'Cash',         accent: '#00ff9d' },
              { key: 'total_debt',        label: 'Total Debt',   accent: '#ff6644' },
              { key: 'net_debt',          label: 'Net Debt',     accent: '#ff6644' },
              { key: 'book_value_share',  label: 'BV/Share',     accent: '#00c8ff' },
            ]}
          />

          <FinTable
            title="Cash Flow"
            rows={histFin.cash_flow || []}
            cols={[
              { key: 'operating_cf',   label: 'Op CF',       accent: '#00c8ff' },
              { key: 'capex',          label: 'CapEx',       accent: '#ff6644' },
              { key: 'free_cashflow',  label: 'Free CF',     accent: '#00ff9d' },
              { key: 'dividends_paid', label: 'Dividends',   accent: '#ffaa00' },
              { key: 'share_buybacks', label: 'Buybacks',    accent: '#ffaa00' },
            ]}
          />
        </Panel>
      )}

      {/* AI REPORT — ai_report + overview tabs */}
      {(activeTab === 'ai_report' || activeTab === 'overview') && <Panel>
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
      </Panel>}

      {/* CHARTS — charts + overview tabs */}
      {(activeTab === 'charts' || activeTab === 'overview') && <Panel>
        <PanelTitle>◈ Price History — {ticker} · 30 Days</PanelTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: 'rgba(0,255,157,0.5)', marginBottom: '0.5rem', letterSpacing: '2px' }}>◈ LINE CHART</div>
            {priceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={priceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="day" stroke="rgba(0,255,157,0.2)" tick={{ fill: 'rgba(0,255,157,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                  <YAxis stroke="rgba(0,255,157,0.2)" tick={{ fill: 'rgba(0,255,157,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} domain={['auto','auto']} width={60} />
                  <Tooltip contentStyle={{ background: '#000c20', border: '1px solid rgba(0,255,157,0.4)', borderRadius: '8px', fontFamily: 'Share Tech Mono', fontSize: '0.75rem' }} labelStyle={{ color: '#00ff9d' }} itemStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="price" stroke="#00ff9d" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#00ff9d' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,255,157,0.3)', fontFamily: 'Share Tech Mono', fontSize: '0.75rem' }}>No price data available</div>
            )}
          </div>

          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: 'rgba(0,255,157,0.5)', marginBottom: '0.5rem', letterSpacing: '2px' }}>◈ VOLUME BARS</div>
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volumeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="day" stroke="rgba(0,255,157,0.2)" tick={{ fill: 'rgba(0,255,157,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                  <YAxis stroke="rgba(0,255,157,0.2)" tick={{ fill: 'rgba(0,255,157,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} width={60} />
                  <Tooltip contentStyle={{ background: '#000c20', border: '1px solid rgba(0,255,157,0.4)', borderRadius: '8px', fontFamily: 'Share Tech Mono', fontSize: '0.75rem' }} labelStyle={{ color: '#00ff9d' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="volume" fill="#00c8ff" opacity={0.7} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,255,157,0.3)', fontFamily: 'Share Tech Mono', fontSize: '0.75rem' }}>No volume data available</div>
            )}
          </div>
        </div>
      </Panel>}

      {/* SENTIMENT — overview + ai_report */}
      {(activeTab === 'overview' || activeTab === 'ai_report') && <Panel>
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
      </Panel>}

      {/* RISK — risk + overview */}
      {(activeTab === 'risk' || activeTab === 'overview') && (report.risks || []).length > 0 && <Panel>
        <PanelTitle>◈ Risk Vectors</PanelTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          {(report.risks || []).map((r: string, i: number) => (
            <div key={i} style={{
              background: 'rgba(255,0,102,0.08)',
              border: '1px solid rgba(255,0,102,0.3)',
              borderRadius: '8px',
              padding: '0.5rem 0.7rem',
              fontFamily: "'Share Tech Mono',monospace",
              color: '#ff6699',
              fontSize: '0.73rem',
              lineHeight: 1.5,
            }}>⚠ {r}</div>
          ))}
        </div>
      </Panel>}

      {/* EXPORT BUTTONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>

      {/* PDF export */}
      <button
        onClick={() => {
          const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const W = 210; const margin = 14; const col = W - margin * 2;
          let y = 0;

          const addPage = () => { doc.addPage(); y = 14; };
          const checkY = (need: number) => { if (y + need > 280) addPage(); };

          // ── Header bar ──
          doc.setFillColor(0, 5, 20);
          doc.rect(0, 0, W, 28, 'F');
          doc.setTextColor(0, 255, 157);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('FINAGENT GLOBAL', margin, 11);
          doc.setFontSize(8);
          doc.setTextColor(0, 200, 255);
          doc.text('AI-POWERED MARKET ANALYSIS REPORT', margin, 18);
          doc.setTextColor(120, 120, 140);
          doc.setFont('helvetica', 'normal');
          doc.text(`${fin.company_name || ticker}  ·  ${fin.market_label || result.market}  ·  ${new Date().toUTCString()}`, margin, 24);
          y = 36;

          // ── Section helper ──
          const section = (title: string) => {
            checkY(14);
            doc.setFillColor(0, 20, 45);
            doc.rect(margin, y - 4, col, 9, 'F');
            doc.setTextColor(0, 255, 157);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin + 2, y + 2);
            y += 10;
          };

          const row = (label: string, value: string, accent?: [number,number,number]) => {
            checkY(7);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 140, 120);
            doc.text(label, margin + 2, y);
            doc.setTextColor(...(accent || [220, 220, 240] as [number,number,number]));
            doc.text(String(value), margin + 65, y);
            y += 6;
          };

          const body = (text: string, color?: [number,number,number]) => {
            const lines = doc.splitTextToSize(text || 'N/A', col - 4);
            lines.forEach((line: string) => {
              checkY(6);
              doc.setFontSize(8);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(...(color || [200, 210, 230] as [number,number,number]));
              doc.text(line, margin + 2, y);
              y += 5.5;
            });
            y += 2;
          };

          // ── Recommendation ──
          section('RECOMMENDATION');
          const recRGB: [number,number,number] = rec === 'BUY' ? [0,255,157] : rec === 'SELL' ? [255,0,102] : [255,170,0];
          row('Signal',     rec,                         recRGB);
          row('Confidence', report.confidence || 'N/A');
          row('Signal Score', `${result.signal?.score ?? report.signal_score ?? 'N/A'}/100`);
          row('Score Breakdown', result.signal?.explanation || report.signal_explanation || 'N/A');
          row('Sentiment',  `${sentiment.sentiment || 'N/A'} (${((sentiment.score||0)*100).toFixed(0)}%)`);

          // ── Price ──
          section('PRICE & MARKET DATA');
          row('Current Price', fin.current_price || 'N/A', [0,255,157]);
          row('24H Change',    fin.change_percent || 'N/A');
          row('52W High',      fin['52w_high'] || 'N/A');
          row('52W Low',       fin['52w_low']  || 'N/A');
          row('Beta',          String(fin.beta  || 'N/A'));
          row('Sector',        fin.sector   || 'N/A');
          row('Industry',      fin.industry || 'N/A');

          // ── Valuation ──
          section(`VALUATION  (${valMethod} · ${valHorizon})`);
          if (valAvailable) {
            row('Bear Case', fmtVal(valBear), [255,100,70]);
            row('Base Case', fmtVal(valBase), [0,200,255]);
            row('Bull Case', fmtVal(valBull), [0,255,157]);
            row('Upside to Base', valUpside, upsideNum > 0 ? [0,255,157] : [255,0,102]);
            Object.entries(valAssumptions).forEach(([k,v]) => row(k.replace(/_/g,' '), String(v)));
          } else {
            row('Status', valUnavailReason || 'Unavailable', [255,170,0]);
          }

          // ── Fundamentals ──
          section('FUNDAMENTALS');
          row('Market Cap',    fin.market_cap        || 'N/A');
          row('P/E (TTM)',     String(fin.pe_ratio   || 'N/A'));
          row('Fwd P/E',      String(fin.forward_pe || 'N/A'));
          row('EPS (TTM)',     String(fin.eps_ttm    || 'N/A'));
          row('Revenue TTM',  fin.revenue_ttm       || 'N/A');
          row('Gross Margin', fin.gross_margin      || 'N/A', [0,255,157]);
          row('Op Margin',    fin.operating_margin  || 'N/A', [0,200,255]);
          row('Net Margin',   fin.net_margin        || 'N/A', [0,200,255]);
          row('Free CF',      fin.free_cashflow     || 'N/A', [0,255,157]);
          row('Total Cash',   fin.total_cash        || 'N/A');
          row('Total Debt',   fin.total_debt        || 'N/A', [255,100,70]);

          // ── Analysis ──
          section('AI ANALYSIS');
          body(report.reasoning || 'N/A');

          section('NEWS SUMMARY');
          body(report.news_summary || 'N/A');

          section('RISK VECTORS');
          (report.risks || []).forEach((r: string) => body(`• ${r}`, [255,100,120]));

          // ── Footer ──
          const pages = (doc as any).internal.getNumberOfPages();
          for (let i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(80, 90, 110);
            doc.text('NOT FINANCIAL ADVICE — For informational purposes only. Generated by FinAgent Global · finagent-ui.vercel.app', margin, 292);
            doc.text(`Page ${i}/${pages}`, W - margin - 10, 292);
          }

          doc.save(`finagent_${ticker}_${Date.now()}.pdf`);
        }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,0,102,0.08), rgba(255,100,70,0.08))',
          border: '1px solid rgba(255,100,70,0.4)',
          borderRadius: '8px',
          color: '#ff6644',
          fontFamily: "'Orbitron',monospace",
          fontSize: '0.75rem',
          letterSpacing: '2px',
          padding: '0.8rem',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(255,100,70,0.4)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
      >
        📑 EXPORT PDF REPORT
      </button>

      {/* TXT export */}
      <button
        onClick={() => {
          const sep  = '='.repeat(60);
          const sep2 = '-'.repeat(60);
          const assumptions = Object.entries(valAssumptions)
            .map(([k, v]) => `  ${k.replace(/_/g,' ')}: ${v}`)
            .join('\n');

          const text = [
            'FINAGENT GLOBAL — ANALYSIS REPORT',
            sep,
            `Asset      : ${fin.company_name || ticker}`,
            `Market     : ${fin.market_label || result.market}`,
            `Date       : ${new Date().toUTCString()}`,
            sep,
            'RECOMMENDATION',
            sep2,
            `  Signal     : ${rec}`,
            `  Confidence : ${report.confidence || 'N/A'}`,
            `  Sentiment  : ${sentiment.sentiment || 'N/A'} (${((sentiment.score||0)*100).toFixed(0)}%)`,
            sep,
            'PRICE',
            sep2,
            `  Current    : ${fin.current_price || 'N/A'}`,
            `  Change     : ${fin.change_percent || 'N/A'}`,
            `  52W High   : ${fin['52w_high'] || 'N/A'}`,
            `  52W Low    : ${fin['52w_low']  || 'N/A'}`,
            sep,
            `VALUATION  (${valMethod} · ${valHorizon})`,
            sep2,
            `  Bear Case  : ${fmtVal(valBear)}`,
            `  Base Case  : ${fmtVal(valBase)}  ← ${valUpside} upside`,
            `  Bull Case  : ${fmtVal(valBull)}`,
            '',
            'Assumptions:',
            assumptions || '  N/A',
            sep,
            'FUNDAMENTALS',
            sep2,
            `  Market Cap     : ${fin.market_cap       || 'N/A'}`,
            `  P/E (TTM)      : ${fin.pe_ratio         || 'N/A'}`,
            `  Fwd P/E        : ${fin.forward_pe       || 'N/A'}`,
            `  EPS (TTM)      : ${fin.eps_ttm          || 'N/A'}`,
            `  Revenue TTM    : ${fin.revenue_ttm      || 'N/A'}`,
            `  Gross Margin   : ${fin.gross_margin     || 'N/A'}`,
            `  Op Margin      : ${fin.operating_margin || 'N/A'}`,
            `  Net Margin     : ${fin.net_margin       || 'N/A'}`,
            `  Free Cash Flow : ${fin.free_cashflow    || 'N/A'}`,
            `  Total Cash     : ${fin.total_cash       || 'N/A'}`,
            `  Total Debt     : ${fin.total_debt       || 'N/A'}`,
            `  Beta           : ${fin.beta             || 'N/A'}`,
            `  Sector         : ${fin.sector           || 'N/A'}`,
            sep,
            'ANALYSIS',
            sep2,
            report.reasoning || 'N/A',
            '',
            'RISKS',
            sep2,
            ...(report.risks || []).map((r: string) => `  • ${r}`),
            '',
            'NEWS SUMMARY',
            sep2,
            report.news_summary || 'N/A',
            sep,
            'DISCLAIMER: NOT FINANCIAL ADVICE. For informational purposes only.',
            'Generated by FinAgent Global — finagent-ui.vercel.app',
          ].join('\n');

          const blob = new Blob([text], { type: 'text/plain' });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href     = url;
          a.download = `finagent_${ticker}_${Date.now()}.txt`;
          a.click();
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
        📄 EXPORT REPORT (.TXT)
      </button>

      </div>{/* end export grid */}

    </div>
  );
};

export default AnalysePanel;
