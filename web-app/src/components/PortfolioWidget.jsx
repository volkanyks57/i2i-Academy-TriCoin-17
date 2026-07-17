// src/components/PortfolioWidget.jsx
import React, { useEffect, useState } from 'react';
import { getPortfolio, getMarketPrices } from '../services/api';
import PortfolioHealthScore from './PortfolioHealthScore';

const AI_SUGGESTIONS = [
  { icon: '💬', text: 'Portföyünle ilgili sor' },
  { icon: '📊', text: 'En çok kazandıran hangisi?' },
  { icon: '💡', text: 'Bugün ne almalıyım?' },
  { icon: '📉', text: 'Zararımı nasıl azaltırım?' },
  { icon: '🧠', text: 'Portföyüm ne kadar riskli?' },
  { icon: '💰', text: 'Toplam ne kadar kâr/zarar ettim?' },
  { icon: '🪙', text: 'Hangi coini satmalıyım?' },
  { icon: '📈', text: 'ETH fiyatı yükselir mi?' },
  { icon: '🎯', text: 'Portföyümü nasıl çeşitlendiririm?' },
  { icon: '📋', text: 'Son işlemlerimi özetle' },
  { icon: '⚖️', text: 'USD bakiyemi kripto ile dengeli mi?' },
  { icon: '🔍', text: 'Hangi varlığım en çok dalgalandı?' },
];

const PortfolioWidget = ({ refreshTrigger, onOpenAiChat }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

const rotateIntervalRef = React.useRef(null);

const startRotation = () => {
  clearInterval(rotateIntervalRef.current);
  rotateIntervalRef.current = setInterval(() => {
    setSuggestionIndex((i) => (i + 1) % AI_SUGGESTIONS.length);
  }, 15000);
};

useEffect(() => {
  startRotation();
  return () => clearInterval(rotateIntervalRef.current);
}, []);

const goToPrevSuggestion = () => {
  setSuggestionIndex((i) => (i - 1 + AI_SUGGESTIONS.length) % AI_SUGGESTIONS.length);
  startRotation();
};

const goToNextSuggestion = () => {
  setSuggestionIndex((i) => (i + 1) % AI_SUGGESTIONS.length);
  startRotation();
};

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.sub || '');
      } catch {
        setUsername('');
      }
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [portfolioRes, pricesRes] = await Promise.all([
          getPortfolio(),
          getMarketPrices(),
        ]);
        setPortfolio(portfolioRes.data);
        const priceMap = {};
        pricesRes.data.prices.forEach((p) => {
          priceMap[p.symbol] = {
            price: parseFloat(p.price),
            change24h: parseFloat(p.change24h) || 0,
          };
        });
        setPrices(priceMap);
      } catch (error) {
        console.error('Portfolio yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="portfolio-widget portfolio-loading">
        Portföy yükleniyor...
      </div>
    );
  }

  if (!portfolio) return null;

  const balanceUsd = parseFloat(portfolio.balanceUsd);
  const holdings = portfolio.holdings || [];

  const cryptoValue = holdings.reduce((sum, h) => {
    const price = prices[h.symbol]?.price || 0;
    return sum + parseFloat(h.amount) * price;
  }, 0);

  const totalValue = balanceUsd + cryptoValue;

  const dailyChangeUsd = holdings.reduce((sum, h) => {
    const info = prices[h.symbol];
    if (!info) return sum;
    const value = parseFloat(h.amount) * info.price;
    return sum + value * (info.change24h / 100);
  }, 0);
  const dailyChangePercent = totalValue > 0 ? (dailyChangeUsd / totalValue) * 100 : 0;

  let bestPerformer = null;
  let worstPerformer = null;
  holdings.forEach((h) => {
    const info = prices[h.symbol];
    if (!info) return;
    if (!bestPerformer || info.change24h > prices[bestPerformer.symbol]?.change24h) {
      bestPerformer = h;
    }
    if (!worstPerformer || info.change24h < prices[worstPerformer.symbol]?.change24h) {
      worstPerformer = h;
    }
  });

  const DONUT_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#f87171', '#38bdf8', '#facc15'];

  const donutSegments = holdings
    .map((h) => ({
      label: h.symbol,
      value: parseFloat(h.amount) * (prices[h.symbol]?.price || 0),
    }))
    .concat([{ label: 'USD', value: balanceUsd }])
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  let cumulative = 0;
  const gradientStops = donutSegments.map((s, i) => {
    const share = totalValue > 0 ? (s.value / totalValue) * 100 : 0;
    const start = cumulative;
    cumulative += share;
    const color = s.label === 'USD' ? 'rgba(148,163,184,0.55)' : DONUT_COLORS[i % DONUT_COLORS.length];
    return { color, start, end: cumulative, label: s.label, share };
  });

  const donutStyle = {
    background: `conic-gradient(${gradientStops
      .map((g) => `${g.color} ${g.start}% ${g.end}%`)
      .join(', ')})`,
  };

  return (
    <div className="portfolio-widget">
      <div className="portfolio-header">
        <div className="portfolio-user">
          <div className="portfolio-avatar">
            {username.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div className="portfolio-username">Merhaba, {username || 'kullanıcı'} 👋</div>
            <div className="portfolio-subtitle">Portföyüm</div>
          </div>
        </div>
        <div className="portfolio-total">
          <PortfolioHealthScore />
          <div className="portfolio-total-text">
            <div className="portfolio-total-label">Toplam Değer</div>
            <div className="portfolio-total-value">
              ${totalValue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="portfolio-breakdown">
        <div className="portfolio-balance-card">
          <div className="portfolio-quad-grid">
            <div className="portfolio-quad-cell portfolio-quad-panel portfolio-quad-performer">
              <div className="portfolio-card-label">USD Bakiye</div>
              <div className="portfolio-card-value">
                ${balanceUsd.toFixed(2)}
              </div>
              <div className={`portfolio-daily-change ${dailyChangePercent >= 0 ? 'positive' : 'negative'}`}>
                <span className="portfolio-daily-arrow">
                  {dailyChangePercent >= 0 ? '▲' : '▼'}
                </span>
                <span>
                  {dailyChangePercent >= 0 ? '+' : ''}
                  ${dailyChangeUsd.toFixed(2)} ({dailyChangePercent >= 0 ? '+' : ''}
                  {dailyChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="portfolio-quad-cell portfolio-quad-panel portfolio-quad-donut">
              {gradientStops.length > 0 ? (
                <>
                  <div className="portfolio-mini-donut" style={donutStyle} />
                  <div className="portfolio-mini-donut-legend">
                    {gradientStops.map((g) => (
                      <div key={g.label}>
                        <span className="dot" style={{ background: g.color }} />
                        {g.label} {g.share.toFixed(0)}%
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="portfolio-empty">Henüz kripto yok</div>
              )}
            </div>

            <div className="portfolio-quad-cell portfolio-quad-panel portfolio-quad-performer">
              {bestPerformer ? (
                <div className="portfolio-performer-line positive">
                  📈 Portföyünde en çok kazandıran<br />
                  <strong>{bestPerformer.symbol}</strong>{' '}
                  ({prices[bestPerformer.symbol].change24h >= 0 ? '+' : ''}
                  {prices[bestPerformer.symbol].change24h.toFixed(2)}%)
                </div>
              ) : (
                <div className="portfolio-empty">—</div>
              )}
            </div>

            <div className="portfolio-quad-cell portfolio-quad-panel portfolio-quad-performer">
              {worstPerformer ? (
                <div className="portfolio-performer-line negative">
                  📉 Portföyünde en çok kaybettiren<br />
                  <strong>{worstPerformer.symbol}</strong>{' '}
                  ({prices[worstPerformer.symbol].change24h >= 0 ? '+' : ''}
                  {prices[worstPerformer.symbol].change24h.toFixed(2)}%)
                </div>
              ) : (
                <div className="portfolio-empty">—</div>
              )}
            </div>
          </div>

{onOpenAiChat && (
  <div className="portfolio-ai-cta-row">
    <button
      className="portfolio-ai-cta-nav"
      onClick={goToPrevSuggestion}
      aria-label="Önceki soru"
    >
      ‹
    </button>
    <button
      className="portfolio-ai-cta"
      onClick={() => onOpenAiChat(AI_SUGGESTIONS[suggestionIndex].text)}
    >
      <span key={suggestionIndex} className="portfolio-ai-cta-text">
        {AI_SUGGESTIONS[suggestionIndex].icon} {AI_SUGGESTIONS[suggestionIndex].text} → AI Asistanı
      </span>
    </button>
    <button
      className="portfolio-ai-cta-nav"
      onClick={goToNextSuggestion}
      aria-label="Sonraki soru"
    >
      ›
    </button>
  </div>
)}
        </div>

        <div className="portfolio-holdings-card">
          <div className="portfolio-card-label">
            Kripto Varlıklar
            <span className="portfolio-holdings-count">
              {holdings.length}
            </span>
          </div>
          {holdings.length === 0 ? (
            <div className="portfolio-empty">Henüz kripto yok</div>
          ) : (
            <div className="portfolio-holdings-list">
              {holdings.map((h, i) => {
                const price = prices[h.symbol]?.price || 0;
                const value = parseFloat(h.amount) * price;
                return (
                  <div key={i} className="portfolio-holding-item">
                    <span className="portfolio-holding-symbol">
                      {h.symbol}
                    </span>
                    <div className="portfolio-holding-info">
                      <span className="portfolio-holding-amount">
                        {parseFloat(h.amount).toFixed(8)}
                      </span>
                      <span className="portfolio-holding-value">
                        ≈ ${value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioWidget;