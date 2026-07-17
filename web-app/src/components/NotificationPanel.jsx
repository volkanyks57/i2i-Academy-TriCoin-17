import React, { useState, useEffect } from 'react';
import { getTriggeredAlerts, dismissAlert } from '../services/api';

const NotificationPanel = () => {
    const [alerts, setAlerts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchAlerts = async () => {
        try {
            const response = await getTriggeredAlerts();
            setAlerts(response.data || []);
        } catch (error) {
            console.error("Bildirimler alınamadı:", error);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // 30 saniyede bir kontrol et
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = async (id) => {
        await dismissAlert(id);
        fetchAlerts(); // Listeyi güncelle
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Bildirim Zili */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px',
                fontSize: '1rem',
            }}
        >
                🔔
                {alerts.length > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4466', borderRadius: '50%', width: '15px', height: '15px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {alerts.length}
                    </span>
                )}
            </button>

            {/* Bildirim Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '40px', right: '0', width: '300px',
                    background: '#1a1a24', border: '1px solid #333', borderRadius: '10px',
                    padding: '10px', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Alarmlar</h4>
                    {alerts.length === 0 ? <p style={{ color: '#888' }}>Yeni bildirim yok.</p> : (
                        alerts.map((alert) => {
                            console.log("Gelen Tüm Alarm Verisi:", alert);

                            const coinName = alert.coin || alert.symbol || "Bilinmeyen";
                            const target = parseFloat(alert.targetPrice || alert.target || alert.price || 0);
                            const current = parseFloat(
                                alert.currentPrice ||
                                alert.price ||
                                alert.lastPrice ||
                                alert.current ||
                                alert.value ||
                                0);
                            const direction = alert.direction || (target > current ? 'UP' : 'DOWN');

                            return (
                                <div key={alert.id} style={{ borderBottom: '1px solid #333', padding: '12px 0', fontSize: '0.85rem', color: '#fff', display: 'flex', flexDirection: 'column', gap: '5px' }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>{coinName}</span>
                                        <span style={{ color: direction === 'UP' ? '#00ffcc' : '#ff4466' }}>
                                            {direction === 'UP' ? '▲ Yükseliş' : '▼ Düşüş'}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                        Hedef: <span style={{ color: '#fff' }}>{isNaN(target) ? '-' : `$${target.toLocaleString()}`}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                        Anlık: <span style={{ color: '#fff' }}>{isNaN(current) ? '-' : `$${current.toLocaleString()}`}</span>
                                    </div>

                                    <button onClick={() => handleDismiss(alert.id)} style={{ background: 'transparent', border: '1px solid #ff4466', color: '#ff4466', padding: '4px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>
                                        Kapat
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;