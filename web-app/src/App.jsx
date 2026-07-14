import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
// Dashboard henüz yoksa boş bir tane oluşturacağız
import Dashboard from './pages/Dashboard'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Login />} /> {/* Varsayılan giriş ekranı */}
      </Routes>
    </Router>
  );
}
export default App;