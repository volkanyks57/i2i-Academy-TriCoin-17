import { useState } from 'react';
import { registerUser } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ username, password });
      alert('Kayıt başarılı! Şimdi giriş yapabilirsin.');
      navigate('/login');
    } catch (error) {
      alert('Kayıt başarısız oldu.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Kayıt Ol</h2>
        <input type="text" placeholder="Kullanıcı Adı" onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Şifre" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Kayıt Ol</button>
        <p>Zaten hesabın var mı? <Link to="/login" className="link">Giriş Yap</Link></p>
      </form>
    </div>
  );
}