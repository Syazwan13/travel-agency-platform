import React, { useState } from 'react';

const TelegramBotInfo = ({ className = "" }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  
  const botUsername = "Travelagencypackagesbot";
  const botUrl = `https://t.me/${botUsername}`;

  const handleBotAccess = () => {
    // Try to open in Telegram app first, fallback to web
    window.open(botUrl, '_blank');
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.58-.896 5.728-1.292 7.588-.168.789-.5.789-.818.789-.639 0-.896-.5-1.396-1.096-.5-.5-1.396-1.096-1.896-1.496-.5-.5-.5-1.096 0-1.596.5-.5 2.792-2.792 2.792-2.792s.168-.168-.168-.5c-.336-.332-.668 0-.668 0s-3.128 1.996-4.356 2.792c-.5.332-1.164.332-1.664 0-.5-.332-1.496-.664-2.124-.996-.628-.332-.628-.996 0-1.328.628-.332 6.292-2.624 6.292-2.624s2.624-1.164 2.624-1.164.5-.168.668 0c.168.168.168.5 0 .832z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🤖 Connect with our Telegram Bot
          </h3>
          <p className="text-gray-600 mb-3">
            Get instant notifications for password resets, account updates, and more!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              onClick={handleBotAccess}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.58-.896 5.728-1.292 7.588-.168.789-.5.789-.818.789-.639 0-.896-.5-1.396-1.096-.5-.5-1.396-1.096-1.896-1.496-.5-.5-.5-1.096 0-1.596.5-.5 2.792-2.792 2.792-2.792s.168-.168-.168-.5c-.336-.332-.668 0-.668 0s-3.128 1.996-4.356 2.792c-.5.332-1.164.332-1.664 0-.5-.332-1.496-.664-2.124-.996-.628-.332-.628-.996 0-1.328.628-.332 6.292-2.624 6.292-2.624s2.624-1.164 2.624-1.164.5-.168.668 0c.168.168.168.5 0 .832z"/>
              </svg>
              Open Telegram Bot
            </button>
            
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Connect
            </button>
          </div>

          {showInstructions && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-3">
              <h4 className="font-semibold text-gray-900 mb-3">📱 How to Connect:</h4>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-400 pl-4">
                  <h5 className="font-medium text-gray-800">Method 1: Direct Search</h5>
                  <ol className="list-decimal list-inside text-sm text-gray-600 mt-1 space-y-1">
                    <li>Open your Telegram app (mobile or desktop)</li>
                    <li>Search for: <code className="bg-gray-100 px-2 py-1 rounded">@{botUsername}</code></li>
                    <li>Click on the bot from search results</li>
                    <li>Press the "START" button</li>
                    <li>Send your email address to link your account</li>
                  </ol>
                </div>

                <div className="border-l-4 border-green-400 pl-4">
                  <h5 className="font-medium text-gray-800">Method 2: Web Link</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Click the "Open Telegram Bot" button above or visit:
                  </p>
                  <div className="mt-2 p-2 bg-gray-50 rounded border">
                    <code className="text-sm text-blue-600 break-all">{botUrl}</code>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h6 className="font-medium text-yellow-800">Note:</h6>
                      <p className="text-sm text-yellow-700 mt-1">
                        If you see a "scheme not registered" error, it means your browser can't open Telegram directly. 
                        Use Method 1 instead, or install Telegram app first.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-500">
            <strong>Bot Features:</strong> Password reset notifications, account linking, instant updates
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramBotInfo;