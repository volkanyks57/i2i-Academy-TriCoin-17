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
            {loading ? (
              <span className="auth-submit-loading">
                <span className="auth-spinner"></span>
                Giriş yapılıyor...
              </span>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <div className="auth-separator">
          <span>veya şununla devam et</span>
        </div>
        <div className="auth-social-buttons">
          <button type="button" className="auth-social-btn" onClick={() => console.log('Google ile giriş')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.649-3.342-11.299-8.015l-6.55 5.064C9.495 39.73 16.208 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Google
          </button>
          <button type="button" className="auth-social-btn" onClick={() => console.log('Apple ile giriş')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            Apple
          </button>
        </div>

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