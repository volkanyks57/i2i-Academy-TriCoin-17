import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert('Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (error) {
      alert('Kayıt başarısız!');
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Kayıt Ol</h2>
        <input type="text" placeholder="Kullanıcı Adı" onChange={(e) => setFormData({...formData, username: e.target.value})} />
        <input type="password" placeholder="Şifre" onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <button type="submit">Kayıt Ol</button>
        <p>Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link></p>
      </form>
    </div>
  );
};
export default Register;