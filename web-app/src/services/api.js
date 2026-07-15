import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
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

export default api;