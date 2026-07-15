// src/components/AiInsights.jsx
import React, { useState, useRef, useEffect } from 'react';
import { getAiInsight } from '../services/api';

const AiInsights = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever a new message arrives.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await getAiInsight(trimmed);
      const aiMessage = { role: 'assistant', text: res.data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        text: 'Üzgünüm, şu an analiz yapamıyorum.',
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`ai-panel ${isOpen ? 'ai-panel-open' : ''}`}>
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span className="ai-panel-badge">AI</span>
          <span>Analiz Asistanı</span>
        </div>
        <div className="ai-panel-actions">
          {messages.length > 0 && (
            <button
              className="ai-panel-action"
              onClick={() => setMessages([])}
              title="Sohbeti Temizle"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
              </svg>
            </button>
          )}
          <button className="ai-panel-close" onClick={onClose} title="Kapat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="ai-panel-messages">
        {messages.length === 0 && !loading && (
          <div className="ai-panel-empty">
            <p>Portföyün, işlem geçmişin veya piyasa hakkında bir şey sor.</p>
            <p className="ai-panel-hint">Örn: "BTC almak mantıklı mı?"</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`ai-message ai-message-${msg.role} ${msg.error ? 'ai-message-error' : ''}`}>
            <div className="ai-message-bubble">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="ai-message ai-message-assistant">
            <div className="ai-message-bubble ai-message-typing">
              <span className="ai-typing-dot"></span>
              <span className="ai-typing-dot"></span>
              <span className="ai-typing-dot"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-panel-input-area">
        <input
          className="ai-panel-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajını yaz..."
          disabled={loading}
        />
        <button
          className="ai-panel-send"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          title="Gönder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AiInsights;