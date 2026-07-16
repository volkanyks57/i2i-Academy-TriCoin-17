// src/pages/Settings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.sub || '');
      } catch {
        setUsername('');
      }
    }
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Lütfen bir resim dosyası seçin.');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(res.data.profilePictureUrl);
      showMessage('success', 'Profil fotoğrafı güncellendi.');
    } catch (err) {
      showMessage('error', 'Fotoğraf yüklenemedi, lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showMessage('error', 'Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Yeni şifre en az 6 karakter olmalı.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/user/change-password', {
        currentPassword,
        newPassword,
      });
      showMessage('success', 'Şifreniz başarıyla güncellendi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const translated =
        backendMessage === 'Current password is incorrect'
          ? 'Mevcut şifreniz yanlış.'
          : 'Şifre güncellenemedi, lütfen tekrar deneyin.';
      showMessage('error', translated);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (<div className="settings-page">
      <Header />

      <div className="settings-wrapper" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
        <h2 className="settings-title" style={{ color: 'var(--text-hi)', marginBottom: '24px' }}>Hesap Ayarları</h2>

        {message && (
          <div className={`settings-toast settings-toast-${message.type}`} style={{ marginBottom: '18px' }}>
            {message.text}
          </div>
        )}

        {/* Profil Fotoğrafı - Neon Glow Kart */}
        <div className="neon-glow" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-a)', borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
          <h3 className="settings-card-title" style={{ color: 'var(--text-hi)', marginBottom: '18px' }}>Profil Fotoğrafı</h3>
          <div className="settings-avatar-row" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div className="settings-avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profil" />
              ) : (
                <span>{username.charAt(0).toUpperCase() || '?'}</span>
              )}
            </div>
            <div>
              <button
                type="button"
                className="settings-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <p className="settings-hint" style={{ color: 'var(--text-lo)', fontSize: '0.78rem' }}>JPG veya PNG, ideal 200x200px</p>
            </div>
          </div>
        </div>

        {/* Şifre Değiştir - Neon Glow Kart */}
        <div className="neon-glow" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-a)', borderRadius: '14px', padding: '22px' }}>
          <h3 className="settings-card-title" style={{ color: 'var(--text-hi)', marginBottom: '18px' }}>Şifre Değiştir</h3>
          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <label className="auth-label" style={{ color: 'var(--text-mid)' }}>
              Mevcut Şifre
              <input
                className="auth-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordLoading}
                required
              />
            </label>
            <label className="auth-label" style={{ color: 'var(--text-mid)' }}>
              Yeni Şifre
              <input
                className="auth-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
                required
              />
            </label>
            <label className="auth-label" style={{ color: 'var(--text-mid)' }}>
              Yeni Şifre (Tekrar)
              <input
                className="auth-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
                required
              />
            </label>
            <button
              type="submit"
              className="settings-submit-btn"
              style={{ width: '100%' }}
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        </div>
      </div>
    </div>);
}