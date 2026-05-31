import React, { useState } from 'react';
import SpaceBackground from './components/SpaceBackground';
import Hero from './components/Hero';
import TickerTape from './components/TickerTape';
import AnalysePanel from './components/AnalysePanel';
import NewsPanel from './components/NewsPanel';
import SignalFeed from './components/SignalFeed';
import './App.css';

const App: React.FC = () => {
  const [ticker, setTicker] = useState('NVDA');
  const [market, setMarket] = useState('US');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [generalNews, setGeneralNews] = useState<any[]>([]);
  const [stockNews, setStockNews] = useState<any[]>([]);

  const handleAnalyse = async () => {
    setLoading(true);
    setAgentStep(1);
    setResult(null);

    // Simulate agent steps
    for (let i = 1; i <= 6; i++) {
      setAgentStep(i);
      await new Promise(r => setTimeout(r, 800));
    }

    // Mock result
    setResult({
      ticker,
      market,
      financial_data: {
        current_price: '$214.25',
        change_percent: '+0.51%',
        '52w_high': '$236.54',
        '52w_low': '$132.92',
        day_high: '$215.19',
        day_low: '$211.22',
        volume: 141557394,
        company_name: 'NVIDIA Corporation',
      },
      sentiment: {
        sentiment: 'Bullish',
        score: 0.8,
        summary: 'Strong earnings and revenue growth outlook',
      },
      report: {
        recommendation: 'BUY',
        confidence: 'HIGH',
        target_price: '284',
        reasoning: 'Consistent increase in stock price with strong AI market position.',
        news_summary: 'Positive outlook with analysts expecting continued success.',
        risks: ['Market volatility', 'Regulatory concerns', 'Competition'],
      },
      rag_context: {
        total_stored: 1247,
        freshly_stored: 12,
      },
    });

    setGeneralNews([
      { title: 'Global markets rally in 2026 outlook', source: 'Reuters', url: '#' },
      { title: 'Fed signals rate cuts ahead', source: 'Bloomberg', url: '#' },
      { title: 'AI boom drives tech valuations', source: 'CNBC', url: '#' },
    ]);
    setStockNews([
      { title: `${ticker} reports strong quarterly earnings`, source: 'Reuters', url: '#' },
      { title: `Analysts raise ${ticker} price target`, source: 'Bloomberg', url: '#' },
      { title: `${ticker} dominates AI chip market`, source: 'CNBC', url: '#' },
    ]);

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
          LANGGRAPH · GROQ · TAVILY · REAL-TIME DATA · AI TRADING INTELLIGENCE
        </div>
      </div>
    </>
  );
};

export default App;