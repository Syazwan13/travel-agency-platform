import React from 'react';

const SpecialRequirementsStep = ({ formData, updateFormData, errors }) => {
  const { specialRequirements } = formData;

  const handleDietaryChange = (restriction, checked) => {
    const current = specialRequirements.dietaryRestrictions || [];
    let updated;
    
    if (checked) {
      updated = [...current, restriction];
    } else {
      updated = current.filter(item => item !== restriction);
    }
    
    updateFormData('specialRequirements', {
      ...specialRequirements,
      dietaryRestrictions: updated
    });
  };

  const handleBudgetChange = (field, value) => {
    updateFormData('specialRequirements', {
      ...specialRequirements,
      budgetRange: {
        ...specialRequirements.budgetRange,
        [field]: value
      }
    });
  };

  const handleFieldChange = (field, value) => {
    updateFormData('specialRequirements', {
      ...specialRequirements,
      [field]: value
    });
  };

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Halal',
    'No Pork',
    'No Beef',
    'Gluten-Free',
    'Dairy-Free',
    'Nut Allergy'
  ];

  const occasionOptions = [
    { value: '', label: 'None' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'honeymoon', label: 'Honeymoon' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'family_reunion', label: 'Family Reunion' },
    { value: 'other', label: 'Other Celebration' }
  ];

  return (
    <div className="form-step">
      <h3>✨ Special Requirements</h3>
      
      <div className="form-group">
        <label>🍽️ Dietary Requirements</label>
        <div className="checkbox-group">
          {dietaryOptions.map(option => (
            <div key={option} className="checkbox-item">
              <input
                type="checkbox"
                id={`dietary-${option}`}
                checked={(specialRequirements.dietaryRestrictions || []).includes(option)}
                onChange={(e) => handleDietaryChange(option, e.target.checked)}
              />
              <label htmlFor={`dietary-${option}`}>{option}</label>
            </div>
          ))}
        </div>
        <div className="help-text">
          Select any dietary restrictions or preferences that apply to your group.
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="celebrationOccasion">🎉 Special Occasion</label>
        <select
          id="celebrationOccasion"
          value={specialRequirements.celebrationOccasion || ''}
          onChange={(e) => handleFieldChange('celebrationOccasion', e.target.value)}
        >
          {occasionOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="help-text">
          Let us know if you're celebrating something special - providers may offer complimentary services!
        </div>
      </div>

      <div className="form-group">
        <label>💰 Budget Range (Optional)</label>
        <div className="form-row">
          <div>
            <label htmlFor="budgetMin">Minimum (MYR)</label>
            <input
              type="number"
              id="budgetMin"
              placeholder="e.g. 400"
              value={specialRequirements.budgetRange?.min || ''}
              onChange={(e) => handleBudgetChange('min', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="budgetMax">Maximum (MYR)</label>
            <input
              type="number"
              id="budgetMax"
              placeholder="e.g. 800"
              value={specialRequirements.budgetRange?.max || ''}
              onChange={(e) => handleBudgetChange('max', e.target.value)}
            />
            {errors.budgetMax && <div className="error-message">{errors.budgetMax}</div>}
          </div>
        </div>
        <div className="help-text">
          Providing a budget range helps providers suggest the most suitable options for you.
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="customRequests">📝 Additional Requests</label>
        <textarea
          id="customRequests"
          placeholder="Any other special requests or requirements? (e.g., airport transfer, early check-in, ground floor room, etc.)"
          value={specialRequirements.customRequests || ''}
          onChange={(e) => handleFieldChange('customRequests', e.target.value)}
          rows="4"
        />
        <div className="help-text">
          Feel free to mention any other preferences or requirements you have.
        </div>
      </div>

      {/* Summary Section */}
      {(specialRequirements.dietaryRestrictions?.length > 0 || 
        specialRequirements.celebrationOccasion || 
        specialRequirements.budgetRange?.min || 
        specialRequirements.customRequests) && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e40af' }}>📋 Your Special Requirements</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
            {specialRequirements.dietaryRestrictions?.length > 0 && (
              <li>Dietary: {specialRequirements.dietaryRestrictions.join(', ')}</li>
            )}
            {specialRequirements.celebrationOccasion && (
              <li>Occasion: {occasionOptions.find(opt => opt.value === specialRequirements.celebrationOccasion)?.label}</li>
            )}
            {specialRequirements.budgetRange?.min && (
              <li>
                Budget: MYR {specialRequirements.budgetRange.min}
                {specialRequirements.budgetRange.max ? ` - ${specialRequirements.budgetRange.max}` : '+'}
              </li>
            )}
            {specialRequirements.customRequests && (
              <li>Additional requests provided</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SpecialRequirementsStep;
