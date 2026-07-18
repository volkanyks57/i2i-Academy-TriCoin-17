import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import loginBg from '../assets/login-bg.png';
import lightBg from '../assets/light.png';

const COUNTRY_CODES = [
  { code: '+90', country: 'Türkiye', short: 'TR', placeholder: '5XX XXX XX XX' },
  { code: '+1', country: 'ABD', short: 'US', placeholder: '(XXX) XXX-XXXX' },
  { code: '+44', country: 'İngiltere', short: 'GB', placeholder: '7XXX XXXXXX' },
  { code: '+49', country: 'Almanya', short: 'DE', placeholder: '1XX XXXXXXXX' },
  { code: '+33', country: 'Fransa', short: 'FR', placeholder: '6 XX XX XX XX' },
  { code: '+39', country: 'İtalya', short: 'IT', placeholder: '3XX XXX XXXX' },
  { code: '+34', country: 'İspanya', short: 'ES', placeholder: '6XX XXX XXX' },
  { code: '+31', country: 'Hollanda', short: 'NL', placeholder: '6 XXXXXXXX' },
  { code: '+7', country: 'Rusya', short: 'RU', placeholder: '9XX XXX XX XX' },
  { code: '+81', country: 'Japonya', short: 'JP', placeholder: '90 XXXX XXXX' },
  { code: '+82', country: 'Güney Kore', short: 'KR', placeholder: '10 XXXX XXXX' },
  { code: '+86', country: 'Çin', short: 'CN', placeholder: '1XX XXXX XXXX' },
  { code: '+91', country: 'Hindistan', short: 'IN', placeholder: '9XXX XXX XXX' },
  { code: '+55', country: 'Brezilya', short: 'BR', placeholder: '11 9XXXX XXXX' },
  { code: '+61', country: 'Avustralya', short: 'AU', placeholder: '4XX XXX XXX' },
  { code: '+971', country: 'BAE', short: 'AE', placeholder: '5X XXX XXXX' },
  { code: '+966', country: 'S. Arabistan', short: 'SA', placeholder: '5X XXX XXXX' },
  { code: '+30', country: 'Yunanistan', short: 'GR', placeholder: '69X XXX XXXX' },
  { code: '+994', country: 'Azerbaycan', short: 'AZ', placeholder: '5X XXX XX XX' },
  { code: '+995', country: 'Gürcistan', short: 'GE', placeholder: '5XX XX XX XX' },
];

const Register = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    countryCode: '+90',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d{7,14}$/.test(phone);
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 4);
  };

  const getStrengthText = (score) => {
    if (score <= 1) return 'Zayıf';
    if (score === 2) return 'Orta';
    if (score === 3) return 'İyi';
    return 'Güçlü';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.phone || !formData.password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Geçerli bir telefon numarası girin.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        phoneCountryCode: formData.countryCode,
        phoneNumber: formData.phone,
        password: formData.password,
      };
      await api.post('/auth/register', payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data || 'Kayıt başarısız. Lütfen tekrar deneyin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === formData.countryCode);

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
                E-posta
                <input
                  className="auth-input"
                  type="email"
                  placeholder="ornek@mail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </label>

              <label className="auth-label">
                Telefon Numarası
                <div className="auth-phone-wrapper" style={{ position: 'relative' }} ref={dropdownRef}>
                  <div 
                    className="auth-phone-code custom-select" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px', backgroundImage: 'none' }}
                  >
                    <img 
                      src={`https://flagcdn.com/w20/${COUNTRY_CODES.find(c => c.code === formData.countryCode)?.short.toLowerCase() || 'tr'}.png`}
                      alt="flag"
                      style={{ width: '20px', borderRadius: '2px' }}
                    />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {COUNTRY_CODES.find(c => c.code === formData.countryCode)?.short} {COUNTRY_CODES.find(c => c.code === formData.countryCode)?.country} ({formData.countryCode})
                    </span>
                    <svg style={{ flexShrink: 0, marginLeft: 'auto', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="custom-dropdown-menu">
                      {COUNTRY_CODES.map((c) => (
                        <div 
                          key={c.code + c.short} 
                          className={`custom-dropdown-item ${formData.countryCode === c.code ? 'selected' : ''}`}
                          onClick={() => {
                            setFormData({ ...formData, countryCode: c.code });
                            setIsDropdownOpen(false);
                          }}
                        >
                          <img src={`https://flagcdn.com/w20/${c.short.toLowerCase()}.png`} alt={c.short} style={{ width: '20px', borderRadius: '2px' }} />
                          <span>{c.country} ({c.code})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    className="auth-input auth-phone-input"
                    type="tel"
                    placeholder={COUNTRY_CODES.find((c) => c.code === formData.countryCode)?.placeholder || 'Telefon numarası'}
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                    }}
                    disabled={loading}
                  />
                </div>
              </label>

              <label className="auth-label">
                Şifre
                <div className="auth-input-wrapper">
                  <input
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                  />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((prev) => !prev)} tabIndex={-1}>
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
                <div className="password-strength">
                  <div className="strength-bar-bg">
                    <div className={`strength-bar-fill active-${calculatePasswordStrength(formData.password)}`}></div>
                  </div>
                  <span className="strength-text">
                    {formData.password ? getStrengthText(calculatePasswordStrength(formData.password)) : 'Şifre Gücü'}
                  </span>
                </div>
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

            <div className="auth-separator">
              <span>veya şununla devam et</span>
            </div>
            <div className="auth-social-buttons">
              <button type="button" className="auth-social-btn" onClick={() => console.log('Google ile kayıt')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.649-3.342-11.299-8.015l-6.55 5.064C9.495 39.73 16.208 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                Google
              </button>
              <button type="button" className="auth-social-btn" onClick={() => console.log('Apple ile kayıt')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                Apple
              </button>
            </div>

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