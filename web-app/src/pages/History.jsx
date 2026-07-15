// src/pages/History.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/trade/history')
      .then((res) => {
        setTransactions(res.data.transactions || []);
      })
      .catch(() => {
        setError('İşlem geçmişi yüklenemedi.');
      })
      .finally(() => setLoading(false));
  }, []);

  const totalTrades = transactions.length;
  const buyCount = transactions.filter((t) => t.side === 'BUY').length;
  const sellCount = transactions.filter((t) => t.side === 'SELL').length;
  const totalVolume = transactions.reduce(
    (sum, t) => sum + parseFloat(t.totalValue || 0),
    0
  );

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="history-page">
      <Header />

      <div className="history-wrapper">
        <h2 className="history-title">İşlem Geçmişi</h2>

        <div className="history-stats">
          <div className="history-stat-card">
            <div className="history-stat-label">Toplam İşlem</div>
            <div className="history-stat-value">{totalTrades}</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-label">Alım</div>
            <div className="history-stat-value history-buy-color">{buyCount}</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-label">Satım</div>
            <div className="history-stat-value history-sell-color">{sellCount}</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-label">Toplam Hacim</div>
            <div className="history-stat-value">${totalVolume.toFixed(2)}</div>
          </div>
        </div>

        <div className="history-list-container">
          {loading ? (
            <div className="history-empty">Yükleniyor...</div>
          ) : error ? (
            <div className="history-error">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="history-empty">
              <p>Henüz işlem yapılmamış.</p>
              <p className="history-empty-hint">
                Dashboard'dan bir kripto seçip işlem yapabilirsin.
              </p>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Sembol</th>
                  <th>Tür</th>
                  <th>Miktar</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="history-cell-date">{formatDate(tx.createdAt)}</td>
                    <td>
                      <span className="history-symbol">{tx.symbol}</span>
                    </td>
                    <td>
                      <span
                        className={`history-side-badge ${
                          tx.side === 'BUY' ? 'history-badge-buy' : 'history-badge-sell'
                        }`}
                      >
                        {tx.side === 'BUY' ? 'AL' : 'SAT'}
                      </span>
                    </td>
                    <td className="history-cell-amount">
                      {parseFloat(tx.amount).toFixed(8)}
                    </td>
                    <td className="history-cell-price">
                      ${parseFloat(tx.pricePerUnit).toFixed(2)}
                    </td>
                    <td className="history-cell-total">
                      ${parseFloat(tx.totalValue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}