import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Uygulama açıldığında doğrudan login sayfasına yönlendir */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Giriş ve Kayıt sayfalarımızın rotaları */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;