import React from 'react';
import spaceBg from '../assets/space-bg.png';
import spiralGalaxy from '../assets/spiral-galaxy.png'; // Yeni hero görselin
import blackHole from '../assets/black-hole.png';
import nebulaImg from '../assets/nebula.png';

export default function DashboardLayout({ children }) {
  const decorations = [
    // Hero Görsel: Ekranın sağ üstüne yakın, biraz daha belirgin
    { src: spiralGalaxy, top: '15%', left: '70%', width: '350px', opacity: 0.5, blur: '0px' },
    
    // Atmosferik Destekler: Daha soluk ve farklı boyutlarda
    { src: nebulaImg, top: '5%', left: '10%', width: '250px', opacity: 0.2, blur: '1px' },
    { src: blackHole, top: '60%', left: '5%', width: '120px', opacity: 0.2, blur: '1px' },
    { src: nebulaImg, top: '75%', left: '80%', width: '200px', opacity: 0.15, blur: '2px' },
  ];

  return (
    <div className="dash-root" style={{
      backgroundImage: `url(${spaceBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Karanlık katman - Görsellerin parlamasını yumuşatır */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(5, 5, 10, 0.75)', zIndex: 0
      }} />

      {/* Görsel Dağılımı */}
      {decorations.map((deco, index) => (
        <img 
          key={index}
          src={deco.src} 
          alt="Space Decor" 
          style={{ 
            position: 'fixed', 
            top: deco.top, 
            left: deco.left, 
            width: deco.width, 
            opacity: deco.opacity, 
            zIndex: 0, 
            pointerEvents: 'none',
            filter: `blur(${deco.blur})`, // Derinlik için odaklanma farkı
            transition: 'all 0.5s ease-in-out'
          }} 
        />
      ))}

      <div className="content" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}