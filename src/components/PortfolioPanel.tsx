/**
 * PortfolioPanel — Portfolio Intelligence & Risk Engine UI
 *
 * Holdings stored in localStorage (no server DB).
 * POST /portfolio/analyse → full analysis.
 *
 * Tabs: Holdings | Risk | Allocation | Scenario
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { colors, font, radius, cardStyle } from '../tokens';

const API = 'https://finagent-api-k9em.onrender.com';
const LS_KEY = 'finagent_portfolio_holdings';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Holding {
  id: string;
  symbol: string;
  market: string;
  quantity: number;
  purchase_price?: number;
  purchase_currency?: string;
  notes?: string;
}

type Tab = 'holdings' | 'risk' | 'allocation' | 'scenario';

const MARKETS = ['US','NSE','BSE','LSE','Frankfurt','Tokyo','HongKong','Singapore','Crypto'];

// ── Helpers ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

function fmt(n: number | null | undefined, digits = 2, suffix = '') {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + suffix;
}

function fmtCcy(n: number | null | undefined, ccy = 'USD') {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 2 }).format(n);
}

function pnlColor(v: number | null | undefined) {
  if (v == null) return colors.textSecondary;
  return v >= 0 ? colors.green : colors.red;
}

// ── Palette for charts ─────────────────────────────────────────────────────────
const PALETTE = ['#00c8ff','#00e87a','#a259ff','#ffaa00','#ff4466','#00b4d8','#7fff00','#ff7700','#ff66cc','#56cfb2'];

// ── Sub-components ─────────────────────────────────────────────────────────────
const Pill: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 100 }}>
    <span style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    <span style={{ fontFamily: font.mono, fontSize: '0.85rem', color: color ?? colors.textPrimary, fontWeight: 600 }}>{value}</span>
  </div>
);

const MetricCard: React.FC<{ title: string; value: string; sub?: string; color?: string }> = ({ title, value, sub, color }) => (
  <div style={{
    background: 'rgba(0,200,255,0.04)', border: `1px solid ${colors.border}`,
    borderRadius: radius.md, padding: '0.75rem 1rem', minWidth: 130,
  }}>
    <div style={{ fontFamily: font.mono, fontSize: '0.58rem', color: colors.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
    <div style={{ fontFamily: font.mono, fontSize: '1.1rem', color: color ?? colors.teal, fontWeight: 700 }}>{value}</div>
    {sub && <div style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.textDim, marginTop: 2 }}>{sub}</div>}
  </div>
);

const Unavail: React.FC<{ reason?: string }> = ({ reason }) => (
  <span style={{ fontFamily: font.mono, fontSize: '0.7rem', color: colors.textDim }}>
    {reason ? `— ${reason}` : '—'}
  </span>
);

// ── Main component ─────────────────────────────────────────────────────────────
const PortfolioPanel: React.FC = () => {
  // Holdings state
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Holding>>({ market: 'US' });

  // Analysis state
  const [tab, setTab]       = useState<Tab>('holdings');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [error, setError]     = useState<string | null>(null);

  // Config
  const [baseCcy, setBaseCcy]   = useState('USD');
  const [rfRate, setRfRate]     = useState(4.5);
  const [histDays, setHistDays] = useState(252);

  // Scenario shocks
  const [shocks, setShocks] = useState<Record<string, string>>({});

  // Persist holdings
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(holdings)); } catch {}
  }, [holdings]);

  const addHolding = () => {
    if (!form.symbol || !form.quantity) return;
    const h: Holding = {
      id: uid(),
      symbol: form.symbol.toUpperCase(),
      market: form.market || 'US',
      quantity: Number(form.quantity),
      purchase_price: form.purchase_price ? Number(form.purchase_price) : undefined,
      purchase_currency: form.purchase_currency || undefined,
      notes: form.notes || undefined,
    };
    setHoldings(prev => [...prev, h]);
    setForm({ market: 'US' });
    setShowForm(false);
  };

  const removeHolding = (id: string) => setHoldings(prev => prev.filter(h => h.id !== id));

  const analyse = useCallback(async () => {
    if (!holdings.length) return;
    setLoading(true);
    setError(null);
    setResult(null);

    // Build scenario shocks (only non-empty entries)
    const scenarioShocks: Record<string, number> = {};
    Object.entries(shocks).forEach(([sym, val]) => {
      const n = parseFloat(val);
      if (!isNaN(n)) scenarioShocks[sym] = n / 100;
    });

    const payload: any = {
      name: 'My Portfolio',
      base_currency: baseCcy,
      holdings: holdings.map(h => ({
        symbol: h.symbol,
        market: h.market,
        quantity: h.quantity,
        purchase_price: h.purchase_price,
        purchase_currency: h.purchase_currency,
        notes: h.notes,
      })),
      risk_free_rate: rfRate / 100,
      history_days: histDays,
    };
    if (Object.keys(scenarioShocks).length) payload.scenario_shocks = scenarioShocks;

    try {
      const res = await fetch(`${API}/portfolio/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setTab('risk');
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    }
    setLoading(false);
  }, [holdings, baseCcy, rfRate, histDays, shocks]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const valuation = result?.valuation;
  const concentration = result?.concentration;
  const risk = result?.risk;
  const scenario = result?.scenario;

  return (
    <div style={{ ...cardStyle, padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontFamily: font.heading, fontSize: '0.85rem', color: colors.teal, letterSpacing: 2 }}>
          ◈ PORTFOLIO INTELLIGENCE
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Base currency */}
          <select value={baseCcy} onChange={e => setBaseCcy(e.target.value)} style={selectStyle}>
            {['USD','EUR','GBP','INR','JPY','HKD','SGD','AUD','CAD'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {/* Analyse button */}
          <button
            onClick={analyse}
            disabled={loading || !holdings.length}
            style={{
              fontFamily: font.mono, fontSize: '0.7rem',
              background: loading ? 'rgba(0,200,255,0.08)' : 'rgba(0,200,255,0.15)',
              border: `1px solid ${colors.teal}`, borderRadius: radius.pill,
              color: colors.teal, padding: '0.3rem 0.9rem', cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? '⟳ Analysing…' : '▶ Analyse'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.5rem' }}>
        {(['holdings','risk','allocation','scenario'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            fontFamily: font.mono, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1,
            background: tab === t ? 'rgba(0,200,255,0.12)' : 'transparent',
            border: tab === t ? `1px solid ${colors.border}` : '1px solid transparent',
            borderRadius: radius.sm, padding: '0.25rem 0.7rem',
            color: tab === t ? colors.teal : colors.textDim, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ fontFamily: font.mono, fontSize: '0.72rem', color: colors.red, background: 'rgba(255,68,102,0.08)', border: `1px solid rgba(255,68,102,0.25)`, borderRadius: radius.sm, padding: '0.5rem 0.75rem' }}>
          ✗ {error}
        </div>
      )}

      {/* Data warnings */}
      {result?.data_warnings?.length > 0 && (
        <div style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.amber, background: 'rgba(255,170,0,0.07)', border: `1px solid rgba(255,170,0,0.2)`, borderRadius: radius.sm, padding: '0.5rem 0.75rem' }}>
          {result.data_warnings.map((w: string, i: number) => <div key={i}>⚠ {w}</div>)}
        </div>
      )}

      {/* ── TAB: Holdings ──────────────────────────────────────────────────── */}
      {tab === 'holdings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Summary row when analysed */}
          {valuation && (
            <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', padding: '0.75rem', background: 'rgba(0,200,255,0.04)', borderRadius: radius.md, border: `1px solid ${colors.border}` }}>
              <Pill label="Portfolio Value" value={fmtCcy(valuation.total_value, baseCcy)} color={colors.teal} />
              <Pill label="Coverage" value={`${valuation.coverage_pct}%`} color={valuation.coverage_pct < 100 ? colors.amber : colors.green} />
              <Pill label="Holdings" value={`${valuation.valued_count}/${valuation.valued_count + valuation.unvalued_count}`} />
              <Pill label="Status" value={valuation.valuation_status.toUpperCase()} color={valuation.valuation_status === 'complete' ? colors.green : colors.amber} />
            </div>
          )}

          {/* Holdings table */}
          {holdings.length === 0 ? (
            <div style={{ fontFamily: font.mono, fontSize: '0.75rem', color: colors.textDim, textAlign: 'center', padding: '2rem' }}>
              No holdings yet. Add your first position below.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.mono, fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    {['Symbol','Market','Qty','Price','Value','Alloc %','P&L','Status',''].map(h => (
                      <th key={h} style={{ color: colors.textDim, fontWeight: 400, textAlign: 'left', padding: '0.3rem 0.5rem', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.map(h => {
                    const vdata = valuation?.holdings?.find((v: any) => v.symbol === h.symbol);
                    return (
                      <tr key={h.id} style={{ borderBottom: `1px solid ${colors.borderDim}` }}>
                        <td style={{ padding: '0.4rem 0.5rem', color: colors.teal, fontWeight: 600 }}>{h.symbol}</td>
                        <td style={{ padding: '0.4rem 0.5rem', color: colors.textSecondary }}>{h.market}</td>
                        <td style={{ padding: '0.4rem 0.5rem', color: colors.textPrimary }}>{h.quantity}</td>
                        <td style={{ padding: '0.4rem 0.5rem', color: colors.textSecondary }}>
                          {vdata ? `${fmt(vdata.price, 2)} ${vdata.price_currency}` : '—'}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem', color: colors.textPrimary }}>
                          {vdata?.value_base != null ? fmtCcy(vdata.value_base, baseCcy) : '—'}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem', color: colors.textSecondary }}>
                          {vdata?.allocation_pct != null ? `${fmt(vdata.allocation_pct, 1)}%` : '—'}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem', color: pnlColor(vdata?.unrealised_pnl) }}>
                          {vdata?.unrealised_pnl != null
                            ? `${vdata.unrealised_pnl >= 0 ? '+' : ''}${fmtCcy(vdata.unrealised_pnl, baseCcy)}`
                            : '—'}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>
                          {vdata ? (
                            <span style={{ color: vdata.data_status === 'ok' ? colors.green : vdata.data_status === 'stale' ? colors.amber : colors.red, fontSize: '0.65rem' }}>
                              {vdata.data_status}
                            </span>
                          ) : <span style={{ color: colors.textDim }}>—</span>}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>
                          <button onClick={() => removeHolding(h.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: colors.textDim, fontSize: '0.75rem', padding: 0,
                          }} title="Remove">✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add holding form */}
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={{
              fontFamily: font.mono, fontSize: '0.7rem',
              background: 'transparent', border: `1px dashed ${colors.border}`,
              borderRadius: radius.md, color: colors.textDim, padding: '0.5rem',
              cursor: 'pointer', width: '100%',
            }}>+ Add Holding</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'rgba(0,200,255,0.04)', borderRadius: radius.md, border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input placeholder="Symbol *" value={form.symbol || ''} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} style={{ ...inputStyle, width: 90 }} />
                <select value={form.market || 'US'} onChange={e => setForm(f => ({ ...f, market: e.target.value }))} style={{ ...selectStyle, minWidth: 110 }}>
                  {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input placeholder="Quantity *" type="number" min="0" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} style={{ ...inputStyle, width: 90 }} />
                <input placeholder="Buy Price" type="number" min="0" value={form.purchase_price || ''} onChange={e => setForm(f => ({ ...f, purchase_price: Number(e.target.value) }))} style={{ ...inputStyle, width: 90 }} />
                <input placeholder="Buy CCY" value={form.purchase_currency || ''} onChange={e => setForm(f => ({ ...f, purchase_currency: e.target.value }))} style={{ ...inputStyle, width: 70 }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={addHolding} style={btnPrimary}>Add</button>
                <button onClick={() => { setShowForm(false); setForm({ market: 'US' }); }} style={btnSecondary}>Cancel</button>
              </div>
            </div>
          )}

          {/* Config row */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.5rem 0', borderTop: `1px solid ${colors.borderDim}` }}>
            <label style={labelStyle}>
              Rf Rate %
              <input type="number" value={rfRate} min={0} max={20} step={0.1}
                onChange={e => setRfRate(Number(e.target.value))} style={{ ...inputStyle, width: 60 }} />
            </label>
            <label style={labelStyle}>
              History Days
              <input type="number" value={histDays} min={30} max={1260}
                onChange={e => setHistDays(Number(e.target.value))} style={{ ...inputStyle, width: 70 }} />
            </label>
          </div>
        </div>
      )}

      {/* ── TAB: Risk ──────────────────────────────────────────────────────── */}
      {tab === 'risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!risk ? (
            <div style={{ fontFamily: font.mono, fontSize: '0.75rem', color: colors.textDim, textAlign: 'center', padding: '2rem' }}>
              Run analysis first to see risk metrics.
            </div>
          ) : (
            <>
              {/* Metric grid */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <MetricCard
                  title="Annualised Volatility"
                  value={risk.annualised_volatility?.available ? `${fmt(risk.annualised_volatility.value, 2)}%` : '—'}
                  sub={risk.annualised_volatility?.available ? `${risk.annualised_volatility.obs_count} obs` : risk.annualised_volatility?.unavailable_reason}
                  color={colors.teal}
                />
                <MetricCard
                  title="Sharpe Ratio"
                  value={risk.sharpe_ratio?.available ? fmt(risk.sharpe_ratio.value, 3) : '—'}
                  sub={risk.sharpe_ratio?.available ? `Rf=${(risk.risk_free_rate_used * 100).toFixed(1)}%` : risk.sharpe_ratio?.unavailable_reason}
                  color={risk.sharpe_ratio?.available && risk.sharpe_ratio.value != null
                    ? (risk.sharpe_ratio.value >= 1 ? colors.green : risk.sharpe_ratio.value >= 0 ? colors.amber : colors.red)
                    : colors.textDim}
                />
                <MetricCard
                  title="VaR 95% (1-day)"
                  value={risk.var_95?.available ? `${fmt(risk.var_95.value, 3)}%` : '—'}
                  sub={risk.var_95?.available ? 'Historical simulation' : risk.var_95?.unavailable_reason}
                  color={colors.red}
                />
                <MetricCard
                  title="Expected Shortfall 95%"
                  value={risk.es_95?.available ? `${fmt(risk.es_95.value, 3)}%` : '—'}
                  sub={risk.es_95?.available ? 'Mean tail loss' : risk.es_95?.unavailable_reason}
                  color={colors.red}
                />
              </div>

              {/* Max Drawdown */}
              <div style={{ background: 'rgba(0,200,255,0.04)', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '0.75rem 1rem' }}>
                <div style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Max Drawdown</div>
                {risk.max_drawdown?.available ? (
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <Pill label="Drawdown" value={`${fmt(risk.max_drawdown.max_drawdown_pct, 2)}%`} color={colors.red} />
                    <Pill label="Peak" value={risk.max_drawdown.peak_date ?? '—'} />
                    <Pill label="Trough" value={risk.max_drawdown.trough_date ?? '—'} />
                    <Pill label="Recovery" value={risk.max_drawdown.recovery_date ?? 'Not yet'} color={risk.max_drawdown.recovery_date ? colors.green : colors.amber} />
                  </div>
                ) : <Unavail reason={risk.max_drawdown?.unavailable_reason} />}
              </div>

              {/* Correlation matrix */}
              {risk.correlation?.available && risk.correlation.matrix && (
                <div style={{ background: 'rgba(0,200,255,0.04)', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '0.75rem 1rem', overflowX: 'auto' }}>
                  <div style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Correlation Matrix ({risk.correlation.obs_count} common days)
                  </div>
                  <table style={{ borderCollapse: 'collapse', fontFamily: font.mono, fontSize: '0.65rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '2px 6px', color: colors.textDim }} />
                        {risk.correlation.symbols.map((s: string) => (
                          <th key={s} style={{ padding: '2px 6px', color: colors.textSecondary, textAlign: 'center' }}>{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {risk.correlation.symbols.map((row: string, ri: number) => (
                        <tr key={row}>
                          <td style={{ padding: '2px 6px', color: colors.textSecondary }}>{row}</td>
                          {risk.correlation.matrix[ri].map((val: number | null, ci: number) => (
                            <td key={ci} style={{
                              padding: '2px 6px', textAlign: 'center',
                              color: val == null ? colors.textDim
                                : val === 1 ? colors.teal
                                : val > 0.7 ? colors.red
                                : val < -0.3 ? colors.green
                                : colors.textPrimary,
                            }}>
                              {val == null ? '—' : val.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Methodology note */}
              <div style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.textDim, padding: '0.5rem', borderRadius: radius.sm, background: 'rgba(0,200,255,0.03)', lineHeight: 1.6 }}>
                {risk.methodology_note}<br />
                <span style={{ color: colors.textDim }}>NOT INVESTMENT ADVICE. Historical metrics do not predict future performance.</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Allocation ────────────────────────────────────────────────── */}
      {tab === 'allocation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!concentration ? (
            <div style={{ fontFamily: font.mono, fontSize: '0.75rem', color: colors.textDim, textAlign: 'center', padding: '2rem' }}>
              Run analysis first to see allocation breakdown.
            </div>
          ) : (
            <>
              {/* HHI + top-N */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <MetricCard title="HHI" value={concentration.hhi != null ? concentration.hhi.toFixed(4) : '—'}
                  sub="0=diversified, 1=single" color={concentration.hhi != null ? (concentration.hhi > 0.25 ? colors.red : concentration.hhi > 0.1 ? colors.amber : colors.green) : undefined} />
                <MetricCard title="Top Position" value={concentration.top1_symbol ?? '—'}
                  sub={concentration.top1_pct != null ? `${fmt(concentration.top1_pct, 1)}%` : undefined} color={colors.teal} />
                <MetricCard title="Top 5" value={concentration.top5_pct != null ? `${fmt(concentration.top5_pct, 1)}%` : '—'} />
                <MetricCard title="Top 10" value={concentration.top10_pct != null ? `${fmt(concentration.top10_pct, 1)}%` : '—'} />
              </div>

              {/* Holding allocation pie */}
              {valuation?.holdings && (
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <PieChart width={200} height={200}>
                    <Pie
                      data={valuation.holdings.filter((h: any) => h.allocation_pct != null).map((h: any) => ({ name: h.symbol, value: h.allocation_pct }))}
                      cx={95} cy={95} innerRadius={55} outerRadius={90}
                      dataKey="value" nameKey="name"
                    >
                      {valuation.holdings.filter((h: any) => h.allocation_pct != null).map((_: any, i: number) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v: any) => `${fmt(v, 1)}%`} contentStyle={{ background: colors.bgCard, border: `1px solid ${colors.border}`, fontFamily: font.mono, fontSize: '0.7rem' }} />
                  </PieChart>

                  {/* Legend */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {valuation.holdings.filter((h: any) => h.allocation_pct != null).map((h: any, i: number) => (
                      <div key={h.symbol} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: font.mono, fontSize: '0.68rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length], display: 'inline-block' }} />
                        <span style={{ color: colors.textPrimary }}>{h.symbol}</span>
                        <span style={{ color: colors.textDim }}>{fmt(h.allocation_pct, 1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sector breakdown */}
              {concentration.sector_breakdown && Object.keys(concentration.sector_breakdown).length > 0 && (
                <div>
                  <div style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Sector</div>
                  <ResponsiveContainer width="100%" height={Math.max(80, Object.keys(concentration.sector_breakdown).length * 28)}>
                    <BarChart
                      data={Object.entries(concentration.sector_breakdown as Record<string, number>).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ name: k, pct: v }))}
                      layout="vertical" margin={{ left: 80, right: 30, top: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontFamily: font.mono, fontSize: '0.6rem', fill: colors.textDim }} />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontFamily: font.mono, fontSize: '0.62rem', fill: colors.textSecondary }} />
                      <ReTooltip formatter={(v: any) => `${fmt(v, 1)}%`} contentStyle={{ background: colors.bgCard, border: `1px solid ${colors.border}`, fontFamily: font.mono, fontSize: '0.7rem' }} />
                      <Bar dataKey="pct" fill={colors.teal} radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: Scenario ──────────────────────────────────────────────────── */}
      {tab === 'scenario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontFamily: font.mono, fontSize: '0.7rem', color: colors.textSecondary, lineHeight: 1.6 }}>
            Enter a % shock for each symbol (e.g. -20 for a 20% fall). Leave blank to apply no shock.
          </div>

          {/* Shock inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {holdings.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontFamily: font.mono, fontSize: '0.75rem', color: colors.teal, minWidth: 70 }}>{h.symbol}</span>
                <input
                  type="number" placeholder="% shock"
                  value={shocks[h.symbol] || ''}
                  onChange={e => setShocks(s => ({ ...s, [h.symbol]: e.target.value }))}
                  style={{ ...inputStyle, width: 100 }}
                />
                <span style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textDim }}>%</span>
              </div>
            ))}
          </div>

          <button onClick={analyse} disabled={loading || !holdings.length} style={btnPrimary}>
            {loading ? '⟳ Running…' : '▶ Run Scenario'}
          </button>

          {/* Scenario results */}
          {scenario && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <MetricCard title="Base Value" value={fmtCcy(scenario.base_portfolio_value, baseCcy)} />
                <MetricCard title="Scenario Value" value={fmtCcy(scenario.scenario_portfolio_value, baseCcy)} />
                <MetricCard
                  title="Change"
                  value={scenario.total_change != null ? fmtCcy(scenario.total_change, baseCcy) : '—'}
                  sub={scenario.total_change_pct != null ? `${fmt(scenario.total_change_pct, 2)}%` : undefined}
                  color={scenario.total_change != null ? (scenario.total_change >= 0 ? colors.green : colors.red) : undefined}
                />
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.mono, fontSize: '0.7rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    {['Symbol','Base','Shock','Scenario','Change'].map(h => (
                      <th key={h} style={{ color: colors.textDim, fontWeight: 400, textAlign: 'left', padding: '0.3rem 0.4rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scenario.holdings.map((h: any) => (
                    <tr key={h.symbol} style={{ borderBottom: `1px solid ${colors.borderDim}` }}>
                      <td style={{ padding: '0.35rem 0.4rem', color: colors.teal }}>{h.symbol}</td>
                      <td style={{ padding: '0.35rem 0.4rem' }}>{fmtCcy(h.base_value, baseCcy)}</td>
                      <td style={{ padding: '0.35rem 0.4rem', color: h.shock_pct != null ? (h.shock_pct < 0 ? colors.red : colors.green) : colors.textDim }}>
                        {h.shock_pct != null ? `${h.shock_pct >= 0 ? '+' : ''}${fmt(h.shock_pct, 1)}%` : '—'}
                      </td>
                      <td style={{ padding: '0.35rem 0.4rem' }}>{fmtCcy(h.scenario_value, baseCcy)}</td>
                      <td style={{ padding: '0.35rem 0.4rem', color: pnlColor(h.change) }}>
                        {h.change != null ? `${h.change >= 0 ? '+' : ''}${fmtCcy(h.change, baseCcy)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.textDim, lineHeight: 1.6 }}>
                ⚠ Hypothetical scenario. Does not account for correlations, liquidity, non-linear exposures, or taxes.
                NOT INVESTMENT ADVICE.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Style constants ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  fontFamily: font.mono, fontSize: '0.7rem',
  background: 'rgba(0,200,255,0.06)', border: `1px solid ${colors.border}`,
  borderRadius: '6px', color: colors.textPrimary, padding: '0.25rem 0.5rem',
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  paddingRight: '0.6rem',
};

const btnPrimary: React.CSSProperties = {
  fontFamily: font.mono, fontSize: '0.7rem',
  background: 'rgba(0,200,255,0.15)', border: `1px solid ${colors.teal}`,
  borderRadius: radius.pill, color: colors.teal, padding: '0.3rem 0.9rem', cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  fontFamily: font.mono, fontSize: '0.7rem',
  background: 'transparent', border: `1px solid ${colors.border}`,
  borderRadius: radius.pill, color: colors.textSecondary, padding: '0.3rem 0.9rem', cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  fontFamily: font.mono, fontSize: '0.65rem', color: colors.textDim,
  display: 'flex', alignItems: 'center', gap: '0.4rem',
};

export default PortfolioPanel;
