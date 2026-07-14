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

// BURAYI EKLE:
// Market verilerini çeken fonksiyonu dışarıya (export) açıyoruz
export const getMarketPrices = () => {
  return api.get('/market/prices'); // Backend'deki MarketController'daki endpoint yolunu buraya yazmalısın
};

export default api;

export const getAiInsight = (query) => {
  return api.post('/ai/query', { query }); // Backend'deki AiQueryRequest DTO'su ile eşleşecek
};