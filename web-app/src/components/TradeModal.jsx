// src/components/TradeModal.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  getTradeQuote,
  executeTrade,
  getPortfolio,
  getPriceHistory,
} from '../services/api';

const TradeModal = ({ symbol, isOpen, onClose, onTradeSuccess }) => {
  const [quote, setQuote] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [side, setSide] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [historyHours, setHistoryHours] = useState(24);

  useEffect(() => {
    if (!isOpen || !symbol) return;

    setSide(null);
    setAmount('');
    setError('');
    setSuccess(null);
    setLoading(true);

    Promise.all([
      getTradeQuote(symbol),
      getPortfolio(),
      getPriceHistory(symbol, historyHours),
    ])
      .then(([quoteRes, portfolioRes, historyRes]) => {
        setQuote(quoteRes.data);
        setPortfolio(portfolioRes.data);
        setHistory(
          (historyRes.data.points || []).map((p) => ({
            time: new Date(p.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            price: parseFloat(p.price),
          }))
        );
      })
      .catch(() => {
        setError('Veriler alınamadı. Lütfen tekrar deneyin.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, symbol, historyHours]);

  if (!isOpen) return null;

  const currentHolding = portfolio?.holdings.find((h) => h.symbol === symbol);
  const holdingAmount = currentHolding ? parseFloat(currentHolding.amount) : 0;
  const balanceUsd = portfolio?.balanceUsd ? parseFloat(portfolio.balanceUsd) : 0;

  const canBuy = balanceUsd > 0;
  const canSell = holdingAmount > 0;

  const numericAmount = parseFloat(amount) || 0;
  const totalValue = quote ? numericAmount * parseFloat(quote.price) : 0;

  // Compute % change over the visible history window — the header shows
  // it in green or red as a quick trend indicator next to the price.
  const firstPrice = history.length > 0 ? history[0].price : null;
  const lastPrice = history.length > 0 ? history[history.length - 1].price : null;
  const priceChange =
    firstPrice && lastPrice
      ? ((lastPrice - firstPrice) / firstPrice) * 100
      : 0;
  const isPositive = priceChange >= 0;

  const handleExecute = async () => {
    if (!side || numericAmount <= 0) {
      setError('Lütfen geçerli bir miktar girin.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await executeTrade(symbol, side, numericAmount);
      setSuccess(res.data);
      if (onTradeSuccess) onTradeSuccess();
    } catch (err) {
      const message =
        err.response?.data?.message || 'İşlem gerçekleştirilemedi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trade-modal-overlay" onClick={onClose}>
      <div
        className="trade-modal trade-modal-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="trade-modal-header">
          <h3>
            <span className="trade-symbol-badge">{symbol}</span>
            İşlem
          </h3>
          <button className="trade-modal-close" onClick={onClose} title="Kapat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {success ? (
          <div className="trade-modal-body">
            <div className="trade-success">
              <div className="trade-success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h4>İşlem başarılı!</h4>
              <div className="trade-success-details">
                <p><strong>{success.side === 'BUY' ? 'Aldınız' : 'Sattınız'}:</strong> {success.amount} {success.symbol}</p>
                <p><strong>Fiyat:</strong> ${parseFloat(success.pricePerUnit).toFixed(2)}</p>
                <p><strong>Toplam:</strong> ${parseFloat(success.totalValue).toFixed(2)}</p>
                <p><strong>Yeni bakiye:</strong> ${parseFloat(success.newBalanceUsd).toFixed(2)}</p>
              </div>
              <button className="trade-execute-btn" onClick={onClose}>Kapat</button>
            </div>
          </div>
        ) : (
          <div className="trade-modal-split">
            {/* LEFT: Chart */}
            <div className="trade-chart-side">
              <div className="trade-chart-header">
                <div>
                  <div className="trade-chart-price">
                    {quote ? `$${parseFloat(quote.price).toFixed(2)}` : '—'}
                  </div>
                  {history.length > 0 && (
                    <div
                      className={`trade-chart-change ${
                        isPositive ? 'positive' : 'negative'
                      }`}
                    >
                      {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                      <span className="trade-chart-change-label">
                        son {historyHours} saat
                      </span>
                    </div>
                  )}
                </div>
                <div className="trade-chart-range">
                  {[1, 6, 24].map((h) => (
                    <button
                      key={h}
                      className={`trade-range-btn ${
                        historyHours === h ? 'active' : ''
                      }`}
                      onClick={() => setHistoryHours(h)}
                    >
                      {h}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="trade-chart-container">
                {loading && history.length === 0 ? (
                  <div className="trade-chart-loading">Grafik yükleniyor...</div>
                ) : history.length === 0 ? (
                  <div className="trade-chart-loading">
                    Bu aralık için veri yok
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={history}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(167, 139, 250, 0.1)"
                      />
                      <XAxis
                        dataKey="time"
                        stroke="rgba(255, 255, 255, 0.4)"
                        style={{ fontSize: '0.72rem' }}
                        tick={{ fill: 'rgba(255,255,255,0.5)' }}
                        minTickGap={30}
                      />
                      <YAxis
                        stroke="rgba(255, 255, 255, 0.4)"
                        style={{ fontSize: '0.72rem' }}
                        tick={{ fill: 'rgba(255,255,255,0.5)' }}
                        domain={['auto', 'auto']}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 15, 35, 0.95)',
                          border: '1px solid rgba(167, 139, 250, 0.3)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Fiyat']}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#c4a7ff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* RIGHT: Trade Form */}
            <div className="trade-form-side">
              {loading && !quote ? (
                <p className="trade-loading">Yükleniyor...</p>
              ) : (
                <>
                  <div className="trade-info-row">
                    <div className="trade-info-item">
                      <span className="trade-info-label">Bakiyeniz</span>
                      <span className="trade-info-value">
                        ${balanceUsd.toFixed(2)}
                      </span>
                    </div>
                    <div className="trade-info-item">
                      <span className="trade-info-label">Sahip Olduğunuz</span>
                      <span className="trade-info-value">
                        {holdingAmount} {symbol}
                      </span>
                    </div>
                  </div>

                  <div className="trade-side-buttons">
                    {canBuy && (
                      <button
                        className={`trade-side-btn trade-buy ${
                          side === 'BUY' ? 'active' : ''
                        }`}
                        onClick={() => setSide('BUY')}
                      >
                        AL
                      </button>
                    )}
                    {canSell && (
                      <button
                        className={`trade-side-btn trade-sell ${
                          side === 'SELL' ? 'active' : ''
                        }`}
                        onClick={() => setSide('SELL')}
                      >
                        SAT
                      </button>
                    )}
                  </div>

                  {side && (
                    <>
                      <label className="trade-amount-label">
                        {side === 'BUY' ? 'Alınacak' : 'Satılacak'} miktar (
                        {symbol})
                      </label>
                      <input
                        className="trade-amount-input"
                        type="number"
                        step="0.00000001"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={loading}
                      />

                      {numericAmount > 0 && (
                        <div className="trade-total">
                          Toplam: <strong>${totalValue.toFixed(2)}</strong>
                        </div>
                      )}

                      <button
                        className="trade-execute-btn"
                        onClick={handleExecute}
                        disabled={loading || numericAmount <= 0}
                      >
                        {loading ? 'İşleniyor...' : 'İşlemi Onayla'}
                      </button>
                    </>
                  )}

                  {error && <div className="trade-error">{error}</div>}

                  {quote && (
                    <div className="trade-price-hint-bottom">
                      Bu fiyat {quote.reservedForSeconds ?? 30} saniye kilitlenir
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeModal;