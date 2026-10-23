/**
 * CopilotPanel.tsx — AI Research Copilot UI
 *
 * Features:
 *  - Natural language question input
 *  - Streaming-style loading states
 *  - Answer with inline [src-N] citation markers
 *  - Expandable source drawer per citation
 *  - Deterministic calculations block
 *  - Citation validation badge
 *  - Key findings, limitations, unresolved questions
 */

import React, { useState, useRef, useCallback } from 'react';
import { colors, font, radius, cardStyle } from '../tokens';

const API = 'https://finagent-api-k9em.onrender.com';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Source {
  id: string;
  source_type: string;
  title: string;
  publisher?: string;
  url?: string;
  published_at?: string;
  retrieved_at: string;
  excerpt: string;
  ticker?: string;
  reporting_period?: string;
}

interface Claim {
  text: string;
  claim_type: string;
  source_ids: string[];
  verified: boolean;
  limitation?: string;
}

interface Calculation {
  label: string;
  value: string;
  method: string;
  period?: string;
  available: boolean;
  unavailable_reason?: string;
  source_id?: string;
}

interface CopilotResponse {
  session_id: string;
  question: string;
  ticker: string;
  market: string;
  answer: string;
  key_findings: string[];
  claims: Claim[];
  sources: Source[];
  calculations: Calculation[];
  limitations: string[];
  unresolved: string[];
  conflicting_evidence: string[];
  data_warnings: string[];
  citation_validation_passed: boolean;
  citation_issues: string[];
  latency_ms?: number;
}

interface Props {
  ticker: string;
  market: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SOURCE_TYPE_LABELS: Record<string, string> = {
  news_article:        '📰 News',
  search_result:       '🔍 Search',
  market_data:         '📈 Market',
  financial_statement: '📊 Financials',
  calculation:         '🔢 Calc',
  profile_data:        '🏢 Profile',
};

/** Replace [src-N] tokens with clickable badge spans */
function renderCitedText(
  text: string,
  sources: Source[],
  onCiteClick: (id: string) => void,
): React.ReactNode {
  const parts = text.split(/(\[src-\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[src-(\d+)\]$/);
    if (!m) return <span key={i}>{part}</span>;
    const id = `src-${m[1]}`;
    const exists = sources.some(s => s.id === id);
    return (
      <button
        key={i}
        onClick={() => onCiteClick(id)}
        style={{
          display: 'inline-block',
          fontSize: '0.65rem',
          fontFamily: font.mono,
          color: exists ? colors.teal : colors.red,
          background: exists ? 'rgba(0,200,255,0.12)' : 'rgba(255,68,102,0.12)',
          border: `1px solid ${exists ? colors.teal : colors.red}`,
          borderRadius: '3px',
          padding: '0 4px',
          margin: '0 2px',
          cursor: 'pointer',
          verticalAlign: 'middle',
          lineHeight: '1.6',
        }}
        title={exists ? 'View source' : 'Unknown source ID'}
      >
        {part}
      </button>
    );
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const SourceDrawer: React.FC<{ source: Source; onClose: () => void }> = ({ source, onClose }) => (
  <div style={{
    position: 'fixed',
    right: 0,
    top: 0,
    bottom: 0,
    width: 'min(420px, 92vw)',
    background: 'rgba(4,8,20,0.97)',
    border: `1px solid ${colors.borderHi}`,
    borderRadius: `${radius.lg} 0 0 ${radius.lg}`,
    backdropFilter: 'blur(24px)',
    padding: '1.4rem',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    overflowY: 'auto',
    boxShadow: `-8px 0 40px rgba(0,200,255,0.08)`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.teal, letterSpacing: '1px' }}>
        {SOURCE_TYPE_LABELS[source.source_type] || source.source_type.toUpperCase()} · {source.id}
      </span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: colors.textSecondary,
        cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1,
      }}>✕</button>
    </div>

    <div style={{ fontFamily: font.mono, fontSize: '0.82rem', color: colors.textPrimary, lineHeight: 1.5 }}>
      {source.title}
    </div>

    {source.publisher && (
      <div style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textSecondary }}>
        Publisher: {source.publisher}
        {source.reporting_period && ` · Period: ${source.reporting_period}`}
      </div>
    )}

    {source.published_at && (
      <div style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.textDim }}>
        Published: {source.published_at.slice(0, 10)}
      </div>
    )}

    <div style={{
      background: 'rgba(0,200,255,0.05)',
      border: `1px solid ${colors.borderDim}`,
      borderRadius: radius.md,
      padding: '0.8rem',
      fontFamily: font.mono,
      fontSize: '0.72rem',
      color: colors.textSecondary,
      lineHeight: 1.6,
    }}>
      {source.excerpt}
    </div>

    {source.url && (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: font.mono,
          fontSize: '0.65rem',
          color: colors.teal,
          wordBreak: 'break-all',
          textDecoration: 'underline',
        }}
      >
        ↗ {source.url}
      </a>
    )}

    <div style={{ fontFamily: font.mono, fontSize: '0.55rem', color: colors.textDim, marginTop: 'auto' }}>
      Retrieved: {source.retrieved_at.slice(0, 19).replace('T', ' ')} UTC
    </div>
  </div>
);

const CalculationsBlock: React.FC<{ calcs: Calculation[] }> = ({ calcs }) => {
  const available = calcs.filter(c => c.available);
  if (!available.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.teal, letterSpacing: '1px', marginBottom: '0.2rem' }}>
        ▶ DETERMINISTIC CALCULATIONS
      </div>
      {available.map((c, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,200,255,0.04)',
          border: `1px solid ${colors.borderDim}`,
          borderRadius: radius.sm,
          padding: '0.35rem 0.6rem',
          gap: '0.5rem',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textSecondary }}>{c.label}</div>
            {c.period && (
              <div style={{ fontFamily: font.mono, fontSize: '0.55rem', color: colors.textDim }}>{c.period}</div>
            )}
          </div>
          <div style={{
            fontFamily: font.mono,
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: c.value.startsWith('+') ? colors.green : c.value.startsWith('-') ? colors.red : colors.textPrimary,
          }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const CitationValidationBadge: React.FC<{ passed: boolean; issues: string[] }> = ({ passed, issues }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: font.mono,
    fontSize: '0.6rem',
    color: passed ? colors.green : colors.red,
  }}>
    <span>{passed ? '✓' : '⚠'}</span>
    <span>{passed ? 'All citations verified' : `${issues.length} citation issue${issues.length > 1 ? 's' : ''}`}</span>
    {!passed && issues.length > 0 && (
      <span title={issues.join('\n')} style={{ cursor: 'help', opacity: 0.7 }}>(?)</span>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  'What is the revenue trend over the past 3 years?',
  'How are profit margins changing?',
  'What are the key risks mentioned in recent news?',
  'How far is the stock from its 52-week high?',
  'What do analysts say about the growth outlook?',
];

const CopilotPanel: React.FC<Props> = ({ ticker, market }) => {
  const [question, setQuestion]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [response, setResponse]     = useState<CopilotResponse | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<'answer' | 'sources' | 'calcs'>('answer');
  const sessionId = useRef(crypto.randomUUID());

  const openSource = useCallback((id: string) => {
    setOpenSourceId(prev => prev === id ? null : id);
  }, []);

  const GREETINGS = /^(hey|hi|hello|yo|sup|hiya|howdy|helo|heya)[!?.,\s]*$/i;
  const CHIT_CHAT = /^(how are you|what's up|whats up|what can you do|who are you|help)[?!.,\s]*$/i;

  const ask = async () => {
    if (!question.trim() || loading) return;

    // Catch greetings / chit-chat — no need to hit the pipeline
    if (GREETINGS.test(question.trim()) || CHIT_CHAT.test(question.trim())) {
      setResponse({
        answer: `Hey! I'm your AI Research Copilot. Ask me anything about **${ticker}** — earnings, margins, revenue growth, valuation, news sentiment — and I'll pull live data and give you evidence-backed answers.`,
        key_findings: [], claims: [], limitations: [], sources: [], calculations: [],
        citation_validation_passed: true, citation_issues: [], session_id: '',
      } as any);
      setActiveTab('answer');
      setQuestion('');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setActiveTab('answer');

    try {
      const res = await fetch(`${API}/research/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          market,
          question: question.trim(),
          session_id: sessionId.current,
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: CopilotResponse = await res.json();
      setResponse(data);
    } catch (e: any) {
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const activeSource = openSourceId && response
    ? response.sources.find(s => s.id === openSourceId)
    : null;

  return (
    <div style={{ ...cardStyle, padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.teal, letterSpacing: '1px' }}>
          ◈ AI RESEARCH COPILOT
        </span>
        <span style={{
          fontFamily: font.mono,
          fontSize: '0.55rem',
          color: colors.textDim,
          background: 'rgba(0,200,255,0.06)',
          border: `1px solid ${colors.borderDim}`,
          borderRadius: radius.sm,
          padding: '1px 5px',
        }}>
          Evidence-backed · Citation validated
        </span>
      </div>

      {/* Question input */}
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask(); }}
          placeholder={`Ask a research question about ${ticker}…`}
          rows={2}
          style={{
            flex: 1,
            background: 'rgba(0,200,255,0.04)',
            border: `1px solid ${colors.border}`,
            borderRadius: radius.md,
            padding: '0.6rem 0.8rem',
            fontFamily: font.mono,
            fontSize: '0.75rem',
            color: colors.textPrimary,
            resize: 'vertical',
            outline: 'none',
            lineHeight: 1.5,
          }}
          maxLength={500}
        />
        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          style={{
            alignSelf: 'flex-end',
            background: loading ? 'rgba(0,200,255,0.08)' : colors.teal,
            color: loading ? colors.teal : colors.bg,
            border: `1px solid ${colors.teal}`,
            borderRadius: radius.md,
            padding: '0.5rem 1rem',
            fontFamily: font.mono,
            fontSize: '0.7rem',
            cursor: loading ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
          }}
        >
          {loading ? '▶▶▶' : '▶ ASK'}
        </button>
      </div>

      {/* Suggested questions */}
      {!response && !loading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => setQuestion(q)}
              style={{
                background: 'rgba(0,200,255,0.05)',
                border: `1px solid ${colors.borderDim}`,
                borderRadius: radius.pill,
                padding: '0.25rem 0.6rem',
                fontFamily: font.mono,
                fontSize: '0.6rem',
                color: colors.textSecondary,
                cursor: 'pointer',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.8rem',
          background: 'rgba(0,200,255,0.04)',
          borderRadius: radius.md,
        }}>
          {['Retrieving news & market data…', 'Running deterministic calculations…', 'Synthesising with evidence…', 'Validating citations…'].map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              fontFamily: font.mono,
              fontSize: '0.65rem',
              color: colors.textSecondary,
              animation: `pulse ${1 + i * 0.3}s ease-in-out infinite`,
            }}>
              <span style={{ color: colors.teal }}>◈</span>
              {step}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          fontFamily: font.mono,
          fontSize: '0.7rem',
          color: colors.red,
          background: 'rgba(255,68,102,0.08)',
          border: `1px solid rgba(255,68,102,0.3)`,
          borderRadius: radius.md,
          padding: '0.6rem',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Response */}
      {response && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {/* Meta row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.4rem',
          }}>
            <CitationValidationBadge
              passed={response.citation_validation_passed}
              issues={response.citation_issues}
            />
            <div style={{ display: 'flex', gap: '0.6rem', fontFamily: font.mono, fontSize: '0.6rem', color: colors.textDim }}>
              <span>{response.sources.length} sources</span>
              <span>·</span>
              <span>{response.calculations.length} calcs</span>
              {response.latency_ms && (
                <>
                  <span>·</span>
                  <span>{(response.latency_ms / 1000).toFixed(1)}s</span>
                </>
              )}
            </div>
          </div>

          {/* Data warnings */}
          {response.data_warnings.length > 0 && (
            <div style={{
              fontFamily: font.mono,
              fontSize: '0.62rem',
              color: colors.amber,
              background: 'rgba(255,170,0,0.07)',
              border: `1px solid rgba(255,170,0,0.2)`,
              borderRadius: radius.sm,
              padding: '0.4rem 0.6rem',
            }}>
              {response.data_warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.3rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.4rem' }}>
            {(['answer', 'sources', 'calcs'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: font.mono,
                  fontSize: '0.62rem',
                  color: activeTab === tab ? colors.teal : colors.textDim,
                  background: activeTab === tab ? 'rgba(0,200,255,0.1)' : 'none',
                  border: `1px solid ${activeTab === tab ? colors.teal : 'transparent'}`,
                  borderRadius: radius.sm,
                  padding: '0.2rem 0.6rem',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {tab === 'sources' ? `Sources (${response.sources.length})` : tab === 'calcs' ? `Calcs (${response.calculations.length})` : 'Answer'}
              </button>
            ))}
          </div>

          {/* Answer tab */}
          {activeTab === 'answer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{
                fontFamily: font.mono,
                fontSize: '0.76rem',
                color: colors.textPrimary,
                lineHeight: 1.7,
              }}>
                {renderCitedText(response.answer, response.sources, openSource)}
              </div>

              {response.key_findings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.teal, letterSpacing: '1px' }}>
                    ▶ KEY FINDINGS
                  </div>
                  {response.key_findings.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      gap: '0.5rem',
                      fontFamily: font.mono,
                      fontSize: '0.7rem',
                      color: colors.textSecondary,
                      lineHeight: 1.5,
                    }}>
                      <span style={{ color: colors.teal, flexShrink: 0 }}>◈</span>
                      <span>{renderCitedText(f, response.sources, openSource)}</span>
                    </div>
                  ))}
                </div>
              )}

              <CalculationsBlock calcs={response.calculations} />

              {response.limitations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.amber, letterSpacing: '1px' }}>
                    ▶ LIMITATIONS
                  </div>
                  {response.limitations.map((l, i) => (
                    <div key={i} style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textDim }}>• {l}</div>
                  ))}
                </div>
              )}

              {response.unresolved.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.textDim, letterSpacing: '1px' }}>
                    ▶ UNRESOLVED
                  </div>
                  {response.unresolved.map((u, i) => (
                    <div key={i} style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textDim }}>? {u}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sources tab */}
          {activeTab === 'sources' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {response.sources.map(s => (
                <button
                  key={s.id}
                  onClick={() => openSource(s.id)}
                  style={{
                    textAlign: 'left',
                    background: openSourceId === s.id ? 'rgba(0,200,255,0.1)' : 'rgba(0,200,255,0.03)',
                    border: `1px solid ${openSourceId === s.id ? colors.teal : colors.borderDim}`,
                    borderRadius: radius.md,
                    padding: '0.5rem 0.7rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontFamily: font.mono, fontSize: '0.6rem', color: colors.teal }}>{s.id}</span>
                    <span style={{ fontFamily: font.mono, fontSize: '0.55rem', color: colors.textDim }}>
                      {SOURCE_TYPE_LABELS[s.source_type] || s.source_type}
                    </span>
                  </div>
                  <div style={{ fontFamily: font.mono, fontSize: '0.68rem', color: colors.textPrimary, lineHeight: 1.4 }}>
                    {s.title}
                  </div>
                  {s.publisher && (
                    <div style={{ fontFamily: font.mono, fontSize: '0.58rem', color: colors.textDim }}>
                      {s.publisher}{s.published_at ? ` · ${s.published_at.slice(0, 10)}` : ''}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Calcs tab */}
          {activeTab === 'calcs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {response.calculations.map((c, i) => (
                <div key={i} style={{
                  background: 'rgba(0,200,255,0.04)',
                  border: `1px solid ${colors.borderDim}`,
                  borderRadius: radius.md,
                  padding: '0.6rem 0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: font.mono, fontSize: '0.68rem', color: colors.textSecondary }}>{c.label}</span>
                    <span style={{
                      fontFamily: font.mono,
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: c.value.startsWith('+') ? colors.green : c.value.startsWith('-') ? colors.red : colors.textPrimary,
                    }}>
                      {c.value}
                    </span>
                  </div>
                  <div style={{ fontFamily: font.mono, fontSize: '0.58rem', color: colors.textDim }}>{c.method}</div>
                  {c.period && <div style={{ fontFamily: font.mono, fontSize: '0.55rem', color: colors.textDim }}>Period: {c.period}</div>}
                </div>
              ))}
              {response.calculations.length === 0 && (
                <div style={{ fontFamily: font.mono, fontSize: '0.65rem', color: colors.textDim, textAlign: 'center', padding: '1rem' }}>
                  No calculations available for this query.
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            fontFamily: font.mono,
            fontSize: '0.55rem',
            color: colors.textDim,
            borderTop: `1px solid ${colors.borderDim}`,
            paddingTop: '0.5rem',
          }}>
            NOT FINANCIAL ADVICE · Sources retrieved at query time · Verify before acting
          </div>
        </div>
      )}

      {/* Source drawer overlay */}
      {activeSource && (
        <>
          <div
            onClick={() => setOpenSourceId(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 199,
              backdropFilter: 'blur(2px)',
            }}
          />
          <SourceDrawer source={activeSource} onClose={() => setOpenSourceId(null)} />
        </>
      )}
    </div>
  );
};

export default CopilotPanel;
