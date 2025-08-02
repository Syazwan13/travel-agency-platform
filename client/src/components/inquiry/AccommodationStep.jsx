import React from 'react';

const AccommodationStep = ({ formData, updateFormData, errors }) => {
  const { travelDetails } = formData;
  const { accommodationPreferences } = travelDetails;

  const handleAccommodationChange = (field, value) => {
    updateFormData('travelDetails', {
      ...travelDetails,
      accommodationPreferences: {
        ...accommodationPreferences,
        [field]: value
      }
    });
  };

  const adjustRoomCount = (delta) => {
    const currentCount = accommodationPreferences.roomCount || 1;
    const newCount = Math.max(1, Math.min(10, currentCount + delta));
    handleAccommodationChange('roomCount', newCount);
  };

  // Suggest room count based on group size
  const suggestedRooms = Math.ceil((travelDetails.groupInfo.adults || 2) / 2);

  return (
    <div className="form-step">
      <h3>🏨 Accommodation Preferences</h3>
      
      <div className="help-text" style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
        💡 <strong>Why we ask:</strong> Since package details vary, your preferences help providers give you the most accurate quote and room options.
      </div>

      <div className="form-group">
        <label htmlFor="roomType">🛏️ Room Type Preference</label>
        <select
          id="roomType"
          value={accommodationPreferences.roomType}
          onChange={(e) => handleAccommodationChange('roomType', e.target.value)}
        >
          <option value="any">Any Room Type</option>
          <option value="single">Single Room</option>
          <option value="double">Double Room</option>
          <option value="twin">Twin Room</option>
          <option value="family">Family Room</option>
          <option value="suite">Suite</option>
        </select>
        <div className="help-text">
          {accommodationPreferences.roomType === 'single' && 'One bed for single occupancy'}
          {accommodationPreferences.roomType === 'double' && 'One large bed for two people'}
          {accommodationPreferences.roomType === 'twin' && 'Two separate beds'}
          {accommodationPreferences.roomType === 'family' && 'Larger room suitable for families'}
          {accommodationPreferences.roomType === 'suite' && 'Premium room with separate living area'}
          {accommodationPreferences.roomType === 'any' && 'Provider will suggest best available options'}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="roomCount">🚪 Number of Rooms</label>
        <div className="number-input-group">
          <button 
            type="button" 
            onClick={() => adjustRoomCount(-1)}
            disabled={accommodationPreferences.roomCount <= 1}
          >
            -
          </button>
          <input
            type="number"
            id="roomCount"
            value={accommodationPreferences.roomCount}
            min="1"
            max="10"
            onChange={(e) => handleAccommodationChange('roomCount', parseInt(e.target.value) || 1)}
          />
          <button 
            type="button" 
            onClick={() => adjustRoomCount(1)}
            disabled={accommodationPreferences.roomCount >= 10}
          >
            +
          </button>
        </div>
        {suggestedRooms !== accommodationPreferences.roomCount && (
          <div className="help-text">
            💡 Suggested: {suggestedRooms} room{suggestedRooms > 1 ? 's' : ''} for {travelDetails.groupInfo.adults} adult{travelDetails.groupInfo.adults > 1 ? 's' : ''}
          </div>
        )}
        {errors.roomCount && <div className="error-message">{errors.roomCount}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="bedPreference">🛌 Bed Preference</label>
        <select
          id="bedPreference"
          value={accommodationPreferences.bedPreference}
          onChange={(e) => handleAccommodationChange('bedPreference', e.target.value)}
        >
          <option value="any">Any Bed Type</option>
          <option value="king">King Bed</option>
          <option value="queen">Queen Bed</option>
          <option value="twin">Twin Beds</option>
        </select>
        <div className="help-text">
          {accommodationPreferences.bedPreference === 'king' && 'Largest bed size available'}
          {accommodationPreferences.bedPreference === 'queen' && 'Standard double bed'}
          {accommodationPreferences.bedPreference === 'twin' && 'Two separate single beds'}
          {accommodationPreferences.bedPreference === 'any' && 'Provider will assign based on availability'}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="viewPreference">🌊 View Preference (if available)</label>
        <select
          id="viewPreference"
          value={accommodationPreferences.viewPreference}
          onChange={(e) => handleAccommodationChange('viewPreference', e.target.value)}
        >
          <option value="any">Any View</option>
          <option value="sea">Sea View</option>
          <option value="garden">Garden View</option>
          <option value="city">City View</option>
        </select>
        <div className="help-text">
          View preferences may affect pricing. Select "Any View" for best rates.
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#374151' }}>📋 Your Accommodation Summary</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
          <li>{accommodationPreferences.roomCount} {accommodationPreferences.roomType === 'any' ? 'room' : accommodationPreferences.roomType}{accommodationPreferences.roomCount > 1 ? 's' : ''}</li>
          <li>{accommodationPreferences.bedPreference === 'any' ? 'Any bed type' : accommodationPreferences.bedPreference}</li>
          <li>{accommodationPreferences.viewPreference === 'any' ? 'Any view' : accommodationPreferences.viewPreference}</li>
          <li>For {(travelDetails.groupInfo.adults || 0) + (travelDetails.groupInfo.children || 0)} guests</li>
        </ul>
      </div>
    </div>
  );
};

export default AccommodationStep;
