// src/components/ProfileMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getPortfolio, getMarketPrices } from '../services/api';

const COLORS = ['#a78bfa', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#ec4899', '#14b8a6'];

export default function ProfileMenu() {
  const [username, setUsername] = useState('');
  const [open, setOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  // Same JWT-decode trick used in PortfolioWidget — avoids an extra API call.
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

  // Close the dropdown on any click outside of it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch fresh data every time the panel is opened, not on every render.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([getPortfolio(), getMarketPrices()])
      .then(([portfolioRes, pricesRes]) => {
        setPortfolio(portfolioRes.data);
        const priceMap = {};
        pricesRes.data.prices.forEach((p) => {
          priceMap[p.symbol] = parseFloat(p.price);
        });
        setPrices(priceMap);
      })
      .catch(() => setPortfolio(null))
      .finally(() => setLoading(false));
  }, [open]);

  const balanceUsd = portfolio ? parseFloat(portfolio.balanceUsd) : 0;
  const holdings = portfolio?.holdings || [];

  const chartData = [
    { name: 'USD', value: balanceUsd },
    ...holdings
      .map((h) => ({
        name: h.symbol,
        value: parseFloat(h.amount) * (prices[h.symbol] || 0),
      }))
      .filter((d) => d.value > 0),
  ];

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-avatar-btn"
        onClick={() => setOpen((prev) => !prev)}
        title="Profilim"
      >
        {username.charAt(0).toUpperCase() || '?'}
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <div className="profile-avatar-lg">
              {username.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div className="profile-dropdown-name">{username}</div>
              <div className="profile-dropdown-total">
                ${totalValue.toFixed(2)}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="profile-dropdown-loading">Yükleniyor...</div>
          ) : chartData.length === 0 ? (
            <div className="profile-dropdown-loading">Veri yok</div>
          ) : (
            <div className="profile-pie-container">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(20, 15, 35, 0.95)',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                    formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="profile-pie-legend">
                {chartData.map((entry, index) => (
                  <div key={entry.name} className="profile-legend-item">
                    <span
                      className="profile-legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="profile-legend-label">{entry.name}</span>
                    <span className="profile-legend-value">
                      {totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}