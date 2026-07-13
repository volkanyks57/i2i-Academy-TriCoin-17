import { useEffect, useState } from 'react';
import { getMarketPrices } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMarketPrices();
        setPrices(response.data.prices);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval); 
  }, []);

  return (
  <div className="dashboard-wrapper">
    <h2 className="dashboard-title">Canlı Piyasa Fiyatları</h2>
    <table className="price-table">
      <thead>
        <tr>
          <th>Sembol</th>
          <th>Fiyat ($)</th>
        </tr>
      </thead>
      <tbody>
        {prices.map((item, index) => (
          <tr key={index}>
            <td><strong>{item.symbol}</strong></td>
            <td>{parseFloat(item.price).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}
