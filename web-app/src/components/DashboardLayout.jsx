import React from 'react';

export default function DashboardLayout({ children }) {
  return (
    <div className="dash-root">
      <div className="nebula-field">
        <span className="neb1" />
        <span className="neb2" />
        <span className="neb3" />
      </div>
      <div className="stars" />
      <div className="grid-overlay" />
      
      <div className="content" style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}