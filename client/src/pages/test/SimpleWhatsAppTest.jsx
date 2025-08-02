import React, { useState } from 'react';

const SimpleWhatsAppTest = () => {
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
    console.clear();
  };

  // Simple WhatsApp URL generation
  const generateWhatsAppUrl = (phoneNumber, message) => {
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      return `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
    } else {
      return `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
    }
  };

  // Test data
  const testProviders = [
    { name: 'AmiTravel', phone: '+60109243404' },
    { name: 'HolidayGoGo', phone: '+60102956786' },
    { name: 'Test Local', phone: '+60123456789' }
  ];

  const sampleMessage = `Hello! I'm interested in your travel package.

📦 Package: Langkawi Island Tour
💰 Price: RM 299 per person
📅 Dates: 15-17 March 2024
👥 Group: 2 Adults

Could you please provide more details?

Thank you!`;

  // Test functions
  const testUrlGeneration = (provider) => {
    addLog(`Testing URL generation for ${provider.name}...`, 'info');
    const url = generateWhatsAppUrl(provider.phone, sampleMessage);
    addLog(`Generated URL: ${url}`, 'success');
    return url;
  };

  const testDirectLink = (provider) => {
    addLog(`Testing direct link for ${provider.name}...`, 'info');
    const url = testUrlGeneration(provider);
    
    // Create and click a temporary link
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addLog(`Direct link clicked for ${provider.name}`, 'success');
  };

  const testWindowOpen = (provider) => {
    addLog(`Testing window.open for ${provider.name}...`, 'info');
    const url = testUrlGeneration(provider);
    
    try {
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        addLog(`Window.open successful for ${provider.name}`, 'success');
      } else {
        addLog(`Window.open blocked for ${provider.name}`, 'warning');
      }
    } catch (error) {
      addLog(`Window.open failed: ${error.message}`, 'error');
    }
  };

  const testWindowLocation = (provider) => {
    addLog(`Testing window.location for ${provider.name}...`, 'info');
    const url = testUrlGeneration(provider);
    
    if (window.confirm(`This will redirect the current page to WhatsApp. Continue?`)) {
      window.location.href = url;
    } else {
      addLog(`Window.location test cancelled`, 'warning');
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        addLog('Message copied to clipboard!', 'success');
        alert('Message copied to clipboard!');
      }).catch(() => {
        addLog('Clipboard copy failed', 'error');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      addLog('Message copied to clipboard (fallback method)', 'success');
      alert('Message copied to clipboard!');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple WhatsApp Test Page</h1>
      
      {/* Device Info */}
      <div style={{ background: '#f5f5f5', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>Device Information</h3>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        <p><strong>Is Mobile:</strong> {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}</p>
        <p><strong>Platform:</strong> {navigator.platform}</p>
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <h3>WhatsApp Test Methods</h3>
        {testProviders.map(provider => (
          <div key={provider.name} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h4>{provider.name} ({provider.phone})</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => testUrlGeneration(provider)}
                style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Generate URL
              </button>
              <button 
                onClick={() => testDirectLink(provider)}
                style={{ padding: '8px 16px', background: '#25d366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Direct Link
              </button>
              <button 
                onClick={() => testWindowOpen(provider)}
                style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Window.open
              </button>
              <button 
                onClick={() => testWindowLocation(provider)}
                style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Window.location
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Test */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e9ecef', borderRadius: '5px' }}>
        <h3>Manual Test</h3>
        <p>Copy this message and manually open WhatsApp:</p>
        <textarea 
          value={sampleMessage} 
          readOnly 
          style={{ width: '100%', height: '100px', marginBottom: '10px' }}
        />
        <button 
          onClick={() => copyToClipboard(sampleMessage)}
          style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Copy Message
        </button>
      </div>

      {/* Logs */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Test Logs</h3>
          <button 
            onClick={clearLogs}
            style={{ padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Logs
          </button>
        </div>
        <div style={{ height: '300px', overflow: 'auto', border: '1px solid #ddd', padding: '10px', background: '#f8f9fa' }}>
          {logs.length === 0 ? (
            <p style={{ color: '#6c757d' }}>No logs yet. Click a test button to start.</p>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: '5px', 
                  padding: '5px', 
                  borderRadius: '3px',
                  background: log.type === 'success' ? '#d4edda' : 
                             log.type === 'error' ? '#f8d7da' : 
                             log.type === 'warning' ? '#fff3cd' : '#d1ecf1',
                  color: log.type === 'success' ? '#155724' : 
                         log.type === 'error' ? '#721c24' : 
                         log.type === 'warning' ? '#856404' : '#0c5460'
                }}
              >
                <small>{log.timestamp}</small> - {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
        <h3>Instructions</h3>
        <ol>
          <li><strong>Generate URL:</strong> Creates WhatsApp URL and shows it in logs</li>
          <li><strong>Direct Link:</strong> Creates a temporary link and clicks it (most reliable)</li>
          <li><strong>Window.open:</strong> Uses window.open() method (may be blocked by popup blockers)</li>
          <li><strong>Window.location:</strong> Redirects current page to WhatsApp (will leave this page)</li>
          <li><strong>Copy Message:</strong> Copies the message to clipboard for manual sending</li>
        </ol>
        <p><strong>Note:</strong> If WhatsApp doesn't open, check the browser console for errors and try the manual copy method.</p>
      </div>
    </div>
  );
};

export default SimpleWhatsAppTest;
