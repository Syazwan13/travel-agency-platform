import React from 'react';

const ReviewStep = ({ formData }) => {
  const { packageInfo, travelDetails, specialRequirements, contactPreferences } = formData;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatRoomType = (roomType) => {
    const types = {
      'single': 'Single Room',
      'double': 'Double Room',
      'twin': 'Twin Room',
      'family': 'Family Room',
      'suite': 'Suite',
      'any': 'Any Room Type'
    };
    return types[roomType] || roomType;
  };

  const formatBedType = (bedType) => {
    const types = {
      'king': 'King Bed',
      'queen': 'Queen Bed',
      'twin': 'Twin Beds',
      'any': 'Any Bed Type'
    };
    return types[bedType] || bedType;
  };

  const formatViewType = (viewType) => {
    const types = {
      'sea': 'Sea View',
      'garden': 'Garden View',
      'city': 'City View',
      'any': 'Any View'
    };
    return types[viewType] || viewType;
  };

  const formatContactMethod = (method) => {
    const methods = {
      'whatsapp': '💬 WhatsApp',
      'email': '📧 Email',
      'phone': '📞 Phone Call'
    };
    return methods[method] || method;
  };

  const formatContactTime = (time) => {
    const times = {
      'anytime': 'Anytime',
      'morning': 'Morning (9 AM - 12 PM)',
      'afternoon': 'Afternoon (12 PM - 6 PM)',
      'evening': 'Evening (6 PM - 9 PM)'
    };
    return times[time] || time;
  };

  const formatUrgency = (urgency) => {
    const levels = {
      'low': 'Just Browsing',
      'medium': 'Planning Ahead',
      'high': 'Urgent'
    };
    return levels[urgency] || urgency;
  };

  const totalGuests = (travelDetails.groupInfo.adults || 0) + 
                     (travelDetails.groupInfo.children || 0) + 
                     (travelDetails.groupInfo.infants || 0);

  const groupString = [
    travelDetails.groupInfo.adults > 0 ? `${travelDetails.groupInfo.adults} Adult${travelDetails.groupInfo.adults > 1 ? 's' : ''}` : '',
    travelDetails.groupInfo.children > 0 ? `${travelDetails.groupInfo.children} Child${travelDetails.groupInfo.children > 1 ? 'ren' : ''}` : '',
    travelDetails.groupInfo.infants > 0 ? `${travelDetails.groupInfo.infants} Infant${travelDetails.groupInfo.infants > 1 ? 's' : ''}` : ''
  ].filter(Boolean).join(', ');

  return (
    <div className="form-step">
      <h3>📋 Review Your Inquiry</h3>
      
      <div className="review-section">
        <h4>🏖️ Package Details</h4>
        <div className="review-item">
          <strong>{packageInfo.packageTitle}</strong>
          <div>Destination: {packageInfo.packageDestination || 'As specified'}</div>
          <div>Duration: {packageInfo.packageDuration || 'As specified'}</div>
          <div>Listed Price: {packageInfo.packagePrice || 'Please quote'}</div>
        </div>
      </div>

      <div className="review-section">
        <h4>📅 Travel Details</h4>
        <div className="review-item">
          <div><strong>Dates:</strong> {formatDate(travelDetails.preferredDates.startDate)} - {formatDate(travelDetails.preferredDates.endDate)}</div>
          {travelDetails.preferredDates.isFlexible && (
            <div><strong>Flexibility:</strong> ±{travelDetails.preferredDates.flexibilityDays} days</div>
          )}
          <div><strong>Group Size:</strong> {groupString} ({totalGuests} total)</div>
        </div>
      </div>

      <div className="review-section">
        <h4>🏨 Accommodation Preferences</h4>
        <div className="review-item">
          <div><strong>Room Type:</strong> {formatRoomType(travelDetails.accommodationPreferences.roomType)}</div>
          <div><strong>Rooms Needed:</strong> {travelDetails.accommodationPreferences.roomCount}</div>
          <div><strong>Bed Preference:</strong> {formatBedType(travelDetails.accommodationPreferences.bedPreference)}</div>
          <div><strong>View Preference:</strong> {formatViewType(travelDetails.accommodationPreferences.viewPreference)}</div>
        </div>
      </div>

      {(specialRequirements.dietaryRestrictions?.length > 0 || 
        specialRequirements.celebrationOccasion || 
        specialRequirements.budgetRange?.min || 
        specialRequirements.customRequests) && (
        <div className="review-section">
          <h4>✨ Special Requirements</h4>
          <div className="review-item">
            {specialRequirements.dietaryRestrictions?.length > 0 && (
              <div><strong>Dietary:</strong> {specialRequirements.dietaryRestrictions.join(', ')}</div>
            )}
            {specialRequirements.celebrationOccasion && (
              <div><strong>Special Occasion:</strong> {specialRequirements.celebrationOccasion}</div>
            )}
            {specialRequirements.budgetRange?.min && (
              <div>
                <strong>Budget Range:</strong> MYR {specialRequirements.budgetRange.min}
                {specialRequirements.budgetRange.max ? ` - ${specialRequirements.budgetRange.max}` : '+'}
              </div>
            )}
            {specialRequirements.customRequests && (
              <div><strong>Additional Requests:</strong> {specialRequirements.customRequests}</div>
            )}
          </div>
        </div>
      )}

      <div className="review-section">
        <h4>📞 Contact Preferences</h4>
        <div className="review-item">
          <div><strong>Preferred Method:</strong> {formatContactMethod(contactPreferences.preferredContactMethod)}</div>
          <div><strong>Best Time:</strong> {formatContactTime(contactPreferences.preferredContactTime)}</div>
          <div><strong>Urgency:</strong> {formatUrgency(contactPreferences.urgency)}</div>
        </div>
      </div>

      <div className="review-agreement">
        <div className="checkbox-item">
          <input type="checkbox" id="agreement" required />
          <label htmlFor="agreement">
            I agree to share my contact information with the travel provider for this inquiry
          </label>
        </div>
      </div>

      <style jsx>{`
        .review-section {
          margin-bottom: 24px;
          padding: 16px;
          background-color: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .review-section h4 {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }
        
        .review-item {
          color: #6b7280;
          line-height: 1.5;
        }
        
        .review-item div {
          margin-bottom: 4px;
        }
        
        .review-item strong {
          color: #374151;
        }
        
        .review-agreement {
          margin-top: 24px;
          padding: 16px;
          background-color: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
        }
        
        .review-agreement .checkbox-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        
        .review-agreement input {
          margin-top: 2px;
        }
        
        .review-agreement label {
          font-size: 0.9rem;
          color: #92400e;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default ReviewStep;
