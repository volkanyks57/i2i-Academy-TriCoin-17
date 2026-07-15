// src/hooks/useTheme.js
import { useState, useEffect } from 'react';

// Shared theme logic so both the logged-in Header and the public
// Login/Register pages can read and toggle the same theme.
export function useTheme() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}