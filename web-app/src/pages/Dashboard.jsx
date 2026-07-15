import { useEffect, useState, useRef } from 'react';
import './Dashboard.css';
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

  // Track previous prices so we can compare and trigger a flash
  // when the value changes between polls.
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
        // Flash lasts ~800ms then clears — enough to notice but not distracting.
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

  const handleRowClick = (symbol) => {
    setSelectedSymbol(symbol);
  };

  const closeTradeModal = () => {
    setSelectedSymbol(null);
  };

  const handleTradeSuccess = () => {
    fetchPrices();
    setPortfolioRefresh((prev) => prev + 1);
  };

  return (
    <div className="dashboard-page">
      <Header />

      <button
        className={`ai-fab ${isChatOpen ? 'ai-fab-hidden' : ''}`}
        onClick={() => setIsChatOpen(true)}
        title="AI Asistanı"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <AiInsights isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <TradeModal
        symbol={selectedSymbol}
        isOpen={!!selectedSymbol}
        onClose={closeTradeModal}
        onTradeSuccess={handleTradeSuccess}
      />

      <div className="dashboard-wrapper">
        <PortfolioWidget refreshTrigger={portfolioRefresh} />

        <h2 className="dashboard-title">Canlı Piyasa Fiyatları</h2>
        <table className="price-table">
          <thead>
            <tr>
              <th>Sembol</th>
              <th>Fiyat ($)</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((item, index) => {
              const flashClass = flashMap[item.symbol]
                ? `price-flash-${flashMap[item.symbol]}`
                : '';
              return (
                <tr
                  key={index}
                  className={`price-row ${flashClass}`}
                  onClick={() => handleRowClick(item.symbol)}
                  title={`${item.symbol} işlemi için tıkla`}
                >
                  <td><strong>{item.symbol}</strong></td>
                  <td>{parseFloat(item.price).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}