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
  { name: 'FINANCIAL DATA',  icon: '📊', desc: 'Fetching live price & fundamentals' },
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

const AnalysePanel: React.FC<AnalysePanelProps> = ({ result, loading, agentStep, ticker }) => {

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

  const report    = result.report         || {};
  const sentiment = result.sentiment      || {};
  const fin       = result.financial_data || {};
  const rag       = result.rag_context    || {};
  const valuation = result.valuation      || {};
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

      {/* TOP METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem' }}>
        <MetricCard label="Recommendation" value={rec}                          color={recColor}  big />
        <MetricCard label="Confidence"     value={report.confidence || 'N/A'}   color="#00c8ff" />
        <MetricCard label="Sentiment"      value={sentiment.sentiment || 'N/A'} color={sentColor} />
        <MetricCard label="Live Price"     value={fin.current_price  || 'N/A'}  color="#00ff9d" />
        <MetricCard label="24H Change"     value={fin.change_percent || 'N/A'}  color={(fin.change_percent || '').includes('-') ? '#ff0066' : '#00ff9d'} />
      </div>

      {/* DCF VALUATION */}
      <Panel>
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
      </Panel>

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
        <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '2px', color: '#00c8ff' }}>◈ RAG · VECTOR MEMORY</span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#fff' }}>📦 Embeddings: <b style={{ color: '#00c8ff' }}>{rag.total_stored || 0}</b></span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#fff' }}>✨ Fresh: <b style={{ color: '#00c8ff' }}>{rag.freshly_stored || 0}</b></span>
        {report.rag_insight && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>💡 {report.rag_insight}</span>}
      </div>

      {/* MARKET DATA + FUNDAMENTALS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
      </div>

      {/* AI REPORT */}
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
        📄 EXPORT FULL REPORT (.TXT)
      </button>

    </div>
  );
};

export default AnalysePanel;
