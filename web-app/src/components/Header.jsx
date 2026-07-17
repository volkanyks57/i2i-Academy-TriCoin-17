// src/components/Header.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ProfileMenu from './ProfileMenu';
import NotificationPanel from './NotificationPanel'; // 1. Bileşeni import ettik

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    navigate('/login');
  };

  const isHistory = location.pathname === '/history';
  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div
          className="app-brand"
          onClick={() => navigate('/dashboard')}
          role="button"
          tabIndex={0}
        >
          <div className="app-brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
              <line x1="12" y1="22" x2="12" y2="15.5"></line>
              <polyline points="22 8.5 12 15.5 2 8.5"></polyline>
              <polyline points="2 15.5 12 8.5 22 15.5"></polyline>
              <line x1="12" y1="2" x2="12" y2="8.5"></line>
            </svg>
          </div>
          <span className="app-brand-name">TriCoin</span>
        </div>

        <nav className="app-nav">
          <button
            className={`app-nav-btn ${isDashboard ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            className={`app-nav-btn ${isHistory ? 'active' : ''}`}
            onClick={() => navigate('/history')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Geçmiş</span>
          </button>
          
          <ProfileMenu />

          {/* 2. Bildirim panelini buraya yerleştirdik */}
          <NotificationPanel />

          <button className="app-nav-btn" onClick={toggleTheme} title="Tema Değiştir">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            className="app-nav-btn app-nav-logout"
            onClick={handleLogout}
            title="Çıkış Yap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Çıkış</span>
          </button>
        </nav>
      </div>
    </header>
  );
}