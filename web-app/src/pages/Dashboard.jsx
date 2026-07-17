import { useEffect, useState, useRef } from 'react';
import { getMarketPrices } from '../services/api';
import Header from '../components/Header';
import AiInsights from '../components/AiInsights';
import TradeModal from '../components/TradeModal';
import PortfolioWidget from '../components/PortfolioWidget';


export default function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [flashMap, setFlashMap] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [portfolioRefresh, setPortfolioRefresh] = useState(0);
  const previousPricesRef = useRef({});

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

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRowClick = (symbol) => setSelectedSymbol(symbol);
  const closeTradeModal = () => setSelectedSymbol(null);
  const handleTradeSuccess = () => {
    fetchPrices();
    setPortfolioRefresh((prev) => prev + 1);
  };

  return (<div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
    <Header />

    <button className="ai-fab" onClick={() => setIsChatOpen(true)} title="AI Asistanı">
      {/* Hata veren kütüphane yerine temiz bir SVG ikonu koyduk */}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    </button>

    <AiInsights isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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
        onOpenAiChat={() => setIsChatOpen(true)}
      />
    </div>

   

    {/* Tablo Kartı - Çökmeyen Neon Çerçeve */}
    <div className="neon-glow" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-a)', borderRadius: '12px', padding: '20px' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: 'bold', color: 'var(--text-hi)' }}>Canlı Piyasa Fiyatları</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="price-table">
          <thead>
            <tr>
              <th>Sembol</th>
              <th>Fiyat ($)</th>
              <th>24s Değişim</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((item, index) => {
              const isUp = item.change24h >= 0;
              return (
                <tr key={index} className="price-row" onClick={() => handleRowClick(item.symbol)}>
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