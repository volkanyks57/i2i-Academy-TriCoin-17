// src/components/ThemeToggle.jsx
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title="Tema Değiştir"
      type="button"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}