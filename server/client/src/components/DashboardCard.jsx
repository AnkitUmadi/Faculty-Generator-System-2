import React from 'react';

const DashboardCard = ({ title, description, buttonText, onClick }) => {
  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h3 style={{
        margin: 0,
        fontSize: '20px',
        color: '#333',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      
      <p style={{
        margin: 0,
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.5'
      }}>
        {description}
      </p>
      
      <button
        onClick={onClick}
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default DashboardCard;