// src/components/PortfolioWidget.jsx
import React, { useEffect, useState } from 'react';
import { getPortfolio, getMarketPrices } from '../services/api';

const PortfolioWidget = ({ refreshTrigger }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Decode username from JWT — the token is a base64-encoded payload,
    // so we can peek at the "sub" claim without hitting the backend.
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
          priceMap[p.symbol] = parseFloat(p.price);
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

  // Total portfolio value = USD balance + sum of (holding amount × current price).
  const cryptoValue = holdings.reduce((sum, h) => {
    const price = prices[h.symbol] || 0;
    return sum + parseFloat(h.amount) * price;
  }, 0);

  const totalValue = balanceUsd + cryptoValue;

  return (
    <div className="portfolio-widget">
      <div className="portfolio-header">
        <div className="portfolio-user">
          <div className="portfolio-avatar">
            {username.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div className="portfolio-username">{username}</div>
            <div className="portfolio-subtitle">Portföyüm</div>
          </div>
        </div>
        <div className="portfolio-total">
          <div className="portfolio-total-label">Toplam Değer</div>
          <div className="portfolio-total-value">
            ${totalValue.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="portfolio-breakdown">
        <div className="portfolio-balance-card">
          <div className="portfolio-card-label">USD Bakiye</div>
          <div className="portfolio-card-value">
            ${balanceUsd.toFixed(2)}
          </div>
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
                const price = prices[h.symbol] || 0;
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