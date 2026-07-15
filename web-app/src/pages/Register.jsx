import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      setSuccess(true);
      // Give the user a moment to read the confirmation before redirecting.
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <ThemeToggle className="auth-theme-toggle" />
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

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="auth-title">Kayıt başarılı!</h2>
            <p className="auth-subtitle">Giriş sayfasına yönlendiriliyorsun...</p>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Hesap oluştur</h2>
            <p className="auth-subtitle">TriCoin'e katıl, kriptolarla tanış.</p>

            <form onSubmit={handleRegister} className="auth-form">
              <label className="auth-label">
                Kullanıcı Adı
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Bir kullanıcı adı seç"
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
                  placeholder="En az 6 karakter"
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
                    Kayıt oluşturuluyor...
                  </span>
                ) : (
                  'Kayıt Ol'
                )}
              </button>
            </form>

            <div className="auth-footer">
              Zaten hesabın var mı? <Link to="/login" className="auth-link">Giriş Yap</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;