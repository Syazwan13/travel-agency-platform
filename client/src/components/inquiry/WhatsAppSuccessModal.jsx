import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? "http://localhost:5001" : "http://167.172.66.203:5001");

// Provider name mapping same as backend
const providerNameMap = {
  'amitravel': 'AmiTravel',
  'AmiTravel': 'AmiTravel',
  'AMI Travel': 'AmiTravel',
  'ami travel': 'AmiTravel',
  'Ami Travel': 'AmiTravel',
  'holidaygogo': 'HolidayGoGo',
  'HolidayGoGo': 'HolidayGoGo',
  'holidaygogogo': 'HolidayGoGo',
  'Holiday GoGo': 'HolidayGoGo',
  'holiday gogo': 'HolidayGoGo',
  'HolidayGoGoGo': 'HolidayGoGo',
  'pulaumalaysia': 'PulauMalaysia',
  'PulauMalaysia': 'PulauMalaysia',
  'Pulau Malaysia': 'PulauMalaysia',
  'pulau malaysia': 'PulauMalaysia',
  'Package': 'Package',
  'package': 'Package'
};

const WhatsAppSuccessModal = ({ inquiryData, onClose }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [providerContact, setProviderContact] = useState(inquiryData?.providerContact || null);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Ensure message is always a string
  const getInitialMessage = () => {
    const msg = inquiryData?.whatsappMessage;
    if (typeof msg === 'string') return msg;
    if (typeof msg === 'object' && msg !== null) return JSON.stringify(msg);
    return '';
  };

  const [message, setMessage] = useState(getInitialMessage());

  // Try to fetch provider contact if missing
  useEffect(() => {
    const fetchProviderContact = async () => {
      if (!providerContact && inquiryData?.data?.packageInfo?.packageSource && !isLoadingContact) {
        console.log('🔄 Attempting to fetch missing provider contact...');
        setIsLoadingContact(true);

        try {
          const packageSource = inquiryData.data.packageInfo.packageSource;
          
          // Apply same mapping as backend
          const mappedProviderName = providerNameMap[packageSource] || packageSource;
          console.log('Mapped provider name:', mappedProviderName);

          const response = await axios.get(`${API_URL}/api/inquiries/providers/contacts/all`);
          const contacts = response.data.data || [];
          
          // Use mapped name for lookup
          const contact = contacts.find(c => 
            c.providerName === mappedProviderName ||
            providerNameMap[c.providerName] === mappedProviderName
          );

          if (contact) {
            console.log('✅ Found provider contact via fallback:', contact);
            setProviderContact({
              whatsappNumber: contact.contactInfo.whatsappNumber,
              businessName: contact.contactInfo.businessName,
              responseTime: contact.contactInfo.responseTime
            });
          } else {
            console.log('❌ No provider contact found for:', mappedProviderName);
          }
        } catch (error) {
          console.error('Error fetching provider contact:', error);
        } finally {
          setIsLoadingContact(false);
        }
      }
    };

    fetchProviderContact();
  }, [inquiryData, providerContact, isLoadingContact, retryCount]);

  // WhatsApp utility functions
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const generateWhatsAppUrl = (phoneNumber, message) => {
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    if (isMobile()) {
      return `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
    } else {
      return `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
    }
  };

  const handleWhatsAppClick = () => {
    if (!providerContact?.whatsappNumber) {
        alert('Provider WhatsApp number is missing. Please try again.');
        return;
    }

    const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
    const url = generateWhatsAppUrl(providerContact.whatsappNumber, messageToSend);

    // Open WhatsApp
    window.open(url, '_blank');
  };

  const regenerateMessage = async () => {
    if (!inquiryData?.data?._id) {
      console.error('Cannot regenerate message: Inquiry ID missing:', inquiryData);
      alert('Error: Cannot regenerate message. Inquiry data is missing.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/inquiries/${inquiryData.data._id}/generate-message`,
        {},
        { withCredentials: true }
      );

      // Ensure the message is always a string
      const newMessage = response.data.message;
      if (typeof newMessage === 'string') {
        setMessage(newMessage);
      } else if (typeof newMessage === 'object' && newMessage !== null) {
        setMessage(JSON.stringify(newMessage));
      } else {
        setMessage('Error: Invalid message format received');
      }
    } catch (error) {
      console.error('Error regenerating message:', error);
      alert('Error regenerating message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMessage = () => {
    const messageToSend = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    navigator.clipboard.writeText(messageToSend).then(() => {
      alert('Message copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = messageToSend;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Message copied to clipboard!');
    });
  };

  const handleRetryContact = () => {
    setProviderContact(null);
    setIsLoadingContact(false);
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="inquiry-form-overlay">
      <div className="inquiry-form-modal">
        <div className="inquiry-form-header">
          <h2>✅ Inquiry Submitted Successfully!</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="inquiry-form-content">
          {/* Show submitted package details */}
          {inquiryData?.data?.packageInfo && (
            <div className="submitted-package-details" style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>🧳 Package You Submitted</h3>
              <div><strong>Title:</strong> {inquiryData.data.packageInfo.packageTitle}</div>
              <div><strong>Destination:</strong> {inquiryData.data.packageInfo.packageDestination}</div>
              <div><strong>Price:</strong> {inquiryData.data.packageInfo.packagePrice}</div>
              <div><strong>Duration:</strong> {inquiryData.data.packageInfo.packageDuration}</div>
            </div>
          )}
          <div className="success-message">
            <div className="success-icon">🎉</div>
            <p>We've prepared a WhatsApp message for the travel provider with all your details.</p>
          </div>

          {providerContact && (
            <div className="provider-info">
              <h3>📱 Provider Contact</h3>
              <div className="provider-details">
                <div><strong>Provider:</strong> {providerContact.businessName || 'N/A'}</div>
                <div><strong>WhatsApp:</strong> {providerContact.whatsappNumber || 'N/A'}</div>
                <div><strong>Response Time:</strong> {providerContact.responseTime || 'N/A'}</div>
              </div>
            </div>
          )}

          {isLoadingContact && (
            <div className="provider-info">
              <h3>🔄 Loading Provider Contact...</h3>
              <p>Fetching provider contact information...</p>
            </div>
          )}

          {!providerContact && !isLoadingContact && (
            <div className="provider-info error">
              <h3>⚠️ Provider Contact Information Missing</h3>
              <p>We're having trouble finding the provider's contact information.</p>
              
              <button 
                className="btn-secondary"
                onClick={handleRetryContact}
                style={{ marginTop: '10px' }}
              >
                Retry Contact Lookup
              </button>
              
              <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                <details>
                  <summary>Debug Information (Click to expand)</summary>
                  <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
                    {JSON.stringify({
                      packageSource: inquiryData?.data?.packageInfo?.packageSource,
                      mappedName: providerNameMap[inquiryData?.data?.packageInfo?.packageSource] || 
                                 inquiryData?.data?.packageInfo?.packageSource
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          <div className="whatsapp-actions">
            <button
              className="btn-whatsapp"
              onClick={handleWhatsAppClick}
              disabled={!providerContact?.whatsappNumber || isLoadingContact || !message}
            >
              {isLoadingContact ? '🔄 Loading...' : '💬 Contact via WhatsApp'}
            </button>

            <button
              className="btn-secondary"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Preview Message'}
            </button>

            <button
              className="btn-copy"
              onClick={copyMessage}
              title="Copy message to clipboard"
            >
              📋 Copy Message
            </button>
          </div>

          {showPreview && (
            <div className="message-preview">
              <div className="preview-header">
                <h4>📱 WhatsApp Message Preview</h4>
                <div className="preview-actions">
                  <button 
                    className="btn-small" 
                    onClick={regenerateMessage}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : '🔄 Regenerate'}
                  </button>
                  <button className="btn-small" onClick={copyMessage}>
                    📋 Copy
                  </button>
                </div>
              </div>
              
              <div className="message-content">
                <pre>{typeof message === 'string' ? message : JSON.stringify(message, null, 2)}</pre>
              </div>
              
              <div className="preview-note">
                💡 You can edit this message in WhatsApp before sending
              </div>
            </div>
          )}

          <div className="next-steps">
            <h4>🔄 What happens next?</h4>
            <ol>
              <li>Click "Contact via WhatsApp" to open WhatsApp with your message</li>
              <li>Review and edit the message if needed</li>
              <li>Send the message to the provider</li>
              <li>The provider will respond with detailed quotes and availability</li>
            </ol>
          </div>

          <div className="inquiry-form-actions">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn-primary"
              onClick={handleWhatsAppClick}
              disabled={!providerContact?.whatsappNumber || isLoadingContact}
            >
              {isLoadingContact ? '🔄 Loading...' : '💬 Contact Provider Now'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .success-message {
          text-align: center;
          margin-bottom: 24px;
          padding: 20px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
        }
        
        .success-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }
        
        .provider-info {
          margin-bottom: 24px;
          padding: 16px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .provider-info.error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        
        .provider-info h3 {
          margin: 0 0 12px 0;
          font-size: 1.1rem;
          color: #374151;
        }
        
        .provider-details div {
          margin-bottom: 4px;
          color: #6b7280;
        }
        
        .whatsapp-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .btn-whatsapp {
          flex: 1;
          background-color: #25d366;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-whatsapp:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .btn-primary:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .btn-whatsapp:hover {
          background-color: #22c55e;
        }

        .btn-copy {
          background-color: #6b7280;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-copy:hover {
          background-color: #4b5563;
        }
        
        .message-preview {
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .preview-header h4 {
          margin: 0;
          font-size: 1rem;
          color: #374151;
        }
        
        .preview-actions {
          display: flex;
          gap: 8px;
        }
        
        .btn-small {
          padding: 4px 8px;
          font-size: 0.8rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn-small:hover {
          background-color: #f3f4f6;
        }
        
        .message-content {
          padding: 16px;
          background-color: white;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .message-content pre {
          margin: 0;
          white-space: pre-wrap;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #374151;
        }
        
        .preview-note {
          padding: 8px 16px;
          background-color: #fef3c7;
          font-size: 0.8rem;
          color: #92400e;
        }
        
        .next-steps {
          margin-bottom: 24px;
          padding: 16px;
          background-color: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
        }
        
        .next-steps h4 {
          margin: 0 0 12px 0;
          color: #1e40af;
        }
        
        .next-steps ol {
          margin: 0;
          padding-left: 20px;
          color: #1e40af;
        }
        
        .next-steps li {
          margin-bottom: 4px;
        }
        
        @media (max-width: 768px) {
          .whatsapp-actions {
            flex-direction: column;
          }
          
          .preview-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppSuccessModal;