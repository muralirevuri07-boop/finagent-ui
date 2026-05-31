import React, { useState, useEffect } from 'react';
import SpaceBackground from './components/SpaceBackground';
import Hero from './components/Hero';
import TickerTape from './components/TickerTape';
import AnalysePanel from './components/AnalysePanel';
import NewsPanel from './components/NewsPanel';
import SignalFeed from './components/SignalFeed';
import './App.css';

const API = 'https://web-production-353e6.up.railway.app';

const App: React.FC = () => {
  const [ticker, setTicker]         = useState('NVDA');
  const [market, setMarket]         = useState('US');
  const [result, setResult]         = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [agentStep, setAgentStep]   = useState(0);
  const [generalNews, setGeneralNews] = useState<any[]>([]);
  const [stockNews, setStockNews]   = useState<any[]>([]);

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
      <TickerTape />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        <Hero
          ticker={ticker}
          setTicker={setTicker}
          market={market}
          setMarket={setMarket}
          onAnalyse={handleAnalyse}
          loading={loading}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnalysePanel result={result} loading={loading} agentStep={agentStep} ticker={ticker} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SignalFeed />
            <NewsPanel generalNews={generalNews} stockNews={stockNews} ticker={ticker} />
          </div>
        </div>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(0,255,157,0.1)',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '0.6rem',
          color: 'rgba(0,255,157,0.3)',
        }}>
          ⬡ FINAGENT GLOBAL · LANGGRAPH · GROQ · TAVILY · CHROMADB · RAG · NOT FINANCIAL ADVICE ⬡
        </div>
      </div>
    </>
  );
};

export default App;