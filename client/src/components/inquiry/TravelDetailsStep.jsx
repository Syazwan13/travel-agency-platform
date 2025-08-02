import React from 'react';

const TravelDetailsStep = ({ formData, updateFormData, errors }) => {
  const { travelDetails } = formData;

  const handleDateChange = (field, value) => {
    updateFormData('travelDetails', {
      ...travelDetails,
      preferredDates: {
        ...travelDetails.preferredDates,
        [field]: value
      }
    });
  };

  const handleGroupChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    updateFormData('travelDetails', {
      ...travelDetails,
      groupInfo: {
        ...travelDetails.groupInfo,
        [field]: numValue
      }
    });
  };

  const adjustNumber = (field, delta) => {
    const currentValue = travelDetails.groupInfo[field] || 0;
    const newValue = Math.max(0, currentValue + delta);
    if (field === 'adults') {
      handleGroupChange(field, Math.max(1, newValue));
    } else {
      handleGroupChange(field, newValue);
    }
  };

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate minimum end date (start date + 1 day)
  const minEndDate = travelDetails.preferredDates.startDate 
    ? new Date(new Date(travelDetails.preferredDates.startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : today;

  return (
    <div className="form-step">
      <h3>📅 Travel Details</h3>
      
      <div className="form-group">
        <label>When do you want to travel?</label>
        <div className="form-row">
          <div>
            <label htmlFor="startDate">Check-in Date</label>
            <input
              type="date"
              id="startDate"
              value={travelDetails.preferredDates.startDate}
              min={today}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
            {errors.startDate && <div className="error-message">{errors.startDate}</div>}
          </div>
          <div>
            <label htmlFor="endDate">Check-out Date</label>
            <input
              type="date"
              id="endDate"
              value={travelDetails.preferredDates.endDate}
              min={minEndDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
            {errors.endDate && <div className="error-message">{errors.endDate}</div>}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="isFlexible"
              checked={travelDetails.preferredDates.isFlexible}
              onChange={(e) => handleDateChange('isFlexible', e.target.checked)}
            />
            <label htmlFor="isFlexible">I'm flexible with dates</label>
          </div>
        </div>
        
        {travelDetails.preferredDates.isFlexible && (
          <div style={{ marginTop: '12px' }}>
            <label htmlFor="flexibilityDays">Flexibility (± days)</label>
            <select
              id="flexibilityDays"
              value={travelDetails.preferredDates.flexibilityDays}
              onChange={(e) => handleDateChange('flexibilityDays', parseInt(e.target.value))}
            >
              <option value={0}>Same dates only</option>
              <option value={1}>± 1 day</option>
              <option value={2}>± 2 days</option>
              <option value={3}>± 3 days</option>
              <option value={5}>± 5 days</option>
              <option value={7}>± 1 week</option>
            </select>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>👥 How many people?</label>
        <div className="form-row-3">
          <div>
            <label htmlFor="adults">Adults (18+)</label>
            <div className="number-input-group">
              <button 
                type="button" 
                onClick={() => adjustNumber('adults', -1)}
                disabled={travelDetails.groupInfo.adults <= 1}
              >
                -
              </button>
              <input
                type="number"
                id="adults"
                value={travelDetails.groupInfo.adults}
                min="1"
                max="20"
                onChange={(e) => handleGroupChange('adults', e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => adjustNumber('adults', 1)}
                disabled={travelDetails.groupInfo.adults >= 20}
              >
                +
              </button>
            </div>
            {errors.adults && <div className="error-message">{errors.adults}</div>}
          </div>
          
          <div>
            <label htmlFor="children">Children (2-17)</label>
            <div className="number-input-group">
              <button 
                type="button" 
                onClick={() => adjustNumber('children', -1)}
                disabled={travelDetails.groupInfo.children <= 0}
              >
                -
              </button>
              <input
                type="number"
                id="children"
                value={travelDetails.groupInfo.children}
                min="0"
                max="10"
                onChange={(e) => handleGroupChange('children', e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => adjustNumber('children', 1)}
                disabled={travelDetails.groupInfo.children >= 10}
              >
                +
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="infants">Infants (0-2)</label>
            <div className="number-input-group">
              <button 
                type="button" 
                onClick={() => adjustNumber('infants', -1)}
                disabled={travelDetails.groupInfo.infants <= 0}
              >
                -
              </button>
              <input
                type="number"
                id="infants"
                value={travelDetails.groupInfo.infants}
                min="0"
                max="5"
                onChange={(e) => handleGroupChange('infants', e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => adjustNumber('infants', 1)}
                disabled={travelDetails.groupInfo.infants >= 5}
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <div className="help-text">
          Total: {(travelDetails.groupInfo.adults || 0) + (travelDetails.groupInfo.children || 0) + (travelDetails.groupInfo.infants || 0)} people
        </div>
      </div>
    </div>
  );
};

export default TravelDetailsStep;
