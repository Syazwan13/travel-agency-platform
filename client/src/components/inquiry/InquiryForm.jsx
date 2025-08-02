import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import TravelDetailsStep from './TravelDetailsStep';
import AccommodationStep from './AccommodationStep';
import SpecialRequirementsStep from './SpecialRequirementsStep';
import ContactPreferencesStep from './ContactPreferencesStep';
import ReviewStep from './ReviewStep';
import FormProgress from './FormProgress';
import './InquiryForm.css';
import WhatsAppSuccessModal from './WhatsAppSuccessModal';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const InquiryForm = ({ packageData, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [inquiryData, setInquiryData] = useState(null);

  // Debug: Log package data
  console.log('InquiryForm received packageData:', packageData);

  // Generate a fallback ID if none exists
  const packageId = packageData._id || packageData.id || `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced provider name mapping to handle all variants
  const mapProviderName = (provider) => {
    if (!provider) return 'Package';
    const normalized = provider.toLowerCase().replace(/\s+/g, '');
    if ([
      'amitravel', 'amitraveltours', 'amitraveltourssdnbhd', 'amit', 'amittravel', 'amittravels', 'amittravelsdnbhd'
    ].includes(normalized)) return 'AmiTravel';
    if ([
      'holidaygogo', 'holidaygogogo', 'holidaygogotravelagency', 'holidaygogotravel', 'holidaygogosdnbhd', 'holidaygogoagency'
    ].includes(normalized)) return 'HolidayGoGo';
    if ([
      'pulaumalaysia', 'pulau malaysia', 'pulau-malaysia'
    ].includes(normalized)) return 'PulauMalaysia';
    return 'Package';
  };

  const [formData, setFormData] = useState({
    packageInfo: {
      packageId: packageId,
      packageSource: mapProviderName(packageData.source || packageData.provider || 'Package'),
      packageTitle: packageData.title || 'Travel Package',
      packagePrice: packageData.price || 'Price on request',
      packageDestination: packageData.destination || '',
      packageDuration: packageData.duration || '',
      packageLink: packageData.link || ''
    },
    travelDetails: {
      preferredDates: {
        startDate: '',
        endDate: '',
        isFlexible: false,
        flexibilityDays: 0
      },
      groupInfo: {
        adults: 2,
        children: 0,
        infants: 0
      },
      accommodationPreferences: {
        roomType: 'any',
        roomCount: 1,
        bedPreference: 'any',
        viewPreference: 'any'
      }
    },
    specialRequirements: {
      dietaryRestrictions: [],
      celebrationOccasion: '',
      budgetRange: {
        min: '',
        max: '',
        currency: 'MYR'
      },
      customRequests: ''
    },
    contactPreferences: {
      preferredContactMethod: 'whatsapp',
      preferredContactTime: 'anytime',
      urgency: 'medium'
    }
  });

  const steps = [
    { id: 1, title: 'Travel Details', component: TravelDetailsStep },
    { id: 2, title: 'Accommodation', component: AccommodationStep },
    { id: 3, title: 'Special Requirements', component: SpecialRequirementsStep },
    { id: 4, title: 'Contact Preferences', component: ContactPreferencesStep },
    { id: 5, title: 'Review & Submit', component: ReviewStep }
  ];

  // Auto-save form data to localStorage and clear errors on form open
  useEffect(() => {
    // Clear any existing errors when form opens
    setErrors({});

    const savedData = localStorage.getItem(`inquiry-form-${packageData._id || packageData.id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [packageData]);

  useEffect(() => {
    localStorage.setItem(`inquiry-form-${packageData._id || packageData.id}`, JSON.stringify(formData));
  }, [formData, packageData]);

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
    setErrors(prev => ({ ...prev, [section]: {} }));
  };

  const validateStep = (stepNumber) => {
    const stepErrors = {};
    
    switch (stepNumber) {
      case 1: // Travel Details
        if (!formData.travelDetails.preferredDates.startDate) {
          stepErrors.startDate = 'Start date is required';
        }
        if (!formData.travelDetails.preferredDates.endDate) {
          stepErrors.endDate = 'End date is required';
        }
        if (formData.travelDetails.preferredDates.startDate && formData.travelDetails.preferredDates.endDate) {
          if (new Date(formData.travelDetails.preferredDates.endDate) <= new Date(formData.travelDetails.preferredDates.startDate)) {
            stepErrors.endDate = 'End date must be after start date';
          }
        }
        if (formData.travelDetails.groupInfo.adults < 1) {
          stepErrors.adults = 'At least 1 adult is required';
        }
        break;
      
      case 2: // Accommodation
        if (formData.travelDetails.accommodationPreferences.roomCount < 1) {
          stepErrors.roomCount = 'At least 1 room is required';
        }
        break;
      
      case 3: // Special Requirements
        if (formData.specialRequirements.budgetRange.min && formData.specialRequirements.budgetRange.max) {
          if (parseFloat(formData.specialRequirements.budgetRange.min) > parseFloat(formData.specialRequirements.budgetRange.max)) {
            stepErrors.budgetMax = 'Maximum budget must be greater than minimum';
          }
        }
        break;
    }

    setErrors(prev => ({ ...prev, [`step${stepNumber}`]: stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Log the mapped provider name for debugging
    console.log('Submitting with mapped packageSource:', mapProviderName(formData.packageInfo.packageSource));
    // Submit the inquiry and handle response
    const response = await submitInquiry();
    if (response.success) {
        // Open WhatsApp Success Modal with inquiry data
        setInquiryData(response.data);
        setShowWhatsAppModal(true);
    } else {
        alert('Error submitting inquiry. Please try again.');
    }
  };

  const submitInquiry = async () => {
    // Validate all steps before submitting
    let allValid = true;
    for (let i = 1; i <= steps.length - 1; i++) { // Exclude review step
      if (!validateStep(i)) {
        allValid = false;
      }
    }

    if (!allValid) {
      setErrors({ submit: 'Please fill in all required fields before submitting.' });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting inquiry for:', formData.packageInfo.packageTitle);

      const response = await axios.post(`${API_URL}/api/inquiries`, formData, {
        withCredentials: true
      });

      console.log('✅ Inquiry submission successful!');
      console.log('InquiryForm - Response summary:', {
        success: response.data.success,
        hasProviderContact: !!response.data.providerContact,
        packageSource: response.data.data?.packageInfo?.packageSource
      });

      // Clear saved form data
      localStorage.removeItem(`inquiry-form-${packageData._id || packageData.id}`);

      if (onSuccess) {
        console.log('Calling onSuccess with:', response.data);
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to submit inquiry' });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="inquiry-form-overlay">
      <div className="inquiry-form-modal">
        <div className="inquiry-form-header">
          <h2>Travel Inquiry</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="inquiry-form-content">
          <FormProgress currentStep={currentStep} totalSteps={steps.length} steps={steps} />
          
          <div className="package-summary">
            <h3>{packageData.title}</h3>
            <p>{packageData.destination} • {packageData.duration} • {packageData.price}</p>
          </div>

          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            errors={errors[`step${currentStep}`] || {}}
          />

          <div className="inquiry-form-actions">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handlePrevious}
              >
                ← Previous
              </button>
            )}
            
            {currentStep < steps.length ? (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleNext}
              >
                Next →
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            )}
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}
        </div>
      </div>
      {showWhatsAppModal && (
        <WhatsAppSuccessModal
          inquiryData={inquiryData}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}
    </div>
  );
};

export default InquiryForm;
