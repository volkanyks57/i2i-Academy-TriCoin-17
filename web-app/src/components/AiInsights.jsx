// src/components/AiInsights.jsx
import React, { useState } from 'react';
import { getAiInsight } from '../services/api';

const AiInsights = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await getAiInsight(query);
      setResponse(res.data.response); // Backend'den dönen DTO yapısına göre (AiQueryResponse)
    } catch (error) {
      setResponse("Üzgünüm, şu an analiz yapamıyorum.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-container" style={{ marginTop: '20px', padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--accent-bg)' }}>
      <h3 style={{ color: 'var(--accent)' }}>AI Analiz Asistanı</h3>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Örn: BTC düşer mi?"
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Analiz ediliyor...' : 'Analiz Et'}
      </button>
      {response && <p style={{ marginTop: '15px' }}>{response}</p>}
    </div>
  );
};

export default AiInsights;