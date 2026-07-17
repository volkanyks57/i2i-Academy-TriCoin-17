import { useEffect, useState, useRef } from 'react';
import { getMarketPrices, getFavorites, addFavorite, removeFavorite, getPriceHistory } from '../services/api';
import Header from '../components/Header';
import AiInsights from '../components/AiInsights';
import TradeModal from '../components/TradeModal';
import PortfolioWidget from '../components/PortfolioWidget';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [flashMap, setFlashMap] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [portfolioRefresh, setPortfolioRefresh] = useState(0);
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const previousPricesRef = useRef({});
  const [sparklines, setSparklines] = useState({});

  const fetchPrices = async () => {
    try {
      const response = await getMarketPrices();
      const newPrices = response.data.prices;
      const newFlashMap = {};
      newPrices.forEach((p) => {
        const prev = previousPricesRef.current[p.symbol];
        const current = parseFloat(p.price);
        if (prev !== undefined && prev !== current) {
          newFlashMap[p.symbol] = current > prev ? 'up' : 'down';
        }
        previousPricesRef.current[p.symbol] = current;
      });
      setPrices(newPrices);
      if (Object.keys(newFlashMap).length > 0) {
        setFlashMap(newFlashMap);
        setTimeout(() => setFlashMap({}), 800);
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  const fetchSparklines = async (symbols) => {
  const results = await Promise.allSettled(
    symbols.map((symbol) => getPriceHistory(symbol, 24))
  );
  const map = {};
  results.forEach((res, i) => {
    if (res.status === 'fulfilled') {
      map[symbols[i]] = (res.value.data.points || []).map((p) => ({
        price: parseFloat(p.price),
      }));
    }
  });
  setSparklines((prev) => ({ ...prev, ...map }));
};

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  if (prices.length === 0) return;
  const symbols = prices.map((p) => p.symbol);
  fetchSparklines(symbols);
  const interval = setInterval(() => fetchSparklines(symbols), 60000);
  return () => clearInterval(interval);
}, [prices.length]);

  useEffect(() => {
    setShowAiTooltip(true);
    const timer = setTimeout(() => setShowAiTooltip(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getFavorites()
      .then((res) => setFavorites(res.data.favorites || []))
      .catch((err) => console.error('Favoriler yüklenemedi:', err));
  }, []);

  const handleRowClick = (symbol) => setSelectedSymbol(symbol);
  const closeTradeModal = () => setSelectedSymbol(null);
  const handleTradeSuccess = () => {
    fetchPrices();
    setPortfolioRefresh((prev) => prev + 1);
  };

  const handleToggleFavorite = async (symbol, e) => {
    e.stopPropagation();
    const isFavorite = favorites.includes(symbol);
    try {
      if (isFavorite) {
        await removeFavorite(symbol);
        setFavorites((prev) => prev.filter((s) => s !== symbol));
      } else {
        await addFavorite(symbol);
        setFavorites((prev) => [...prev, symbol]);
      }
    } catch (error) {
      console.error('Favori güncellenemedi:', error);
    }
  };

  const filteredPrices = prices.filter((item) =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (<div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
    <Header />

    {showAiTooltip && (
      <div className="ai-tooltip">
        <div className="ai-tooltip-content">
          <span className="ai-tooltip-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"></path>
            </svg>
          </span>
          <div>
            <div className="ai-tooltip-title">AI Destek</div>
            <div className="ai-tooltip-text">Portföyün hakkında soru sor</div>
          </div>
          <button className="ai-tooltip-close" onClick={() => setShowAiTooltip(false)} title="Kapat">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="ai-tooltip-arrow"></div>
      </div>
    )}

    <button className="ai-fab" onClick={() => setIsChatOpen(true)} title="AI Asistanı">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"></path>
        <path d="M19 3v4"></path>
        <path d="M17 5h4"></path>
      </svg>
    </button>

    <AiInsights
      isOpen={isChatOpen}
      onClose={() => setIsChatOpen(false)}
      initialQuestion={pendingQuestion}
      onQuestionConsumed={() => setPendingQuestion(null)}
    />

    <TradeModal
      symbol={selectedSymbol}
      isOpen={!!selectedSymbol}
      onClose={closeTradeModal}
      onTradeSuccess={handleTradeSuccess}
    />

    {/* Portföy Kartı - Çökmeyen Neon Çerçeve */}
    <div className="neon-glow" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-a)', borderRadius: '12px', padding: '10px', marginBottom: '24px' }}>
      <PortfolioWidget
        refreshTrigger={portfolioRefresh}
        onOpenAiChat={(question) => {
          setPendingQuestion(question || null);
          setIsChatOpen(true);
        }}
      />
    </div>

    {/* Tablo Kartı - Çökmeyen Neon Çerçeve */}
    <div className="neon-glow" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-a)', borderRadius: '12px', padding: '20px' }}>
      <div className="price-table-header">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-hi)', margin: 0 }}>Canlı Piyasa Fiyatları</h2>
        <div className="price-search-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="price-search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            className="price-search-input"
            type="text"
            placeholder="Sembol ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="price-search-clear"
              onClick={() => setSearchQuery('')}
              title="Temizle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="price-table market-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Sembol</th>
              <th>Fiyat ($)</th>
              <th style={{ width: '90px' }}>Trend</th>
              <th>24s Değişim</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrices.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-mid)' }}>
                  "{searchQuery}" için sonuç bulunamadı
                </td>
              </tr>
            ) : filteredPrices.map((item, index) => {
              const isUp = item.change24h >= 0;
              const isFavorite = favorites.includes(item.symbol);
              return (
                <tr key={index} className="price-row" onClick={() => handleRowClick(item.symbol)}>
                  <td style={{ width: '40px', textAlign: 'center' }}>
                    <button
                      className={`favorite-star-btn ${isFavorite ? 'is-favorite' : ''}`}
                      onClick={(e) => handleToggleFavorite(item.symbol, e)}
                      title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </button>
                  </td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={`https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`}
                      alt={item.symbol}
                      className="coin-logo"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png'; }}
                    />
                    <strong>{item.symbol}</strong>
                  </td>
                  <td>{parseFloat(item.price).toFixed(2)}</td>
                  <td style={{ width: '90px' }}>
                    {sparklines[item.symbol]?.length > 1 ? (
                      <ResponsiveContainer width="100%" height={30}>
                        <LineChart data={sparklines[item.symbol]}>
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke={isUp ? '#10b981' : '#ef4444'}
                            strokeWidth={1.5}
                            dot={false}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <span style={{ color: 'var(--text-lo)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: isUp ? 'var(--up)' : 'var(--down)', fontWeight: 'bold' }}>
                    {isUp ? '+' : ''}{parseFloat(item.change24h).toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>);
}