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

  return (<div className="history-page">
      <Header />

      <div className="history-wrapper" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
        <h2 className="history-title" style={{ color: 'var(--text-hi)', marginBottom: '24px' }}>İşlem Geçmişi</h2>

        {/* İstatistikler - Neon Glow Kartlar */}
        <div className="history-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Toplam İşlem', value: totalTrades },
            { label: 'Alım', value: buyCount, color: 'var(--up)' },
            { label: 'Satım', value: sellCount, color: 'var(--down)' },
            { label: 'Toplam Hacim', value: `$${totalVolume.toFixed(2)}` }
          ].map((stat, i) => (
            <div key={i} className="neon-glow" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-a)', borderRadius: '12px', padding: '16px' }}>
              <div className="history-stat-label" style={{ color: 'var(--text-lo)', fontSize: '0.78rem', marginBottom: '6px' }}>{stat.label}</div>
              <div className="history-stat-value" style={{ color: stat.color || 'var(--text-hi)', fontSize: '1.4rem', fontWeight: '700' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tablo - Neon Glow Kapsayıcı */}
        <div className="neon-glow" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-a)', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <div className="history-empty" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-mid)' }}>Yükleniyor...</div>
          ) : error ? (
            <div className="history-error" style={{ padding: '40px', textAlign: 'center', color: 'var(--down)' }}>{error}</div>
          ) : transactions.length === 0 ? (
            <div className="history-empty" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-mid)' }}>
              <p>Henüz işlem yapılmamış.</p>
              <p className="history-empty-hint" style={{ color: 'var(--accent)', fontStyle: 'italic', fontSize: '0.9rem' }}>
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
    </div>);
}