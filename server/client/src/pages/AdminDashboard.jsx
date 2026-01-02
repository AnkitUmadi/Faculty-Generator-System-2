import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Manage Faculty',
      description: 'Add, edit, or remove faculty members',
      buttonText: 'Go to Faculty',
      onClick: () => navigate('/faculty'),
      color: '#0066cc'
    },
    {
      title: 'Generate Timetable',
      description: 'Create and view timetables for faculty',
      buttonText: 'Generate',
      onClick: () => navigate('/timetable'),
      color: '#0088ff'
    },
    {
      title: 'Settings',
      description: 'Configure application settings',
      buttonText: 'Open Settings',
      onClick: () => navigate('/settings'),
      color: '#0066cc'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />

      <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '36px',
            marginBottom: '48px',
            color: '#333',
            textAlign: 'center'
          }}
        >
          Admin Dashboard
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                  '0 6px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  marginBottom: '12px',
                  color: '#333'
                }}
              >
                {card.title}
              </h2>

              <p
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '24px',
                  lineHeight: '1.6'
                }}
              >
                {card.description}
              </p>

              <button
                onClick={card.onClick}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: card.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
