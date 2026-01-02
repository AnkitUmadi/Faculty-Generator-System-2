import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const Settings = () => {
  const [settings, setSettings] = useState({
    workingHours: {
      startTime: '9:00 AM',
      endTime: '5:00 PM'
    },
    periodDuration: 60,
    numberOfPeriods: 5,
    breakTimes: [
      {
        name: 'Lunch Break',
        startTime: '1:00 PM',
        endTime: '2:00 PM',
        enabled: true
      },
      {
        name: 'Short Break',
        startTime: '11:00 AM',
        endTime: '11:15 AM',
        enabled: false
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        setOriginalSettings(JSON.parse(JSON.stringify(data.data))); // Deep clone
        console.log('✅ Settings loaded:', data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      alert('Failed to load settings');
    }
  };

  const handleWorkingHoursChange = (field, value) => {
    setSettings({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        [field]: value
      }
    });
  };

  const handlePeriodDurationChange = (value) => {
    const duration = parseInt(value);
    if (duration >= 30 && duration <= 120) {
      setSettings({
        ...settings,
        periodDuration: duration
      });
    }
  };

  const handleNumberOfPeriodsChange = (value) => {
    const numPeriods = parseInt(value);
    if (numPeriods >= 1 && numPeriods <= 9) {
      setSettings({
        ...settings,
        numberOfPeriods: numPeriods
      });
    }
  };

  const handleBreakTimeToggle = (index) => {
    const newBreakTimes = [...settings.breakTimes];
    newBreakTimes[index].enabled = !newBreakTimes[index].enabled;
    setSettings({
      ...settings,
      breakTimes: newBreakTimes
    });
  };

  const handleBreakTimeChange = (index, field, value) => {
    const newBreakTimes = [...settings.breakTimes];
    newBreakTimes[index][field] = value;
    setSettings({
      ...settings,
      breakTimes: newBreakTimes
    });
  };

  const handleSave = async () => {
    // Validation
    if (!settings.workingHours.startTime || !settings.workingHours.endTime) {
      alert('❌ Please fill in both start and end times');
      return;
    }

    if (settings.periodDuration < 30 || settings.periodDuration > 120) {
      alert('❌ Period duration must be between 30 and 120 minutes');
      return;
    }

    if (settings.numberOfPeriods < 1 || settings.numberOfPeriods > 9) {
      alert('❌ Number of periods must be between 1 and 9');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Settings saved successfully!');
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        console.log('✅ Settings saved:', data.data);
      } else {
        alert('❌ Error: ' + (data.message || 'Failed to save settings'));
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      alert('Server error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (originalSettings) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
      alert('Changes cancelled');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      
      <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', color: '#333' }}>
          Settings
        </h1>

        {/* WORKING HOURS */}
        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            marginBottom: '20px', 
            color: '#555',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            Working Hours
          </h2>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#666',
                fontWeight: '500'
              }}>
                Start Time
              </label>
              <input
                type="text"
                value={settings.workingHours.startTime}
                onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
                placeholder="e.g., 9:00 AM"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#666',
                fontWeight: '500'
              }}>
                End Time
              </label>
              <input
                type="text"
                value={settings.workingHours.endTime}
                onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
                placeholder="e.g., 5:00 PM"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* PERIOD DURATION */}
        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            marginBottom: '20px', 
            color: '#555',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            Period Configuration
          </h2>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#666',
                fontWeight: '500'
              }}>
                Minutes per period
              </label>
              <input
                type="number"
                min="30"
                max="120"
                value={settings.periodDuration}
                onChange={(e) => handlePeriodDurationChange(e.target.value)}
                placeholder="60 minutes"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <p style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#666' 
              }}>
                Duration must be between 30 and 120 minutes
              </p>
            </div>

            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#666',
                fontWeight: '500'
              }}>
                Number of periods
              </label>
              <input
                type="number"
                min="1"
                max="9"
                value={settings.numberOfPeriods}
                onChange={(e) => handleNumberOfPeriodsChange(e.target.value)}
                placeholder="5"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <p style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#666' 
              }}>
                Number of periods per day (1-9)
              </p>
            </div>
          </div>
        </div>

        {/* BREAK TIMES */}
        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            marginBottom: '20px', 
            color: '#555',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            Break Times
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {settings.breakTimes.map((breakTime, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  backgroundColor: breakTime.enabled ? '#fff' : '#f9f9f9'
                }}
              >
                <input
                  type="checkbox"
                  checked={breakTime.enabled}
                  onChange={() => handleBreakTimeToggle(index)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: breakTime.enabled ? '#333' : '#999'
                  }}>
                    {breakTime.name}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={breakTime.startTime}
                      onChange={(e) => handleBreakTimeChange(index, 'startTime', e.target.value)}
                      disabled={!breakTime.enabled}
                      placeholder="Start time"
                      style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '13px',
                        minWidth: '120px',
                        backgroundColor: breakTime.enabled ? '#fff' : '#f0f0f0',
                        color: breakTime.enabled ? '#333' : '#999'
                      }}
                    />
                    
                    <span style={{ 
                      alignSelf: 'center', 
                      color: '#999',
                      fontSize: '14px'
                    }}>
                      -
                    </span>
                    
                    <input
                      type="text"
                      value={breakTime.endTime}
                      onChange={(e) => handleBreakTimeChange(index, 'endTime', e.target.value)}
                      disabled={!breakTime.enabled}
                      placeholder="End time"
                      style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '13px',
                        minWidth: '120px',
                        backgroundColor: breakTime.enabled ? '#fff' : '#f0f0f0',
                        color: breakTime.enabled ? '#333' : '#999'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'flex-end',
          marginTop: '32px'
        }}>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '12px 32px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '12px 32px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;