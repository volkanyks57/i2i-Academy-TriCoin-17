import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getMarketPrices = async () => {
  const token = localStorage.getItem('token');
  // Axios ile kendi backend'imizden verileri çekiyoruz
  return await axios.get('http://localhost:8080/api/market/prices', {
    headers: { Authorization: `Bearer ${token}` }
  });
};