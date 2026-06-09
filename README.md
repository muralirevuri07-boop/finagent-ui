<div align="center">

# ⬡ FINAGENT GLOBAL
### AI Trading War Room — Multi-Agent Global Market Intelligence

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-finagent--ui.vercel.app-00ff9d?style=for-the-badge)](https://finagent-ui.vercel.app)
[![Backend](https://img.shields.io/badge/API-Railway-blueviolet?style=for-the-badge)](https://web-production-353e6.up.railway.app/health)
[![GitHub](https://img.shields.io/badge/Backend-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/muralirevuri07-boop/finagent)

![FinAgent Global](https://finagent-ui.vercel.app/og-image.png)

</div>

---

## 🌍 Live Demo

👉 **[https://finagent-ui.vercel.app](https://finagent-ui.vercel.app)**

Type any ticker → Select market → Click ⚡ ANALYSE MARKET

---

## 🤖 What is FinAgent Global?

FinAgent Global is a **production-grade AI trading platform** built with a multi-agent architecture. It analyses stocks, crypto, forex and commodities across 11 global markets using 8 specialized AI agents working in orchestrated pipelines.

This is not a dashboard. This is an **AI command center**.

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **AI Orchestration** | LangGraph · LangChain · LangSmith |
| **LLM Inference** | Groq (Llama 3.3 70B) — fastest LLM |
| **RAG Pipeline** | ChromaDB · HuggingFace Embeddings |
| **News Intelligence** | Tavily Real-time Search API |
| **Market Data** | Yahoo Finance · Alpha Vantage |
| **Backend** | FastAPI · Python 3.11 · Uvicorn |
| **Frontend** | React · TypeScript · Three.js |
| **3D Graphics** | Canvas API · WebGL · Holographic Globe |
| **Deployment** | Vercel (Frontend) · Railway (Backend) |

---

## 🤖 8 AI Agents

📰 News Agent        — Tavily real-time news scraping
🧠 RAG Agent         — ChromaDB vector memory & retrieval
📊 Financial Agent   — Live price, OHLC, volume data
💭 Sentiment Agent   — Groq LLM sentiment analysis
📋 Report Agent      — BUY/HOLD/SELL with RAG context
😨 Fear & Greed      — VIX + SP500 + BTC index
⚔️ Comparison Agent  — Multi-stock battle analysis
📁 Portfolio Agent   — Portfolio risk scoring


---

## 🌍 11 Global Markets
🇺🇸 US Stocks     NYSE + NASDAQ
🇮🇳 India NSE     National Stock Exchange
🇮🇳 India BSE     Bombay Stock Exchange
🇬🇧 London LSE    London Stock Exchange
🇩🇪 Frankfurt     XETRA
🇯🇵 Tokyo         TSE
🇭🇰 Hong Kong     HKEX
🇸🇬 Singapore     SGX
₿  Crypto         BTC, ETH, SOL, BNB
💱 Forex          GBP/USD, EUR/USD, USD/INR
🏅 Commodities    Gold, Oil, Silver, Gas

---

## 📡 API Endpoints
POST /analyse          — Full 5-agent pipeline
POST /compare          — Multi-stock battle
POST /portfolio        — Portfolio analysis
GET  /feargreed        — Fear & Greed index
GET  /news/general     — Live global news
GET  /news/{ticker}    — Stock-specific news
GET  /rag/stats/{ticker} — Vector DB stats
GET  /health           — API health check

---

## ✨ Features

- 🔮 **Holographic rotating globe** — Three.js WebGL
- 🌌 **Animated space background** — Parallax stars + nebula
- 📺 **Bloomberg-style ticker tape** — Live scrolling prices
- ⚡ **Live AI signals feed** — Real-time animated signals
- 🧠 **RAG Memory** — Stores & retrieves past analyses
- 📰 **Live news panel** — Reuters, Bloomberg, CNBC
- 📊 **3 chart types** — Line, Candlestick, Volume
- 📄 **Export report** — Download AI analysis
- 🎨 **Dynamic themes** — Green/Red/Gold based on BUY/SELL/HOLD

---

## 🚀 Run Locally

```bash
# Backend
git clone https://github.com/muralirevuri07-boop/finagent
cd finagent
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Add .env with API keys
uvicorn api.main:app --reload

# Frontend
git clone https://github.com/muralirevuri07-boop/finagent-ui
cd finagent-ui
npm install --legacy-peer-deps
npm start
```

---

## 🔑 Environment Variables

```env
GROQ_API_KEY=
TAVILY_API_KEY=
LANGSMITH_API_KEY=
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=FinAgent
ALPHA_VANTAGE_API_KEY=
```

---

## 👨‍💻 Built By

**Murali Revuri** — Full-Stack AI Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/yourprofile)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/muralirevuri07-boop)

---

<div align="center">

⬡ LangGraph · Groq · RAG · Not Financial Advice ⬡

</div>
