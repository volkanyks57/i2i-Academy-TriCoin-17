// src/pages/Favorites.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, getMarketPrices, removeFavorite } from '../services/api';
import TradeModal from '../components/TradeModal';
import Header from '../components/Header';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  const fetchAll = async () => {
    try {
      const [favRes, priceRes] = await Promise.all([
        getFavorites(),
        getMarketPrices(),
      ]);
      setFavorites(favRes.data.favorites || []);

      const priceMap = {};
      (priceRes.data.prices || []).forEach((p) => {
        priceMap[p.symbol] = {
          price: parseFloat(p.price),
          change24h: parseFloat(p.change24h || 0),
        };
      });
      setPrices(priceMap);
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRemove = async (symbol, e) => {
    e.stopPropagation();
    try {
      await removeFavorite(symbol);
      setFavorites((prev) => prev.filter((s) => s !== symbol));
    } catch (error) {
      console.error('Favoriden çıkarılamadı:', error);
    }
  };

  const handleTradeSuccess = () => {
    fetchAll();
  };

  return (
    <>
    <Header />
    <TradeModal
      symbol={selectedSymbol}
      isOpen={!!selectedSymbol}
      onClose={() => setSelectedSymbol(null)}
      onTradeSuccess={handleTradeSuccess}
    />
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ padding: '30px 20px 20px 20px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-hi)', margin: '0 0 24px 0' }}>
          ⭐ Favorilerim
        </h2>
    
        <div className="neon-glow" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-a)', borderRadius: '12px', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-mid)' }}>
              Yükleniyor...
            </div>
          ) : favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.4 }}>⭐</div>
              <p style={{ color: 'var(--text-hi)', fontSize: '1.05rem', margin: '0 0 6px 0' }}>
                Henüz favori yok
              </p>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', margin: 0 }}>
                Dashboard'daki kripto satırlarındaki yıldıza tıklayarak favorine ekleyebilirsin
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="price-table favorites-table">
                <thead>
                  <tr>
                    <th>Sembol</th>
                    <th>Fiyat ($)</th>
                    <th>24s Değişim</th>
                    <th style={{ textAlign: 'right' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map((symbol, index) => {
                    const priceData = prices[symbol];
                    const isUp = priceData?.change24h >= 0;
                    return (
                      <tr key={index} className="price-row">
                        <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`}
                            alt={symbol}
                            className="coin-logo"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png'; }}
                          />
                          <strong>{symbol}</strong>
                        </td>
                        <td>{priceData ? priceData.price.toFixed(2) : '—'}</td>
                        <td style={{ color: isUp ? 'var(--up)' : 'var(--down)', fontWeight: 'bold' }}>
                          {priceData ? `${isUp ? '+' : ''}${priceData.change24h.toFixed(2)}%` : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
                            <button
                              className="favorite-trade-btn"
                              onClick={(e) => { e.stopPropagation(); setSelectedSymbol(symbol); }}
                              title="İşlem yap"
                            >
                              İşlem Yap
                            </button>
                            <button
                              className="favorite-remove-btn"
                              onClick={(e) => handleRemove(symbol, e)}
                              title="Favorilerden çıkar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}