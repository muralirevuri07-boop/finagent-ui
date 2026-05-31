import React, { useState } from 'react';

interface NewsItem {
  title: string;
  url: string;
  content?: string;
  source: string;
}

interface NewsPanelProps {
  generalNews: NewsItem[];
  stockNews: NewsItem[];
  ticker: string;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ generalNews, stockNews, ticker }) => {
  const [tab, setTab] = useState<'global' | 'stock'>('global');
  const news = tab === 'global' ? generalNews : stockNews;

  return (
    <div style={{
      background: 'rgba(0,5,16,0.85)',
      border: '1px solid rgba(0,255,157,0.2)',
      borderRadius: '14px',
      padding: '1rem',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, #00c8ff, #ff00ff, transparent)',
      }} />

      <div style={{
        fontFamily: "'Orbitron', monospace",
        color: '#00ff9d',
        fontSize: '0.7rem',
        letterSpacing: '3px',
        marginBottom: '0.8rem',
      }}>◈ MARKET INTELLIGENCE</div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
        {(['global', 'stock'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? 'rgba(0,255,157,0.15)' : 'transparent',
              border: `1px solid ${tab === t ? '#00ff9d' : 'rgba(0,255,157,0.2)'}`,
              borderRadius: '6px',
              color: tab === t ? '#00ff9d' : 'rgba(0,255,157,0.4)',
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.6rem',
              letterSpacing: '1px',
              padding: '0.3rem 0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            {t === 'global' ? '🌍 GLOBAL' : `📊 ${ticker}`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
        {news.length === 0 ? (
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: 'rgba(0,255,157,0.4)',
            textAlign: 'center',
            padding: '2rem 0',
            fontSize: '0.75rem',
          }}>
            {tab === 'stock' ? `Analyse ${ticker} to see specific news` : 'Loading news...'}
          </div>
        ) : (
          news.map((item, i) => (
            <div key={i} style={{
              padding: '0.6rem',
              borderBottom: '1px solid rgba(0,255,157,0.08)',
              animation: `fadeIn 0.4s ease ${i * 0.05}s both`,
            }}>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.73rem',
                color: '#ffffff',
                lineHeight: 1.5,
                marginBottom: '0.3rem',
              }}>{item.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.62rem',
                  color: 'rgba(0,255,157,0.5)',
                }}>📰 {item.source}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.62rem',
                    color: 'rgba(0,200,255,0.7)',
                    textDecoration: 'none',
                  }}
                >READ →</a>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NewsPanel;