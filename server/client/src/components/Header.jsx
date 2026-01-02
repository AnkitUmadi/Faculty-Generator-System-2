import React from 'react';
import logo from '../assets/faculty-logo.png'; // ✅ relative path

const Header = () => {
  return (
    <header
      style={{
        backgroundColor: '#fff',
        padding: '16px 40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <img
        src={logo}
        alt="Faculty Management Timetable"
        style={{ height: '48px', objectFit: 'contain' }}
      />

      <div>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
          Faculty Management
        </h1>
        <p style={{ margin: 0, fontSize: '12px', letterSpacing: '1px' }}>
          TIMETABLE SYSTEM
        </p>
      </div>
    </header>
  );
};

export default Header;
