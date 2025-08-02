import React from 'react';

const ContactPreferencesStep = ({ formData, updateFormData, errors }) => {
  const { contactPreferences } = formData;

  const handleContactChange = (field, value) => {
    updateFormData('contactPreferences', {
      ...contactPreferences,
      [field]: value
    });
  };

  const contactMethods = [
    { 
      value: 'whatsapp', 
      label: 'WhatsApp', 
      icon: '💬',
      description: 'Quick and convenient messaging'
    },
    { 
      value: 'email', 
      label: 'Email', 
      icon: '📧',
      description: 'Detailed written communication'
    },
    { 
      value: 'phone', 
      label: 'Phone Call', 
      icon: '📞',
      description: 'Direct voice conversation'
    }
  ];

  const contactTimes = [
    { value: 'anytime', label: 'Anytime', description: 'I\'m flexible with timing' },
    { value: 'morning', label: 'Morning (9 AM - 12 PM)', description: 'Best time for me' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)', description: 'Preferred time slot' },
    { value: 'evening', label: 'Evening (6 PM - 9 PM)', description: 'After work hours' }
  ];

  const urgencyLevels = [
    { 
      value: 'low', 
      label: 'Just Browsing', 
      description: 'No rush, exploring options',
      color: '#10b981'
    },
    { 
      value: 'medium', 
      label: 'Planning Ahead', 
      description: 'Looking to book within a few weeks',
      color: '#f59e0b'
    },
    { 
      value: 'high', 
      label: 'Urgent', 
      description: 'Need to book soon or have specific dates',
      color: '#ef4444'
    }
  ];

  return (
    <div className="form-step">
      <h3>📞 Contact Preferences</h3>
      
      <div className="form-group">
        <label>How would you prefer to be contacted?</label>
        <div className="radio-group" style={{ flexDirection: 'column', gap: '12px' }}>
          {contactMethods.map(method => (
            <div 
              key={method.value} 
              className="radio-item" 
              style={{ 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                backgroundColor: contactPreferences.preferredContactMethod === method.value ? '#f0f9ff' : 'white',
                borderColor: contactPreferences.preferredContactMethod === method.value ? '#3b82f6' : '#d1d5db',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => handleContactChange('preferredContactMethod', method.value)}
            >
              <input
                type="radio"
                id={`contact-${method.value}`}
                name="contactMethod"
                value={method.value}
                checked={contactPreferences.preferredContactMethod === method.value}
                onChange={(e) => handleContactChange('preferredContactMethod', e.target.value)}
              />
              <div style={{ marginLeft: '8px' }}>
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  {method.icon} {method.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                  {method.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>⏰ Best time to contact you?</label>
        <div className="radio-group" style={{ flexDirection: 'column', gap: '8px' }}>
          {contactTimes.map(time => (
            <div key={time.value} className="radio-item">
              <input
                type="radio"
                id={`time-${time.value}`}
                name="contactTime"
                value={time.value}
                checked={contactPreferences.preferredContactTime === time.value}
                onChange={(e) => handleContactChange('preferredContactTime', e.target.value)}
              />
              <label htmlFor={`time-${time.value}`} style={{ marginLeft: '8px' }}>
                <div style={{ fontWeight: '500' }}>{time.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{time.description}</div>
              </label>
            </div>
          ))}
        </div>
        <div className="help-text">
          All times are in Malaysia timezone (GMT+8)
        </div>
      </div>

      <div className="form-group">
        <label>🚨 How urgent is this inquiry?</label>
        <div className="radio-group" style={{ flexDirection: 'column', gap: '12px' }}>
          {urgencyLevels.map(level => (
            <div 
              key={level.value} 
              className="radio-item" 
              style={{ 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                backgroundColor: contactPreferences.urgency === level.value ? '#f9fafb' : 'white',
                borderColor: contactPreferences.urgency === level.value ? level.color : '#d1d5db',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => handleContactChange('urgency', level.value)}
            >
              <input
                type="radio"
                id={`urgency-${level.value}`}
                name="urgency"
                value={level.value}
                checked={contactPreferences.urgency === level.value}
                onChange={(e) => handleContactChange('urgency', e.target.value)}
              />
              <div style={{ marginLeft: '8px' }}>
                <div style={{ fontWeight: '500', color: level.color }}>
                  {level.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                  {level.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#374151' }}>📋 Contact Summary</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
          <li>
            Preferred method: {contactMethods.find(m => m.value === contactPreferences.preferredContactMethod)?.icon} {contactMethods.find(m => m.value === contactPreferences.preferredContactMethod)?.label}
          </li>
          <li>
            Best time: {contactTimes.find(t => t.value === contactPreferences.preferredContactTime)?.label}
          </li>
          <li>
            Priority: {urgencyLevels.find(u => u.value === contactPreferences.urgency)?.label}
          </li>
        </ul>
        
        {contactPreferences.preferredContactMethod === 'whatsapp' && (
          <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', fontSize: '0.8rem', color: '#166534' }}>
            💡 <strong>WhatsApp selected:</strong> You'll get a pre-formatted message to send directly to the provider!
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPreferencesStep;
