import { useState } from 'react';
import { loginUser } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ username, password });
      localStorage.setItem('token', response.data.token);
      alert('Giriş başarılı!');
      // İleride burayı borsa paneline yönlendireceğiz
      navigate('/dashboard');
    } catch (error) {
      alert('Giriş başarısız, bilgilerini kontrol et.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Giriş Yap</h2>
        <input type="text" placeholder="Kullanıcı Adı" onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Şifre" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Giriş</button>
        <p>Hesabın yok mu? <Link to="/register" className="link">Kayıt Ol</Link></p>
      </form>
    </div>
  );
}