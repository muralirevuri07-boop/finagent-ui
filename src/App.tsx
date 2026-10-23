import React, { useState, useEffect } from 'react';
import SpaceBackground from './components/SpaceBackground';
import TickerTape from './components/TickerTape';
import TopNav from './components/TopNav';
import AnalysePanel from './components/AnalysePanel';
import NewsPanel from './components/NewsPanel';
import SignalFeed from './components/SignalFeed';
import { colors, font } from './tokens';
import './App.css';

const API = 'https://finagent-api-k9em.onrender.com';

const App: React.FC = () => {
  const [ticker, setTicker]           = useState('NVDA');
  const [market, setMarket]           = useState('US');
  const [result, setResult]           = useState<any>(null);
  const [loading, setLoading]         = useState(false);
  const [agentStep, setAgentStep]     = useState(0);
  const [generalNews, setGeneralNews] = useState<any[]>([]);
  const [stockNews, setStockNews]     = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/news/general`)
      .then(r => r.json())
      .then(d => setGeneralNews(d.news || []))
      .catch(() => {});
  }, []);

  const handleAnalyse = async () => {
    setLoading(true);
    setAgentStep(0);
    setResult(null);

    for (let i = 1; i <= 6; i++) {
      setAgentStep(i);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const res = await fetch(`${API}/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, market }),
      });
      const data = await res.json();
      setResult(data);

      const sn = await fetch(`${API}/news/${ticker}`);
      const snData = await sn.json();
      setStockNews(snData.news || []);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <>
      <SpaceBackground />

      {/* Sticky compact nav — replaces the giant Hero */}
      <TopNav
        ticker={ticker}
        setTicker={setTicker}
        market={market}
        setMarket={setMarket}
        onAnalyse={handleAnalyse}
        loading={loading}
      />

      {/* Scrolling ticker tape */}
      <TickerTape />

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1560px',
        margin: '0 auto',
        padding: '1rem 1.2rem',
      }}>
        {/* Two-column layout: left = analysis, right = signals + news */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(300px, 380px)',
          gap: '1.2rem',
          alignItems: 'start',
        }}>
          {/* Left — main research panel */}
          <div>
            <AnalysePanel
              result={result}
              loading={loading}
              agentStep={agentStep}
              ticker={ticker}
            />
          </div>

          {/* Right — sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '68px' }}>
            <SignalFeed />
            <NewsPanel generalNews={generalNews} stockNews={stockNews} ticker={ticker} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          padding: '0.8rem 1rem',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <span style={{
            fontFamily: font.mono,
            fontSize: '0.6rem',
            color: colors.textDim,
            letterSpacing: '0.5px',
          }}>
            ◈ FINAGENT GLOBAL · LangGraph · Groq · Tavily · ChromaDB · RAG
          </span>
          <span style={{
            fontFamily: font.mono,
            fontSize: '0.6rem',
            color: colors.textDim,
          }}>
            NOT FINANCIAL ADVICE — For informational purposes only
          </span>
        </div>
      </div>
    </>
  );
};

export default App;
