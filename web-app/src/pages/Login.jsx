import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate(); // Yönlendirme için

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('session_token', response.data.token);
      navigate('/dashboard'); // Giriş sonrası dashboard'a at
    } catch (error) {
      alert('Giriş başarısız!');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>CryptoPal Giriş</h2>
        <input type="text" placeholder="Kullanıcı Adı" onChange={(e) => setFormData({...formData, username: e.target.value})} />
        <input type="password" placeholder="Şifre" onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <button type="submit">Giriş Yap</button>
        <p>Hesabın yok mu? <Link to="/register">Kayıt Ol</Link></p>
      </form>
    </div>
  );
};
export default Login;