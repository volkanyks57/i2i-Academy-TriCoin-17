import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Market
export const getMarketPrices = () => {
  return api.get('/market/prices');
};

export const getPriceHistory = (symbol, hours = 24) => {
  return api.get(`/market/history/${symbol}?hours=${hours}`);
};

// AI
export const getAiInsight = (query) => {
  return api.post('/ai/query', { message: query });
};

export const getPortfolioHealthScore = () => api.get('/ai/health-score');

// Portfolio
export const getPortfolio = () => {
  return api.get('/portfolio');
};

// Trading
export const getTradeQuote = (symbol) => {
  return api.get(`/trade/quote/${symbol}`);
};

export const executeTrade = (symbol, side, amount) => {
  return api.post('/trade/execute', { symbol, side, amount });
};

export const createPriceAlert = (alertData) => {
  return api.post('/alerts', alertData);
};

// Favorites
export const getFavorites = () => {
  return api.get('/favorites');
};

export const addFavorite = (symbol) => {
  return api.post(`/favorites/${symbol}`);
};

export const removeFavorite = (symbol) => {
  return api.delete(`/favorites/${symbol}`);
};

export default api;

export const getTriggeredAlerts = () => api.get('/alerts/triggered');
export const dismissAlert = (id) => api.delete(`/alerts/${id}`);