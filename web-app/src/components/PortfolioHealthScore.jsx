import React, { useEffect, useState } from 'react';
import { getPortfolioHealthScore } from '../services/api';

const getScoreColor = (score) => {
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const PortfolioHealthScore = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getPortfolioHealthScore()
      .then((res) => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

if (error) return null;

if (loading) {
  return (
    <div className="health-score-badge-wrap health-score-loading">
      <div className="health-score-badge health-score-badge-pulse">
        <div className="health-score-spinner" />
      </div>
      <span className="health-score-badge-label">Hesaplanıyor...</span>
    </div>
  );
}

if (!data) return null;

  const color = getScoreColor(data.score);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <>
    <button
    className="health-score-badge-wrap"
    onClick={() => setIsModalOpen(true)}
    title="Portföy Sağlık Skoru"
    >
    <div className="health-score-badge" style={{ borderColor: color, color }}>
        {data.score}
    </div>
    <span className="health-score-badge-label">Sağlık Skoru</span>
    </button>

      {isModalOpen && (
        <div className="trade-modal-overlay health-score-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="trade-modal health-score-modal-solid" onClick={(e) => e.stopPropagation()}>
            <div className="trade-modal-header">
              <h3>🏆 Portföy Sağlık Skoru</h3>
              <button className="trade-modal-close" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="trade-modal-body">
              <div className="health-score-gauge-wrap">
                <svg width="110" height="110" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="57" textAnchor="middle" fontSize="26" fontWeight="800" fill={color}>
                    {data.score}
                  </text>
                </svg>
              </div>

              <p className="health-score-summary">{data.summary}</p>

              {data.strengths?.length > 0 && (
                <div className="health-score-list positive">
                  {data.strengths.map((s, i) => (
                    <div key={i}>✓ {s}</div>
                  ))}
                </div>
              )}

              {data.risks?.length > 0 && (
                <div className="health-score-list negative">
                  {data.risks.map((r, i) => (
                    <div key={i}>⚠ {r}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioHealthScore;