import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      const message =
        err.response?.data?.message || 'Kullanıcı adı veya şifre hatalı.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
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
            <input
              className="auth-input"
              type="text"
              placeholder="Kullanıcı adınız"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={loading}
              autoFocus
            />
          </label>

          <label className="auth-label">
            Şifre
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
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

        <div className="auth-footer">
          Hesabın yok mu? <Link to="/register" className="auth-link">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;