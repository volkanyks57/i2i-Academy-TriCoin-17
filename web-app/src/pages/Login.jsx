import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getMarketPrices } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import loginBg from '../assets/login-bg.png';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCoins = async () => {
    try {
      const response = await getMarketPrices();
      console.log("Ham veri ulaştı:", response.data);

      let coinArray = [];
      const rawData = response.data;

      // Backend'in gönderdiği { prices: [...] } yapısını hedefliyoruz
      if (rawData && rawData.prices && Array.isArray(rawData.prices)) {
        coinArray = rawData.prices;
      } else if (Array.isArray(rawData)) {
        coinArray = rawData;
      }

      if (Array.isArray(coinArray)) {
        setCoins(coinArray);
      }
    } catch (err) {
      console.error("Market verisi alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('session_token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Kullanıcı adı veya şifre hatalı.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '80px',
      padding: '40px'
    }}>

      <ThemeToggle className="auth-theme-toggle" />

      {/* SOL TARAF: GİRİŞ FORMU */}
      <div className="auth-card" style={{ position: 'relative', zIndex: 1, maxWidth: '400px', width: '100%' }}>
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
              <line x1="12" y1="22" x2="12" y2="15.5"></line>
              <polyline points="22 8.5 12 15.5 2 8.5"></polyline>
              <polyline points="2 15.5 12 8.5 22 15.5"></polyline>
              <line x1="12" y1="2" x2="12" y2="8.5"></line>
            </svg>
          </div>
          <h1 className="auth-brand-name">TriCoin</h1>
        </div>

        <h2 className="auth-title">Tekrar hoş geldin</h2>
        <p className="auth-subtitle">Hesabına giriş yap ve piyasayı takip et.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Kullanıcı Adı
            <input className="auth-input" type="text" placeholder="Kullanıcı adınız" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={loading} autoFocus />
          </label>

          <label className="auth-label">
            Şifre
            <div className="auth-input-wrapper">
              <input className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} disabled={loading} />
              <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((prev) => !prev)} tabIndex={-1}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-footer">
          Hesabın yok mu? <Link to="/register" className="auth-link">Kayıt Ol</Link>
        </div>
      </div>

  
      <div className="market-preview" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '10px',
        width: '100%',
        maxWidth: '600px', 
        zIndex: 1
      }}>
        {coins.map((coin, index) => {
         

          const coinName = coin.symbol || coin.name || `Coin ${index + 1}`;
          
          const coinPrice = coin.price || coin.currentPrice || coin.lastPrice || 0;
        
          const coinChange = coin.change || 
                             coin.priceChangePercentage || 
                             coin.percentChange || 
                             coin.change24h || 
                             coin.priceChange || 0;

          return (
           <div key={coin.id || coin.symbol || index} className="login-coin-card neon-glow">
              <div className="login-coin-header">
                <img 
                  src={`https://assets.coincap.io/assets/icons/${coin.symbol ? coin.symbol.toLowerCase() : 'btc'}@2x.png`} 
                  alt={coinName} 
                  className="login-coin-logo" 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png'; }}
                />
                <h4 className="login-coin-name">{coinName}</h4>
              </div>
              <p className="login-coin-price">
                ${Number(coinPrice).toLocaleString()}
              </p>
              <span className={`login-coin-change ${coinChange > 0 ? 'up' : (coinChange < 0 ? 'down' : 'neutral')}`}>
                {coinChange > 0 ? '▲' : (coinChange < 0 ? '▼' : '-')} {Math.abs(Number(coinChange)).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        .market-preview::-webkit-scrollbar { width: 6px; }
        .market-preview::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .market-preview::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .market-preview::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
      `}</style>
    </div>
  );
};

export default Login;